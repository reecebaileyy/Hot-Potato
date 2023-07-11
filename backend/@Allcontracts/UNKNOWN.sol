//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "./Base64.sol";
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

interface MetadataHandler {
    function getTokenURI(
        uint16 id_,
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint32 generation_,
        bool isActive_,
        uint8 potato_
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
    bool isActive;
    uint8 background;
    uint8 hand_type;
    uint8 potato;
}

enum GameState {
    Queued,
    Minting,
    Playing,
    Paused,
    FinalRound,
    Ended
}

struct RequestStatus {
    uint256[] randomWord;
    bool fulfilled;
    bool exists;
}

contract UNKNOWN is
    ERC721A,
    ERC721AQueryable,
    ReentrancyGuard,
    VRFConsumerBaseV2,
    ConfirmedOwner
{
    using Strings for uint256;

    MetadataHandler public metadataHandler;

    address public _owner;

    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    uint32 callbackGasLimit = 2500000;
    uint64 s_subscriptionId;

    bool private explosionTimeInitialized = false;
    bool private _isExplosionInProgress = false;

    uint256 public constant INITIAL_POTATO_EXPLOSION_DURATION = 60 seconds; //CHANGE THIS LATER
    uint256 public constant DECREASE_INTERVAL = 10;
    uint256 public constant DECREASE_DURATION = 5 seconds;
    uint256 public TOTAL_PASSES;
    uint256 public potatoTokenId;
    uint256 public lastRequestId;
    uint32 public currentGeneration = 0;
    uint256 public _price = 0.01 ether;
    uint256 public _maxsupplyPerRound = 10000;
    uint256 public _maxperwallet = 3;
    uint256 public roundMints = 0;
    uint256 public activeAddresses = 0;
    uint256 internal _secondsLeft;

    uint256 private FINAL_POTATO_EXPLOSION_DURATION = 10 minutes;
    uint256 private remainingTime;
    uint256 private _currentIndex = 1;

    uint256 internal EXPLOSION_TIME;
    uint256 internal currentRandomWord;

    bytes32 internal entropySauce;
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    mapping(uint256 => Hand) public hands;
    mapping(address => mapping(uint256 => uint256)) public tokensMintedPerRound;
    mapping(address => bool) private isPlayer;
    mapping(address => uint256) public successfulPasses;
    mapping(address => uint256) public failedPasses;
    mapping(address => uint256) public totalWins;
    mapping(uint256 => address) public hallOfFame;
    mapping(uint256 => RequestStatus) public statuses;
    mapping(address => uint256[]) public tokensOwnedByUser;
    mapping(GameState => string) private gameStateStrings;
    mapping(address => uint256) public rewards;
    mapping(uint256 => uint256) public projectFunds;
    mapping(uint256 => uint256) public teamFunds;
    mapping(uint256 => uint256) public charityFunds;
    mapping(uint256 => uint256) public roundFunds;
    mapping(address => uint256) public addressActiveTokenCount;
    mapping(address => bool) public activePlayers;

    VRFCoordinatorV2Interface COORDINATOR;

    GameState internal gameState;
    GameState internal previousGameState;

    uint256[] public activeTokens;
    uint256[] public requestIds;
    address[] public players;
    address[] public winners;

    event GameStarted(string message);
    event MintingEnded(string message);
    event GamePaused(string message);
    event GameResumed(string message);
    event GameRestarted(string message);
    event FinalRoundStarted(string message);
    event PotatoExploded(uint256 tokenId);
    event NewRound(uint256 round);
    event HandsActivated(uint256 count);
    event UpdatedTimer(uint256 time);
    event PotatoPassed(uint256 tokenIdFrom, uint256 tokenIdTo, address yielder);
    event PotatoObtained(address hotHands, uint256 tokenId);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event FailedPass(address indexed player);
    event SuccessfulPass(address indexed player);
    event PlayerWon(address indexed player);
    event PotatoMinted(
        uint32 amount,
        address indexed player,
        uint256 indexed tokenId
    );

    constructor(uint64 subscriptionId)
        payable
        ERC721A("UNKNOWN", "UNKNOWN")
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
    {
        activeTokens.push(0);
        gameStateStrings[GameState.Queued] = "Queued";
        gameStateStrings[GameState.Minting] = "Minting";
        gameStateStrings[GameState.Playing] = "Playing";
        gameStateStrings[GameState.Paused] = "Paused";
        gameStateStrings[GameState.FinalRound] = "Final Stage";
        gameStateStrings[GameState.Ended] = "Ended";
        gameState = GameState.Queued;
        _owner = msg.sender;
        _currentIndex = _startTokenId();
        COORDINATOR = VRFCoordinatorV2Interface(
            0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
        );
        s_subscriptionId = subscriptionId;
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

    function mintHand(uint256 count) external payable nonReentrant {
        require(gameState == GameState.Minting, "Game not minting");
        // require(msg.value >= count * _price, "Must send at least 1 MATIC");
        // require(
        //     tokensMintedPerRound[msg.sender][currentGeneration] + count <=
        //         _maxperwallet,
        //     "Exceeded maximum tokens per round"
        // );
        // require(roundMints < _maxsupplyPerRound, "Max NFTs minted");
        require(count > 0, "Must mint at least one NFT");

        uint32 amount = 0;

        for (uint256 i = 0; i < count; i++) {
            amount++;
            uint64 newTokenId = _mintHand();
            emit PotatoMinted(amount, msg.sender, newTokenId);
        }

        if (!isPlayer[msg.sender]) {
            isPlayer[msg.sender] = true;
        }

        roundMints += count;
        tokensMintedPerRound[msg.sender][currentGeneration] += count;
        roundFunds[currentGeneration] += msg.value;
    }

    function passPotato(uint256 tokenIdTo) public {
        require(
            gameState == GameState.Playing || gameState == GameState.FinalRound,
            "Game not playing"
        );
        require(_isTokenActive(tokenIdTo), "Target NFT does not exist");
        require(msg.sender != ownerOf(tokenIdTo), "Cannot pass potato to self");
        require(
            msg.sender == ownerOf(potatoTokenId),
            "You don't have the potato yet"
        );

        if (block.timestamp >= EXPLOSION_TIME) {
            // Call the function to process explosion
            processExplosion();
            emit FailedPass(msg.sender);
        } else {
            uint256 tokenIdFrom;
            uint256[] memory ownedTokens = tokensOwnedByUser[msg.sender];
            for (uint256 i = 0; i < ownedTokens.length; i++) {
                if (hands[ownedTokens[i]].hasPotato) {
                    tokenIdFrom = ownedTokens[i];
                    break;
                }
            }

            uint256 newPotatoTokenId = tokenIdTo;
            hands[potatoTokenId].hasPotato = false;
            potatoTokenId = newPotatoTokenId;

            hands[potatoTokenId].hasPotato = true;
            emit PotatoObtained(ownerOf(potatoTokenId), potatoTokenId);

            TOTAL_PASSES += 1;
            successfulPasses[msg.sender] += 1;
            emit SuccessfulPass(msg.sender);

            checkAndProcessExplosion();
            emit PotatoPassed(tokenIdFrom, tokenIdTo, ownerOf(potatoTokenId));
        }
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

    function getActiveTokenCount(address user) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < activeTokens.length; i++) {
            if (ownerOf(activeTokens[i]) == user) {
                count++;
            }
        }
        return count;
    }

    function getExplosionTime() public view returns (uint256) {
        if (block.timestamp >= EXPLOSION_TIME) {
            return 0;
        } else {
            return EXPLOSION_TIME - block.timestamp;
        }
    }

    function getAllWinners() public view returns (address[] memory) {
        return winners;
    }

    function getActiveTokensOfOwner(address user)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory ownedActiveTokens = new uint256[](activeTokens.length);
        uint256 counter = 0;
        for (uint256 index = 1; index < activeTokens.length; index++) {
            uint256 tokenId = activeTokens[index];
            if (ownerOf(tokenId) == user) {
                ownedActiveTokens[counter] = tokenId;
                counter++;
            }
        }
        uint256[] memory result = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            result[i] = ownedActiveTokens[i];
        }
        return result;
    }

    function checkExplosion() public {
        require(
            gameState == GameState.Playing || gameState == GameState.FinalRound,
            "Game not playing"
        );
        require(
            getExplosionTime() == 0,
            "Still got more time to pass the potato"
        );

        if (block.timestamp >= EXPLOSION_TIME) {
            processExplosion();
        }
    }

    function userHasPotatoToken(address user) public view returns (bool) {
        uint256[] memory ownedTokens = tokensOwnedByUser[user];
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (hands[ownedTokens[i]].hasPotato) {
                return true;
            }
        }
        return false;
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

    function getActiveTokens() public view returns (uint256) {
        return activeTokens.length - 1;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721A)
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
                hand.isActive,
                hand.potato
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

    function getActiveTokenIds() public view returns (uint256[] memory) {
        require(activeTokens.length > 0, "No active tokens.");

        uint256[] memory allTokenIds = new uint256[](activeTokens.length);
        for (uint256 i = 0; i < activeTokens.length; i++) {
            allTokenIds[i] = activeTokens[i];
        }
        return (allTokenIds);
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

    function startGame() external onlyOwner {
        require(
            gameState == GameState.Ended || gameState == GameState.Queued,
            "Game already started"
        );
        gameState = GameState.Minting;
        currentGeneration += 1;
        emit NewRound(currentGeneration);
        emit GameStarted("Minting");
    }

    function endMinting() external onlyOwner {
        require(gameState == GameState.Minting, "Game not minting");
        randomize();
    }

    function pauseGame() external onlyOwner {
        require(
            gameState == GameState.Playing ||
                gameState == GameState.FinalRound ||
                gameState == GameState.Minting,
            "Game not playing"
        );
        remainingTime = EXPLOSION_TIME;
        previousGameState = gameState;
        gameState = GameState.Paused;
        emit GamePaused("Paused");
    }

    function resumeGame() external onlyOwner {
        require(gameState == GameState.Paused, "Game not paused");
        if (
            previousGameState == GameState.Playing ||
            previousGameState == GameState.FinalRound
        ) {
            EXPLOSION_TIME = remainingTime;
            emit UpdatedTimer(remainingTime);
        }
        gameState = previousGameState;
        emit GameResumed("The game has resumed");
    }

    function restartGame() external onlyOwner {
        require(
            gameState == GameState.Paused || gameState == GameState.Ended,
            "Game not paused or ended"
        );
        gameState = GameState.Queued;
        // Clear the activeTokens array and remove the potato token
        delete activeTokens;
        roundMints = 0;
        delete hands[potatoTokenId];
        potatoTokenId = 0;
        TOTAL_PASSES = 0;
        activeAddresses = 0;

        for (uint256 i = 0; i < players.length; i++) {
            addressActiveTokenCount[players[i]] = 0;
            isPlayer[players[i]] = false;
        }

        delete players;
        activeTokens.push(0);
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

            // Addresses to which you want to send the funds
            address nonPayableAddr1 = 0x41447b831CBbffb74883eFF27FC5AaA13BE3CA52;
            address nonPayableAddr2 = 0x57b18277B530Fa0C1748C29F9b1887B7691FF701;

            // Convert them to payable addresses
            address payable teamMember1 = payable(nonPayableAddr1);
            address payable teamMember2 = payable(nonPayableAddr2);

            // Split the amount
            uint256 halfAmount = amount / 2;

            // Send funds to the addresses
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

            // Send funds to the charity address
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

        // Helpers to get Percentages
        uint256 fortyPct = (type(uint64).max / 100) * 40;
        uint256 seventyPct = (type(uint64).max / 100) * 70;

        id = uint64(_nextTokenId());

        // Getting Random traits
        uint64 randBackground = uint64(_rarity(_rand(), "BACKGROUND", id));
        background = uint8(
            randBackground >= seventyPct
                ? (randBackground % 3) + 18 //Legendary 18-20
                : randBackground >= fortyPct
                ? (randBackground % 6) + 12 //Rare 12-17
                : (randBackground % 11) + 1 //Common 1-11
        );

        uint64 randHandType = uint64(_rarity(_rand(), "HAND_TYPE", id));
        hand_type = uint8(
            randHandType >= seventyPct
                ? (randHandType % 7) + 35 //Legendary 35-41
                : randHandType >= fortyPct
                ? (randHandType % 10) + 26 //Rare 26-35
                : (randHandType % 25) + 1 //Common 1-25
        );

        _safeMint(msg.sender, 1);
        activeTokens.push(id);

        if (addressActiveTokenCount[msg.sender] == 0) {
            activeAddresses += 1;
            players.push(msg.sender);
        }
        addressActiveTokenCount[msg.sender] += 1;
        tokensOwnedByUser[msg.sender].push(id);

        hands[uint256(id)] = Hand({
            hasPotato: false,
            generation: currentGeneration,
            isActive: true,
            background: background,
            hand_type: hand_type,
            potato: uint8(1)
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

    function randomize() public onlyOwner returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        statuses[requestId] = RequestStatus({
            randomWord: new uint256[](0),
            fulfilled: false,
            exists: true
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        require(statuses[requestId].exists, "request not found");
        statuses[requestId].fulfilled = true;
        statuses[requestId].randomWord = randomWords;
        statuses[requestId].exists = true;

        currentRandomWord = randomWords[0];

        uint256 num = currentRandomWord % activeTokens.length;

        if (num == 0) {
            num = 1;
        }

        uint256 newPotatoTokenId = activeTokens[num];

        assignPotato(newPotatoTokenId);
        emit RequestFulfilled(requestId, randomWords);

        gameState = GameState.Playing;
        updateExplosionTimer();
        emit UpdatedTimer(EXPLOSION_TIME - block.timestamp);
        emit MintingEnded("Playing");
        emit HandsActivated(activeTokens.length);
        emit PotatoPassed(0, potatoTokenId, ownerOf(potatoTokenId));
    }

    function assignPotato(uint256 tokenId) internal {
        // Remove the potato from the current holder, if any
        if (potatoTokenId != 0) {
            hands[potatoTokenId].hasPotato = false;
        }
        // Assign the potato trait to the desired token
        require(_isTokenActive(tokenId), "Token is not active");
        potatoTokenId = tokenId;
        hands[potatoTokenId].hasPotato = true;
        emit PotatoPassed(0, potatoTokenId, ownerOf(potatoTokenId));
    }

    function _findFirstActiveToken() internal view returns (uint256) {
        for (uint256 i = 1; i < activeTokens.length; i++) {
            if (_isTokenActive(activeTokens[i])) {
                return activeTokens[i];
            }
        }
        revert("No active tokens found");
    }

    function _findNextActiveToken() internal view returns (uint256) {
        // Generate a pseudo-random index based on the currentRandomWord
        uint256 randomIndex = currentRandomWord % activeTokens.length;

        // Find the next active token starting from the random index
        uint256 loopCount = 0;
        while (loopCount < activeTokens.length) {
            uint256 tokenIndex = (randomIndex + loopCount) %
                activeTokens.length;
            uint256 tokenId = activeTokens[tokenIndex];
            if (tokenId != potatoTokenId && _isTokenActive(tokenId)) {
                return tokenId;
            }
            loopCount++;
        }

        // If no active token (excluding potatoTokenId) is found, return 0 or handle the case as desired
        return 0;
    }

    function _isTokenActive(uint256 tokenId) public view returns (bool) {
        for (uint256 i = 1; i < activeTokens.length; i++) {
            if (activeTokens[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    function checkAndProcessExplosion() internal {
        if (block.timestamp >= EXPLOSION_TIME) {
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
        require(
            gameState == GameState.Playing || gameState == GameState.FinalRound,
            "Game not playing"
        );

        // 1. +1 for the address of the player who failed to pass the potato kek loser lol
        address failedPlayer = ownerOf(potatoTokenId);
        failedPasses[failedPlayer] += 1;

        // 2. Remove the potato from the exploded NFT
        hands[potatoTokenId].hasPotato = false;

        // 3. Remove the exploded NFT from the activeTokens array
        uint256 indexToRemove = _indexOfTokenInActiveTokens(potatoTokenId);
        _removeTokenFromActiveTokensByIndex(indexToRemove);
        hands[potatoTokenId].isActive = false;

        // 4. Emit an event to notify that the potato exploded and get ready to assign potato to a rand tokenId
        emit PotatoExploded(potatoTokenId);
        uint256 indexToAssign = currentRandomWord % activeTokens.length;

        // Decrease the count of active tokens for the failed player
        addressActiveTokenCount[failedPlayer] -= 1;

        // If this player has no more active tokens, decrease the count of active addresses
        if (addressActiveTokenCount[failedPlayer] == 0) {
            activeAddresses -= 1;
            isPlayer[failedPlayer] = false;
        }

        // 5. Check if the game should move to the final round or end
        if (activeAddresses == 2) {
            gameState = GameState.FinalRound;
            emit FinalRoundStarted("Final Round Started");
            assignPotato(_findNextActiveToken());
        } else if (activeAddresses == 1) {
            gameState = GameState.Ended;
            emit PlayerWon(ownerOf(activeTokens[1]));
            winners.push(ownerOf(activeTokens[1]));
            hallOfFame[currentGeneration] = ownerOf(activeTokens[1]);
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
            updateExplosionTimer();
            emit UpdatedTimer(EXPLOSION_TIME - block.timestamp);
            // calculate the index based on the current activeTokens.length
            if (indexToAssign == 0 && activeTokens.length > 1) {
                indexToAssign = 1;
            }
            assignPotato(_findNextActiveToken());
        }

        updateExplosionTimer();
        emit UpdatedTimer(EXPLOSION_TIME - block.timestamp);
        _isExplosionInProgress = false;
    }

    function _indexOfTokenInActiveTokens(uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        require(activeTokens.length > 1, "Not enough active tokens");
        for (uint256 i = 1; i < activeTokens.length; i++) {
            if (activeTokens[i] == tokenId) {
                return i;
            }
        }
        revert("Token not found in activeTokens");
    }

    function _removeTokenFromActiveTokensByIndex(uint256 index) internal {
        require(index <= activeTokens.length, "Invalid index");
        activeTokens[index] = activeTokens[activeTokens.length - 1];
        activeTokens.pop();
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
