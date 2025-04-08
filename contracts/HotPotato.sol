// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Imports from your project’s libraries
import {ERC721ACQueryable, ERC721A, IERC721A} from "../external/misc/ERC721ACQueryable.sol";
import {SafeTransferLib} from "external/solady/src/utils/SafeTransferLib.sol";
import {ERC2981} from "../external/solady/src/tokens/ERC2981.sol";
import {Ownable} from "../external/solady/src/auth/Ownable.sol";
import "../external/creator-token-standards/src/access/OwnablePermissions.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract HotPotatoGame is ERC721ACQueryable, Ownable, ERC2981 {
    using Strings for uint256;

    // --- Sale & Mint Parameters ---
    uint256 public cost = 0.0069 ether;
    uint256 public maxSupply = 999;
    bool public isSaleActive = true;

    // --- Game State Variables ---
    bool public gameStarted;
    bool public gameEnded;
    // Current token holding the potato trait (by tokenId)
    uint256 public currentPotatoToken;
    // Global explosion chance (0 to 100)
    uint256 public explosionChance;
    uint256 public constant EXPLOSION_THRESHOLD = 100;

    // Timer variables: time (in seconds) allowed for a pass and last action timestamp.
    uint256 public timeoutDuration = 300; // e.g., 300 seconds (5 minutes)
    uint256 public lastActionTime; // timestamp when the potato was last assigned or passed

    // Mapping to mark exploded tokens (they are “out” and non-transferable)
    mapping(uint256 => bool) public exploded;
    // Array to keep track of active token IDs (tokens that have not exploded)
    uint256[] public activeTokenIds;
    // Per-owner count of active (non exploded) tokens
    mapping(address => uint256) public activeTokenCount;
    // When a wallet loses its last token, it is eliminated.
    mapping(address => bool) public eliminated;
    // Keep elimination order (first eliminated at index 0, etc.)
    address[] public eliminationOrder;

    // --- Bidding Variables ---
    bool public biddingActive = true;
    mapping(address => uint256) public bids;
    address[] public bidders;
    uint256 public bidPool;

    // --- Prize Distribution Wallets ---
    address public teamWallet;
    address public projectWallet;

    // --- Base URI for Metadata ---
    string public baseURI = "https://www.WEBSITE.xyz/api/tokens/";

    // --- Temporary const for randomness ---
    uint256 private _nonce;

    // --- Constructor ---
    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        address _teamWallet,
        address _projectWallet
    ) ERC721ACQueryable(_name, _symbol) {
        _initializeOwner(_owner);
        _setDefaultRoyalty(_owner, 500);
        teamWallet = _teamWallet;
        projectWallet = _projectWallet;
    }

    // --- Interface Override ---
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721ACQueryable, ERC2981)
        returns (bool)
    {
        return
            ERC721ACQueryable.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }

    // --- Mint Functions ---
    function mint(uint256 count) external payable {
        require(isSaleActive, "Sale is not active");
        require(totalSupply() + count <= maxSupply, "Minted out");
        require(count > 0, "Mint at least one token");

        // First NFT free per wallet (tracked via auxiliary storage)
        if (_getAux(msg.sender) == 0) {
            require(msg.value >= cost * (count - 1), "Insufficient Payment");
            _setAux(msg.sender, 1);
        } else {
            require(msg.value >= cost * count, "Insufficient Payment");
        }

        uint256 startId = totalSupply() + 1;
        _safeMint(msg.sender, count);

        // Add minted tokens to active tracking.
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = startId + i;
            activeTokenIds.push(tokenId);
            activeTokenCount[msg.sender] += 1;
        }
    }

    // --- Team Mint & Sale Admin ---
    function teamMint() external onlyOwner {
        _safeMint(msg.sender, 1);
        uint256 tokenId = totalSupply();
        activeTokenIds.push(tokenId);
        activeTokenCount[msg.sender] += 1;
    }

    function flipSale() external onlyOwner {
        isSaleActive = !isSaleActive;
    }

    function setBaseURI(string memory uri) external onlyOwner {
        baseURI = uri;
    }

    function _baseURI()
        internal
        view
        override(ERC721A)
        returns (string memory)
    {
        return baseURI;
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    // --- Game Control Functions ---

    /// @notice Start the game: ends bidding and randomly assigns the potato.
    function startGame() external onlyOwner {
        require(!gameStarted, "Game already started");
        require(totalSupply() > 0, "No tokens minted");
        gameStarted = true;
        biddingActive = false;
        explosionChance = 0;
        // Randomly choose one active token to hold the potato.
        currentPotatoToken = _getRandomActiveToken();
        lastActionTime = block.timestamp;
    }

    /// @notice Pass the potato trait to another token.
    /// The current potato holder must call this before the timer expires.
    function passPotato(uint256 _toTokenId) external {
        require(gameStarted, "Game not started");
        require(!gameEnded, "Game ended");
        require(
            block.timestamp <= lastActionTime + timeoutDuration,
            "Time expired; trigger timeout"
        );
        require(ownerOf(currentPotatoToken) == msg.sender, "Not potato holder");
        require(!exploded[_toTokenId], "Target token exploded");
        require(ownerOf(_toTokenId) != msg.sender, "Cannot pass to own token");

        // Increase explosion chance by a random increment between 5 and 15.
        uint256 randomIncrement = _randomInRange(5, 15);
        explosionChance += randomIncrement;
        if (explosionChance > EXPLOSION_THRESHOLD) {
            explosionChance = EXPLOSION_THRESHOLD;
        }

        // Roll a random number between 0 and 100.
        uint256 roll = _randomInRange(0, 100);
        if (roll < explosionChance) {
            // Explosion occurs.
            _explodeCurrentToken();
        } else {
            // Safe pass; update potato holder and timer.
            currentPotatoToken = _toTokenId;
            lastActionTime = block.timestamp;
        }
    }

    /// @notice Anyone can trigger a timeout if the current holder does not pass in time.
    function triggerTimeout() external {
        require(gameStarted, "Game not started");
        require(!gameEnded, "Game ended");
        require(
            block.timestamp > lastActionTime + timeoutDuration,
            "Timer not expired"
        );
        // The token auto–explodes.
        _explodeCurrentToken();
    }

    /// @dev Internal function to handle a token explosion, removal, and potato reassignment.
    function _explodeCurrentToken() internal {
        exploded[currentPotatoToken] = true;
        _removeActiveToken(currentPotatoToken);
        address holder = ownerOf(currentPotatoToken);
        activeTokenCount[holder] = activeTokenCount[holder] - 1;
        if (activeTokenCount[holder] == 0 && !eliminated[holder]) {
            eliminated[holder] = true;
            eliminationOrder.push(holder);
        }
        // Reset explosion chance.
        explosionChance = 0;

        // Reassign the potato if more than one active player remains.
        if (_activePlayerCount() > 1) {
            currentPotatoToken = _getRandomActiveToken();
            lastActionTime = block.timestamp;
        } else {
            gameEnded = true;
        }
    }

    // --- Internal Game Helpers ---

    /// @dev Returns a pseudo–random active tokenId.
    function _getRandomActiveToken() internal view returns (uint256) {
        require(activeTokenIds.length > 0, "No active tokens");
        uint256 index = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    _nonce,
                    activeTokenIds.length
                )
            )
        ) % activeTokenIds.length;
        return activeTokenIds[index];
    }

    /// @dev Returns a pseudo–random number in the range [min, max].
    function _randomInRange(uint256 min, uint256 max)
        internal
        returns (uint256)
    {
        _nonce++;
        uint256 randomResult = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    msg.sender,
                    _nonce
                )
            )
        ) % (max - min + 1);
        return randomResult + min;
    }

    /// @dev Remove a token from the activeTokenIds array.
    function _removeActiveToken(uint256 tokenId) internal {
        uint256 length = activeTokenIds.length;
        for (uint256 i = 0; i < length; i++) {
            if (activeTokenIds[i] == tokenId) {
                activeTokenIds[i] = activeTokenIds[length - 1];
                activeTokenIds.pop();
                break;
            }
        }
    }

    /// @dev Counts the number of unique active players.
    function _activePlayerCount() internal view returns (uint256 count) {
        address[] memory uniquePlayers = new address[](activeTokenIds.length);
        uint256 uniqueCount = 0;
        for (uint256 i = 0; i < activeTokenIds.length; i++) {
            address player = ownerOf(activeTokenIds[i]);
            bool alreadyCounted = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (uniquePlayers[j] == player) {
                    alreadyCounted = true;
                    break;
                }
            }
            if (!alreadyCounted) {
                uniquePlayers[uniqueCount] = player;
                uniqueCount++;
            }
        }
        return uniqueCount;
    }

    // --- Bidding Functions ---

    function placeBid() external payable {
        require(biddingActive, "Bidding is not active");
        require(msg.value > 0, "Send ETH to bid");
        bids[msg.sender] += msg.value;
        bidPool += msg.value;
        if (bids[msg.sender] == msg.value) {
            bidders.push(msg.sender);
        }
    }

    function endBidding() external onlyOwner {
        biddingActive = false;
    }

    // --- Prize Distribution ---

    function setDistributionWallets(address _team, address _project)
        external
        onlyOwner
    {
        teamWallet = _team;
        projectWallet = _project;
    }

    function distributePrizes() external onlyOwner {
        require(gameEnded, "Game not ended");
        uint256 pool = bidPool;
        require(pool > 0, "No funds to distribute");

        address firstWinner = ownerOf(
            activeTokenIds.length > 0 ? activeTokenIds[0] : currentPotatoToken
        );
        uint256 elimLen = eliminationOrder.length;
        address secondWinner = elimLen >= 1
            ? eliminationOrder[elimLen - 1]
            : address(0);
        address thirdWinner = elimLen >= 2
            ? eliminationOrder[elimLen - 2]
            : address(0);

        uint256 teamShare = (pool * 5) / 100;
        uint256 projectShare = (pool * 5) / 100;
        uint256 prizePool = pool - teamShare - projectShare;

        uint256 firstPrize;
        uint256 secondPrize;
        uint256 thirdPrize;
        if (secondWinner != address(0) && thirdWinner != address(0)) {
            firstPrize = (prizePool * 50) / 100;
            secondPrize = (prizePool * 30) / 100;
            thirdPrize = prizePool - firstPrize - secondPrize;
        } else if (secondWinner != address(0)) {
            firstPrize = (prizePool * 70) / 100;
            secondPrize = prizePool - firstPrize;
            thirdPrize = 0;
        } else {
            firstPrize = prizePool;
            secondPrize = 0;
            thirdPrize = 0;
        }

        SafeTransferLib.safeTransferETH(firstWinner, firstPrize);
        if (secondWinner != address(0)) {
            SafeTransferLib.safeTransferETH(secondWinner, secondPrize);
        }
        if (thirdWinner != address(0)) {
            SafeTransferLib.safeTransferETH(thirdWinner, thirdPrize);
        }
        SafeTransferLib.safeTransferETH(teamWallet, teamShare);
        SafeTransferLib.safeTransferETH(projectWallet, projectShare);

        bidPool = 0;
    }

    // --- Non-transferability for Exploded Tokens ---

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override(ERC721A, IERC721A) {
        require(!exploded[tokenId], "Exploded token is non-transferable");
        super.transferFrom(from, to, tokenId);
    }

    ///  @dev Throws if the sender is not the owner.
    // Inherited Function
    function _requireCallerIsContractOwner() internal view virtual override {
        _checkOwner();
    }
}
