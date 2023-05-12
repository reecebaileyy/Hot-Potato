//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";

contract UNKNOWN is
    Ownable,
    ERC721A,
    ERC721AQueryable,
    PaymentSplitter,
    ReentrancyGuard
{
    using Strings for uint256;

    bool private explosionTimeInitialized = false;
    uint256 public constant INITIAL_POTATO_EXPLOSION_DURATION = 2 minutes;
    uint256 public constant DECREASE_INTERVAL = 10;
    uint256 public constant DECREASE_DURATION = 5 seconds;
    uint256 private FINAL_POTATO_EXPLOSION_DURATION = 10 minutes;
    uint256 public EXPLOSION_TIME;
    uint256 public TOTAL_PASSES;
    bool private _isExplosionInProgress = false;
    uint256 private _price = 0 ether;
    uint256 public _maxsupply = 10000;
    uint256 public _maxperwallet = 3;
    uint256 private _currentIndex = 1;
    address private _owner;

    enum GameState {
        Queued,
        Minting,
        Playing,
        Paused,
        FinalRound,
        Ended
    }

    struct TokenTraits {
        bool hasPotato;
        // Add any other traits you want to track here
    }

    mapping(uint256 => TokenTraits) public tokenTraits;
    mapping(address => uint256) public tokensMintedPerRound;
    mapping(uint256 => uint256) public successfulPasses;
    mapping(GameState => string) private gameStateStrings;

    GameState internal gameState;
    GameState internal previousGameState;

    uint256[] public activeTokens;
    uint256 public potatoTokenId;

    event GameStarted();
    event GamePaused();
    event GameRestarted();
    event PotatoExploded(uint256 tokenId);
    event PotatoPassed(uint256 tokenIdFrom, uint256 tokenIdTo);

    constructor()
        payable
        PaymentSplitter(_payees, _shares)
        ERC721A("UNKNOWN", "UNKNOWN")
    {
        gameStateStrings[GameState.Queued] = "Queued";
        gameStateStrings[GameState.Minting] = "Minting";
        gameStateStrings[GameState.Playing] = "Playing";
        gameStateStrings[GameState.Paused] = "Paused";
        gameStateStrings[GameState.FinalRound] = "Final Round";
        gameStateStrings[GameState.Ended] = "Ended";
        gameState = GameState.Queued;
        _owner = msg.sender;
        _currentIndex = _startTokenId();
    }

    /* <------ PUBLIC FUNCTIONS -------> */

    function mintHand(uint256 count) external payable nonReentrant {
        require(gameState == GameState.Minting, "Game not minting");
        require(msg.value >= count * _price, "Must send at least 0.01 ETH");
        require(
            tokensMintedPerRound[msg.sender] + count <= _maxperwallet,
            "Exceeded maximum tokens per round"
        );
        require(totalSupply() < _maxsupply, "Max NFTs minted");
        require(count > 0, "Must mint at least one NFT");

        // LOOP THROUGH THE COUNT AND MINT THE TOKENS WHILE ASSIGNING THE POTATO AS FALSE
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _nextTokenId();
            activeTokens.push(tokenId);
            _safeMint(msg.sender, 1);
            tokenTraits[tokenId] = TokenTraits({hasPotato: false});
        }

        tokensMintedPerRound[msg.sender] += count;
    }

    function passPotato(uint256 tokenIdFrom, uint256 tokenIdTo) external {
        require(gameState == GameState.Playing, "Game not playing");
        require(msg.sender == ownerOf(tokenIdFrom), "Not owner or approved");
        require(block.timestamp < EXPLOSION_TIME, "Potato exploded");
        require(tokenIdFrom != tokenIdTo, "Cannot pass potato to the same NFT");
        require(_exists(tokenIdTo), "Target NFT does not exist");
        require(msg.sender != ownerOf(tokenIdTo), "Cannot pass potato to self");
        require(
            tokenIdFrom == potatoTokenId,
            "NFT does not have the hot potato"
        );

        potatoTokenId = tokenIdTo;
        TOTAL_PASSES += 1;
        successfulPasses[tokenIdFrom] += 1;

        checkAndProcessExplosion(); // Keep this line to check and process the explosion after passing the potato
        emit PotatoPassed(tokenIdFrom, tokenIdTo);
    }

    function getGameState() public view returns (string memory) {
        return gameStateStrings[gameState];
    }

    /* <------ OWNER ONLY FUNCTIONS -------> */

    function startGame() external onlyOwner {
        require(
            gameState == GameState.Ended ||
                gameState == GameState.Paused ||
                gameState == GameState.Queued,
            "Game already started"
        );
        gameState = GameState.Minting;
        emit GameStarted();
    }

    function endMinting() external onlyOwner {
        require(gameState == GameState.Minting, "Game not minting");
        gameState = GameState.Playing;
        updateExplosionTimer(); // Add this line to initialize the explosion timer

        // Find the first active token and assign it as the potato
        uint256 tokenId = _findFirstActiveToken();
        require(tokenId != 0, "No active tokens found");
        assignPotato(tokenId);
    }

    function pauseGame() external onlyOwner {
        require(
            gameState == GameState.Playing ||
                gameState == GameState.FinalRound ||
                gameState == GameState.Minting,
            "Game not playing"
        );
        previousGameState = gameState;
        gameState = GameState.Paused;
        emit GamePaused();
    }

    function resumeGame() external onlyOwner {
        require(gameState == GameState.Paused, "Game not paused");
        gameState = previousGameState;
    }

    function restartGame() external onlyOwner {
        require(
            gameState == GameState.Paused || gameState == GameState.Ended,
            "Game not paused or ended"
        );
        gameState = GameState.Queued;

        // Reset tokens minted by each user in the round
        for (uint256 i = 0; i < activeTokens.length; i++) {
            address tokenOwner = ownerOf(activeTokens[i]);
            tokensMintedPerRound[tokenOwner] = 0;
        }

        // Clear the activeTokens array and remove the potato token
        delete activeTokens;
        delete tokenTraits[potatoTokenId];
        potatoTokenId = 0;
        TOTAL_PASSES = 0;

        for (uint256 i = 0; i < _currentIndex; i++) {
            successfulPasses[i] = 0;
        }

        emit GameRestarted();
    }

    /* <------ INTERNAL FUNCTIONS -------> */

    function assignPotato(uint256 tokenId) internal {
        // Remove the potato from the current holder, if any
        if (potatoTokenId != 0) {
            tokenTraits[potatoTokenId].hasPotato = false;
        }
        // Assign the potato trait to the desired token
        require(_exists(tokenId), "Token does not exist");
        require(_isTokenActive(tokenId), "Token is not active");
        potatoTokenId = tokenId;
        tokenTraits[potatoTokenId].hasPotato = true;
    }

    function _findFirstActiveToken() internal view returns (uint256) {
        for (uint256 i = 0; i < activeTokens.length; i++) {
            if (_isTokenActive(activeTokens[i])) {
                return activeTokens[i];
            }
        }
        return 0;
    }

    function _isTokenActive(uint256 tokenId) internal view returns (bool) {
        for (uint256 i = 0; i < activeTokens.length; i++) {
            if (activeTokens[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    function checkAndProcessExplosion() internal {
        if (_isExplosionInProgress && block.timestamp >= EXPLOSION_TIME) {
            processExplosion();
        }
    }

    function updateExplosionTimer() internal {
        // Calculate the current explosion duration based on the total number of passes
        uint256 currentDuration = INITIAL_POTATO_EXPLOSION_DURATION -
            (TOTAL_PASSES / DECREASE_INTERVAL) *
            DECREASE_DURATION;

        // Ensure that the duration does not go below 15 seconds
        uint256 minimumDuration = 15 seconds;
        if (currentDuration < minimumDuration) {
            currentDuration = minimumDuration;
        }

        // Initialize the EXPLOSION_TIME if it's not initialized yet
        if (!explosionTimeInitialized) {
            EXPLOSION_TIME = block.timestamp + currentDuration;
            explosionTimeInitialized = true;
        } else {
            // Update the EXPLOSION_TIME
            EXPLOSION_TIME = block.timestamp + currentDuration;
        }

        _isExplosionInProgress = true;
    }

    function processExplosion() internal {
        require(gameState == GameState.Playing, "Game not playing");

        // 1. Remove the potato from the exploded NFT
        tokenTraits[potatoTokenId].hasPotato = false;

        // 2. Remove the exploded NFT from the activeTokens array
        uint256 indexToRemove = _indexOfTokenInActiveTokens(potatoTokenId);
        _removeTokenFromActiveTokensByIndex(indexToRemove);

        // 3. Emit an event to notify that the potato exploded
        emit PotatoExploded(potatoTokenId);

        // 4. Check if the game should move to the final round or end
        if (activeTokens.length == 1) {
            gameState = GameState.FinalRound;
            // Assign the potato to the last remaining NFT
            assignPotato(activeTokens[0]);
        } else if (activeTokens.length == 0) {
            gameState = GameState.Ended;
            // No more NFTs, game over
        } else {
            // 5. Update the explosion timer if the game is still in the playing state
            updateExplosionTimer();
            assignPotato(0); // TODO: IMPLEMENT LOGIC FOR ASSIGNING POTATO
        }

        _isExplosionInProgress = false;
    }

    function _indexOfTokenInActiveTokens(uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < activeTokens.length; i++) {
            if (activeTokens[i] == tokenId) {
                return i;
            }
        }
        revert("Token not found in activeTokens");
    }

    function _removeTokenFromActiveTokensByIndex(uint256 index) internal {
        require(index < activeTokens.length, "Invalid index");
        activeTokens[index] = activeTokens[activeTokens.length - 1];
        activeTokens.pop();
    }

    function checkExplosion() external {
        require(gameState == GameState.Playing, "Game not playing");
        if (block.timestamp >= EXPLOSION_TIME) {
            processExplosion();
        }
    }

    // TODO: Implement logic for determining the winners and distributing rewards
    uint256[] private _shares = [100];
    address[] private _payees = [0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F];

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
