//SPDX-License-Identifier: Unlicense

// In my smart cotnract when I only want the minting phase of the game state to only occur once. And once this passes this will never be called again. Also I want users to be able to put money in the smart contract when the game is in queued. This is a choice because at the end of the game the winner gets a percentage of the roundFunds. Please allow users to send money to the contract when the game state is in Queue. And add is to the roundFunds
pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "./Base64.sol";
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface MetadataHandler {
    function getTokenURI(
        uint16 id_,
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint32 generation_,
        uint8 potato_,
        bool burnt_
    ) external view returns (string memory);

    function getSVGInterface(
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint8 potato_
    ) external view returns (string memory);
}

struct Hand {
    bool hasPotato;
    uint32 generation;
    uint8 background;
    uint8 hand_type;
    uint8 potato;
    bool burnt;
}

enum GameState {
    Queued,
    Minting,
    Playing,
    Paused,
    Ended
}

contract UNKNOWN is ERC721A, ERC721AQueryable, ReentrancyGuard, Ownable {
    using Strings for uint256;

    MetadataHandler public metadataHandler;

    address public _owner;

    uint256 public TOTAL_PASSES;
    uint256 public potatoTokenId;
    uint32 public currentGeneration = 0;
    uint256 public price = 0.01 ether;
    uint256 public maxSupply = 1000;
    //Users will be able to mint 1 at initial mint then when the games begin people can list their hand if they want.
    uint256 public maxPerWallet = 1;
    uint256 public activeAddresses = 0;
    uint256 private _currentIndex = 1;
    bytes32 internal entropySauce;

    mapping(uint256 => Hand) public hands;
    mapping(address => bool) public hasMinted;
    mapping(address => uint256) public successfulPasses;
    mapping(address => uint256) public failedPasses;
    mapping(address => uint256) public totalWins;
    mapping(GameState => string) private gameStateStrings;
    mapping(address => uint256[]) public tokensOwnedByUser;
    mapping(address => uint256) public rewards;
    mapping(uint256 => uint256) public projectFunds;
    mapping(address => bool) private uniqueOwners;
    mapping(uint256 => uint256) public teamFunds;
    mapping(uint256 => uint256) public charityFunds;
    mapping(uint256 => uint256) public roundFunds;
    mapping(address => uint256) public addressActiveTokenCount;

    GameState internal gameState;
    GameState internal previousGameState;

    uint256[] public activeTokens;
    address[] public players;
    address[] public winners;

    event MintingStarted(string message);
    event PlayerReadyUp(address indexed player);
    event GameStarted(string message);
    event GamePaused(string message);
    event GameResumed(string message);
    event GameRestarted(string message);
    event PotatoExploded(uint256 tokenId, address player);
    event NewRound(uint256 round);
    event PotatoPassed(uint256 tokenIdFrom, uint256 tokenIdTo, address yielder);
    event PlayerWon(address indexed player);

    constructor() payable ERC721A("UNKNOWN", "UNKNOWN") Ownable(msg.sender) {
        activeTokens.push(0);
        gameState = GameState.Queued;
        gameStateStrings[GameState.Queued] = "Queued";
        gameStateStrings[GameState.Minting] = "Minting";
        gameStateStrings[GameState.Playing] = "Playing";
        gameStateStrings[GameState.Paused] = "Paused";
        gameStateStrings[GameState.Ended] = "Ended";
        _owner = msg.sender;
        _currentIndex = _startTokenId();
    }

    /*
 _______           __       __ __               ________                              __     __                            
|       \         |  \     |  \  \             |        \                            |  \   |  \                           
| ▓▓▓▓▓▓▓\__    __| ▓▓____ | ▓▓\▓▓ _______     | ▓▓▓▓▓▓▓▓__    __ _______   _______ _| ▓▓_   \▓▓ ______  _______   _______ 
| ▓▓__/ ▓▓  \  |  \ ▓▓    \| ▓▓  \/       \    | ▓▓__   |  \  |  \       \ /       \   ▓▓ \ |  \/      \|       \ /       \
| ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓▓▓\ ▓▓ ▓▓  ▓▓▓▓▓▓▓    | ▓▓  \  | ▓▓  | ▓▓ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓▓\▓▓▓▓▓▓ | ▓▓  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓▓
| ▓▓▓▓▓▓▓| ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓ ▓▓ ▓▓          | ▓▓▓▓▓  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓       | ▓▓ __| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓\▓▓    \ 
| ▓▓     | ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ ▓▓ ▓▓_____     | ▓▓     | ▓▓__/ ▓▓ ▓▓  | ▓▓ ▓▓_____  | ▓▓|  \ ▓▓ ▓▓__/ ▓▓ ▓▓  | ▓▓_\▓▓▓▓▓▓\
| ▓▓      \▓▓    ▓▓ ▓▓    ▓▓ ▓▓ ▓▓\▓▓     \    | ▓▓      \▓▓    ▓▓ ▓▓  | ▓▓\▓▓     \  \▓▓  ▓▓ ▓▓\▓▓    ▓▓ ▓▓  | ▓▓       ▓▓
 \▓▓       \▓▓▓▓▓▓ \▓▓▓▓▓▓▓ \▓▓\▓▓ \▓▓▓▓▓▓▓     \▓▓       \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓▓   \▓▓▓▓ \▓▓ \▓▓▓▓▓▓ \▓▓   \▓▓\▓▓▓▓▓▓▓ 
                                                                                                                                                                                                                                                 
*/

    function mintHand() external payable nonReentrant {
        require(gameState == GameState.Minting, "Game not minting");
        require(!hasMinted[msg.sender], "Only 1 per wallet");
        require(totalSupply() + 1 <= maxSupply, "Max supply reached");
        // decide on price :)

        _mintHand();

        hasMinted[msg.sender] = true;
        roundFunds[currentGeneration] += msg.value;
    }

    function passPotato(uint256 tokenIdTo) public {
        require(gameState == GameState.Playing, "Game not playing");
        require(!hands[tokenIdTo].burnt, "Target NFT is burnt");
        require(msg.sender != ownerOf(tokenIdTo), "Cannot pass potato to self");
        require(
            msg.sender == ownerOf(potatoTokenId),
            "You don't have the potato yet"
        );

        // Check Timer First

        // Do some VRF2 Logic here

        // If User Completes the pass before the timer and also the chance of the potato exploding
        uint256 newPotatoTokenId = tokenIdTo;
        hands[potatoTokenId].hasPotato = false;
        potatoTokenId = newPotatoTokenId;

        hands[potatoTokenId].hasPotato = true;

        TOTAL_PASSES += 1;
        successfulPasses[msg.sender] += 1;

        emit PotatoPassed(potatoTokenId, tokenIdTo, ownerOf(potatoTokenId));
    }

    function withdrawWinnersFunds() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No reward to claim");

        rewards[msg.sender] = 0; // Reset the reward to avoid reentrancy attacks

        // Send the funds to the user
        payable(msg.sender).transfer(reward);
    }

    function getGameState() public view returns (string memory) {
        return gameStateStrings[gameState];
    }

    function getPlayerStats(address player)
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            successfulPasses[player],
            failedPasses[player],
            totalWins[player]
        );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721A, IERC721A)
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        Hand memory hand = hands[tokenId];

        return
            metadataHandler.getTokenURI(
                uint16(tokenId),
                hand.background,
                hand.hand_type,
                hand.hasPotato,
                hand.generation,
                hand.potato,
                hand.burnt
            );
    }

    function getPotatoOwner() public view returns (address) {
        return ownerOf(potatoTokenId);
    }

    function getImageString(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        require(_exists(tokenId), "Not a valid pair of hands");

        Hand memory hand = hands[tokenId];

        return
            metadataHandler.getSVGInterface(
                hand.background,
                hand.hand_type,
                hand.hasPotato,
                hand.potato
            );
    }

    /* 
  ______                                               ________                              __     __                            
 /      \                                             |        \                            |  \   |  \                           
|  ▓▓▓▓▓▓\__   __   __ _______   ______   ______      | ▓▓▓▓▓▓▓▓__    __ _______   _______ _| ▓▓_   \▓▓ ______  _______   _______ 
| ▓▓  | ▓▓  \ |  \ |  \       \ /      \ /      \     | ▓▓__   |  \  |  \       \ /       \   ▓▓ \ |  \/      \|       \ /       \
| ▓▓  | ▓▓ ▓▓ | ▓▓ | ▓▓ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\    | ▓▓  \  | ▓▓  | ▓▓ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓▓\▓▓▓▓▓▓ | ▓▓  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓▓
| ▓▓  | ▓▓ ▓▓ | ▓▓ | ▓▓ ▓▓  | ▓▓ ▓▓    ▓▓ ▓▓   \▓▓    | ▓▓▓▓▓  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓       | ▓▓ __| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓\▓▓    \ 
| ▓▓__/ ▓▓ ▓▓_/ ▓▓_/ ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓▓▓▓ ▓▓          | ▓▓     | ▓▓__/ ▓▓ ▓▓  | ▓▓ ▓▓_____  | ▓▓|  \ ▓▓ ▓▓__/ ▓▓ ▓▓  | ▓▓_\▓▓▓▓▓▓\
 \▓▓    ▓▓\▓▓   ▓▓   ▓▓ ▓▓  | ▓▓\▓▓     \ ▓▓          | ▓▓      \▓▓    ▓▓ ▓▓  | ▓▓\▓▓     \  \▓▓  ▓▓ ▓▓\▓▓    ▓▓ ▓▓  | ▓▓       ▓▓
  \▓▓▓▓▓▓  \▓▓▓▓▓\▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓▓\▓▓           \▓▓       \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓▓   \▓▓▓▓ \▓▓ \▓▓▓▓▓▓ \▓▓   \▓▓\▓▓▓▓▓▓▓ 
                                                                                                                                                                                                                                                           
*/

    function startMint() external onlyOwner {
        gameState = GameState.Minting;
        currentGeneration += 1;
        emit NewRound(currentGeneration);
        emit MintingStarted("Minting");
    }

    function startGame() external onlyOwner {
        require(
            gameState == GameState.Minting || gameState == GameState.Queued,
            "Game already started"
        );

        // Reset activeAddresses to count current owners
        activeAddresses = 0;

        // Reset the uniqueOwners mapping
        for (
            uint256 tokenId = _startTokenId();
            tokenId < _nextTokenId();
            tokenId++
        ) {
            if (_exists(tokenId) && !hands[tokenId].burnt) {
                address owner = ownerOf(tokenId);
                uniqueOwners[owner] = false;
            }
        }

        uint256 uniqueOwnersCount = 0;

        // Iterate over all tokens
        for (
            uint256 tokenId = _startTokenId();
            tokenId < _nextTokenId();
            tokenId++
        ) {
            if (_exists(tokenId) && !hands[tokenId].burnt) {
                address owner = ownerOf(tokenId);
                if (!uniqueOwners[owner]) {
                    uniqueOwners[owner] = true;
                    uniqueOwnersCount++;
                }
            }
        }
        activeAddresses = uniqueOwnersCount;

        //Assign Potato to random Token with ChainLinkVRF2

        gameState = GameState.Playing;
        emit GameStarted("Playing");
    }

    function pauseGame() external onlyOwner {
        require(
            gameState == GameState.Playing || gameState == GameState.Minting,
            "Game not playing"
        );
        previousGameState = gameState;
        gameState = GameState.Paused;
        emit GamePaused("Paused");
    }

    function resumeGame() external onlyOwner {
        require(gameState == GameState.Paused, "Game not paused");
        if (previousGameState == GameState.Playing) {}
        gameState = previousGameState;
        previousGameState = GameState.Queued;
        emit GameResumed("The game has resumed");
    }

    function restartGame() external onlyOwner {
        require(
            gameState == GameState.Paused || gameState == GameState.Ended,
            "Game not paused or ended"
        );

        gameState = GameState.Queued;

        for (uint256 i = 0; i < players.length; i++) {
            uint256[] memory tokens = tokensOwnedByUser[players[i]];
            for (uint256 j = 0; j < tokens.length; j++) {
                hands[tokens[j]].burnt = true;
            }
        }

        potatoTokenId = 0;
        TOTAL_PASSES = 0;
        activeAddresses = 0;

        for (uint256 i = 0; i < players.length; i++) {
            addressActiveTokenCount[players[i]] = 0;
        }

        delete players;
        delete activeTokens; // Clear and reinitialize active tokens array
        roundFunds[currentGeneration] = 0;

        emit GameRestarted("Queued");
    }

    function setInventoryManager(address addy) external onlyOwner {
        metadataHandler = MetadataHandler(addy);
    }

    function withdrawCategoryFunds(uint256 round, string memory category)
        external
        onlyOwner
        nonReentrant
    {
        uint256 amount;
        if (
            keccak256(abi.encodePacked((category))) ==
            keccak256(abi.encodePacked(("project")))
        ) {
            amount = projectFunds[round];
            require(amount > 0, "No funds to withdraw");
            projectFunds[round] = 0;
            payable(msg.sender).transfer(amount);
            return;
        } else if (
            keccak256(abi.encodePacked((category))) ==
            keccak256(abi.encodePacked(("team")))
        ) {
            amount = teamFunds[round];
            require(amount > 0, "No funds to withdraw");
            teamFunds[round] = 0;

            address nonPayableAddr1 = 0x41447b831CBbffb74883eFF27FC5AaA13BE3CA52;
            address nonPayableAddr2 = 0x57b18277B530Fa0C1748C29F9b1887B7691FF701;

            address payable teamMember1 = payable(nonPayableAddr1);
            address payable teamMember2 = payable(nonPayableAddr2);

            uint256 halfAmount = amount / 2;

            teamMember1.transfer(halfAmount);
            teamMember2.transfer(halfAmount);

            return;
        } else if (
            keccak256(abi.encodePacked((category))) ==
            keccak256(abi.encodePacked(("charity")))
        ) {
            amount = charityFunds[round];
            require(amount > 0, "No funds to withdraw");
            charityFunds[round] = 0;

            payable(0x376e50f9036D29038b8aC9Bc12C2E9CF9418d451).transfer(
                amount
            );
            return;
        } else {
            revert("Invalid category");
        }
    }

    /*
 ______            __                                         __      ________                              __     __                            
|      \          |  \                                       |  \    |        \                            |  \   |  \                           
 \▓▓▓▓▓▓_______  _| ▓▓_    ______   ______  _______   ______ | ▓▓    | ▓▓▓▓▓▓▓▓__    __ _______   _______ _| ▓▓_   \▓▓ ______  _______   _______ 
  | ▓▓ |       \|   ▓▓ \  /      \ /      \|       \ |      \| ▓▓    | ▓▓__   |  \  |  \       \ /       \   ▓▓ \ |  \/      \|       \ /       \
  | ▓▓ | ▓▓▓▓▓▓▓\\▓▓▓▓▓▓ |  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\ \▓▓▓▓▓▓\ ▓▓    | ▓▓  \  | ▓▓  | ▓▓ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓▓\▓▓▓▓▓▓ | ▓▓  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓▓
  | ▓▓ | ▓▓  | ▓▓ | ▓▓ __| ▓▓    ▓▓ ▓▓   \▓▓ ▓▓  | ▓▓/      ▓▓ ▓▓    | ▓▓▓▓▓  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓       | ▓▓ __| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓\▓▓    \ 
 _| ▓▓_| ▓▓  | ▓▓ | ▓▓|  \ ▓▓▓▓▓▓▓▓ ▓▓     | ▓▓  | ▓▓  ▓▓▓▓▓▓▓ ▓▓    | ▓▓     | ▓▓__/ ▓▓ ▓▓  | ▓▓ ▓▓_____  | ▓▓|  \ ▓▓ ▓▓__/ ▓▓ ▓▓  | ▓▓_\▓▓▓▓▓▓\
|   ▓▓ \ ▓▓  | ▓▓  \▓▓  ▓▓\▓▓     \ ▓▓     | ▓▓  | ▓▓\▓▓    ▓▓ ▓▓    | ▓▓      \▓▓    ▓▓ ▓▓  | ▓▓\▓▓     \  \▓▓  ▓▓ ▓▓\▓▓    ▓▓ ▓▓  | ▓▓       ▓▓
 \▓▓▓▓▓▓\▓▓   \▓▓   \▓▓▓▓  \▓▓▓▓▓▓▓\▓▓      \▓▓   \▓▓ \▓▓▓▓▓▓▓\▓▓     \▓▓       \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓▓   \▓▓▓▓ \▓▓ \▓▓▓▓▓▓ \▓▓   \▓▓\▓▓▓▓▓▓▓ 
                                                                                                                                                 
*/

    function _mintHand() internal returns (uint64 id) {
        uint8 background;
        uint8 hand_type;

        uint256 seventyPct = (type(uint64).max / 100) * 70;
        uint256 ninetyPct = (type(uint64).max / 100) * 90;

        id = uint64(_nextTokenId());

        uint64 randBackground = uint64(_rarity(_rand(), "BACKGROUND", id));
        background = uint8(
            randBackground >= ninetyPct
                ? (randBackground % 3) + 18 //Legendary 18-20
                : randBackground >= seventyPct
                ? (randBackground % 6) + 12 //Rare 12-17
                : (randBackground % 11) + 1 //Common 1-11
        );

        uint64 randHandType = uint64(_rarity(_rand(), "HAND_TYPE", id));
        hand_type = uint8(
            randHandType >= ninetyPct
                ? (randHandType % 5) + 46 //Legendary 46-50
                : randHandType >= seventyPct
                ? (randHandType % 15) + 31 //Rare 31-45
                : (randHandType % 30) + 1 //Common 1-30
        );

        _safeMint(msg.sender, 1);
        activeTokens.push(id);

        activeAddresses += 1;
        players.push(msg.sender);

        addressActiveTokenCount[msg.sender] += 1;
        tokensOwnedByUser[msg.sender].push(id);

        hands[uint256(id)] = Hand({
            hasPotato: false,
            generation: currentGeneration,
            background: background,
            hand_type: hand_type,
            potato: uint8(1),
            burnt: false
        });

        return id;
    }

    function _rarity(
        uint256 rand,
        string memory val,
        uint256 heat
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encode(rand, val, heat)));
    }

    function _rand() internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        msg.sender,
                        block.timestamp,
                        block.basefee,
                        block.timestamp,
                        entropySauce
                    )
                )
            );
    }

    function assignPotato() internal {
        // ChainLinkVRF2 Logic to assign a active token the potato
    }

    function _isTokenActive(uint256 tokenId) public view returns (bool) {
        if (!hands[tokenId].burnt) {
            return false;
        }
        return false;
    }

    function processExplosion() internal {
        require(gameState == GameState.Playing, "Game not playing");

        address failedPlayer = ownerOf(potatoTokenId);
        failedPasses[failedPlayer] += 1;

        // 2. Remove the potato from the exploded NFT & set Burn trait
        hands[potatoTokenId].hasPotato = false;

        // 3. Remove the exploded NFT from the activeTokens array
        hands[potatoTokenId].burnt = true;

        // 4. Emit an event to notify that the potato exploded and get ready to assign potato to a rand tokenId
        emit PotatoExploded(potatoTokenId, failedPlayer);

        // ChainLinkVRF2 Logic here

        // Decrease the count of active tokens for the failed player
        addressActiveTokenCount[failedPlayer] -= 1;

        // Check if the failed player owns any active (not burnt) tokens
        bool hasActiveTokens = false;
        uint256[] memory tokens = tokensOwnedByUser[failedPlayer];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (!hands[tokens[i]].burnt) {
                hasActiveTokens = true;
                break;
            }
        }

        // If the failed player has no more active tokens, decrease the count of active addresses
        if (!hasActiveTokens) {
            activeAddresses -= 1;
        }
        // 5. Check if the game should move to the final round or end
        if (activeAddresses == 1) {
            gameState = GameState.Ended;
            emit PlayerWon(ownerOf(activeTokens[1]));
            winners.push(ownerOf(activeTokens[1]));
            totalWins[ownerOf(activeTokens[1])] += 1;
            rewards[ownerOf(activeTokens[1])] +=
                (roundFunds[currentGeneration] * 4) /
                10;
            projectFunds[currentGeneration] +=
                (roundFunds[currentGeneration] * 1) /
                10;
            teamFunds[currentGeneration] +=
                (roundFunds[currentGeneration] * 3) /
                10;
            charityFunds[currentGeneration] +=
                (roundFunds[currentGeneration] * 2) /
                10;
        } else {
            assignPotato();
        }
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
