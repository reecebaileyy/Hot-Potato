//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "./Base64.sol";
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
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
        uint8 potato_
    ) external view returns (string memory);
}

struct Hand {
    bool hasPotato;
    uint32 generation;
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
    PaymentSplitter,
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

    uint256 public constant INITIAL_POTATO_EXPLOSION_DURATION = 30 seconds; //CHANGE THIS LATER
    uint256 public constant DECREASE_INTERVAL = 10;
    uint256 public constant DECREASE_DURATION = 5 seconds;
    uint256 public TOTAL_PASSES;
    uint256 public potatoTokenId;
    uint256 public lastRequestId;
    uint32 public currentGeneration = 0;
    uint256 public _price = 0 ether;
    uint256 public _maxsupply = 10000;
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
    mapping(address => uint256) public tokensMintedPerRound;
    mapping(address => bool) private isPlayer;
    mapping(address => uint256) public successfulPasses;
    mapping(address => uint256) public failedPasses;
    mapping(address => uint256) public totalWins;
    mapping(uint256 => RequestStatus) public statuses;
    mapping(address => uint256[]) public tokensOwnedByUser;
    mapping(GameState => string) private gameStateStrings;
    mapping(uint256 => address) public Winners;
    mapping(address => uint256) public addressActiveTokenCount;
    mapping(address => bool) public activePlayers;
    mapping(address => bool) private counted;

    VRFCoordinatorV2Interface COORDINATOR;

    GameState internal gameState;
    GameState internal previousGameState;

    uint256[] public activeTokens;
    uint256[] public requestIds;
    address[] public players;

    event GameStarted(string message);
    event GamePaused(string message);
    event GameResumed(string message);
    event GameRestarted(string message);
    event FinalRoundStarted(string message);
    event PotatoExploded(uint256 tokenId);
    event PotatoMinted(address indexed player, uint32 amount);
    event NewRound(uint256 round);
    event HandsActivated(uint256 count);
    event UpdatedTimer(uint256 time);
    event PotatoPassed(uint256 tokenIdFrom, uint256 tokenIdTo);
    event PotatoObtained(address hotHands);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event FailedPass(address indexed player);
    event SuccessfulPass(address indexed player);
    event PlayerWon(address indexed player);

    constructor(
        uint64 subscriptionId
    )
        payable
        PaymentSplitter(_payees, _shares)
        ERC721A("UNKNOWN", "UNKNOWN")
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
    {
        activeTokens.push(0);
        gameStateStrings[GameState.Queued] = "Queued";
        gameStateStrings[GameState.Minting] = "Minting";
        gameStateStrings[GameState.Playing] = "Playing";
        gameStateStrings[GameState.Paused] = "Paused";
        gameStateStrings[GameState.FinalRound] = "Final Round";
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
        // require(gameState == GameState.Minting, "Game not minting");
        // require(msg.value >= count * _price, "Must send at least 0.01 ETH");
        // require(
        //     tokensMintedPerRound[msg.sender] + count <= _maxperwallet,
        //     "Exceeded maximum tokens per round"
        // );
        // require(roundMints < _maxsupply, "Max NFTs minted");
        require(count > 0, "Must mint at least one NFT");

        
        for (uint256 i = 0; i < count; i++) {
            _mintHand();
        }

        if (!isPlayer[msg.sender]) {
            players.push(msg.sender);
            isPlayer[msg.sender] = true;
        }

        roundMints += count;
        tokensMintedPerRound[msg.sender] += count;
        emit PotatoMinted(msg.sender, uint32(count));
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
            emit PotatoObtained(ownerOf(potatoTokenId));
            

            TOTAL_PASSES += 1;
            successfulPasses[msg.sender] += 1;
            emit SuccessfulPass(msg.sender);

            checkAndProcessExplosion();
            emit PotatoPassed(tokenIdFrom, tokenIdTo);
        }
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

    function getExplosionTime() public returns (uint256) {
        if (block.timestamp >= EXPLOSION_TIME) {
            return 0;
        } else {
            _secondsLeft = EXPLOSION_TIME - block.timestamp;
            return EXPLOSION_TIME - block.timestamp;
        }
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

    function getPlayerStats(
        address player
    ) public view returns (uint256, uint256, uint256) {
        return (
            successfulPasses[player],
            failedPasses[player],
            totalWins[player]
        );
    }

    function getActiveTokens() public view returns (uint256) {
        return activeTokens.length - 1;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721A) returns (string memory) {
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
                hand.potato
            );
    }

    function getRoundMints() public view returns (uint256) {
        return roundMints;
    }

    function getPotatoOwner() public view returns (address) {
        return ownerOf(potatoTokenId);
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
        emit GameStarted("The game has started");
    }

    function endMinting() external onlyOwner {
        require(gameState == GameState.Minting, "Game not minting");
        randomize();
        emit HandsActivated(activeTokens.length);
    }

    function pauseGame() external onlyOwner {
        require(
            gameState == GameState.Playing ||
                gameState == GameState.FinalRound ||
                gameState == GameState.Minting,
            "Game not playing"
        );
        if (_isExplosionInProgress) {
            remainingTime = EXPLOSION_TIME - block.timestamp;
        }
        previousGameState = gameState;
        gameState = GameState.Paused;
        emit GamePaused("The game has pasued");
    }

    function resumeGame() external onlyOwner {
        require(gameState == GameState.Paused, "Game not paused");
        if (
            previousGameState == GameState.Playing ||
            previousGameState == GameState.FinalRound
        ) {
            // TODO: Check if there is a valid explosion timer ongoing
            EXPLOSION_TIME = block.timestamp + remainingTime;
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

        // Reset tokens minted by each user in the round
        for (uint256 i = 1; i < activeTokens.length; i++) {
            address tokenOwner = ownerOf(activeTokens[i]);
            tokensMintedPerRound[tokenOwner] = 0;
        }

        // Clear the activeTokens array and remove the potato token
        delete activeTokens;
        roundMints = 0;
        delete hands[potatoTokenId];
        potatoTokenId = 0;
        TOTAL_PASSES = 0;
        activeAddresses = 0;

        for (uint256 i = 0; i < players.length; i++) {
            addressActiveTokenCount[players[i]] = 0;
        }

        delete players;
        activeTokens.push(0);

        emit GameRestarted("The game has restarted");
    }

    function setMetadataHandler(address addy) external onlyOwner {
        metadataHandler = MetadataHandler(addy);
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
        (uint8 background, uint8 hand_type) = (0, 0);

        {
            id = uint64(_nextTokenId());

            // TODO: GET RANDOM TRAITS
            background = uint8(1);
            hand_type = uint8(1);
        }

        _safeMint(msg.sender, 1);
        activeTokens.push(id);

        if (addressActiveTokenCount[msg.sender] == 0) {
            activeAddresses += 1;
        }
        addressActiveTokenCount[msg.sender] += 1;
        tokensOwnedByUser[msg.sender].push(id);

        hands[uint256(id)] = Hand({
            hasPotato: false,
            generation: currentGeneration,
            background: background,
            hand_type: hand_type,
            potato: uint8(1)
        });
    }

    function _rarity(
        uint256 rand,
        string memory val,
        uint256 spicy
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encode(rand, val, spicy)));
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

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
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
        getExplosionTime();
        emit UpdatedTimer(_secondsLeft);
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

    function _isTokenActive(uint256 tokenId) internal view returns (bool) {
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
        console.log("enter exp");

        // 1. +1 for the address of the player who failed to pass the potato kek loser lol
        address failedPlayer = ownerOf(potatoTokenId);
        failedPasses[failedPlayer] += 1;

        // 2. Remove the potato from the exploded NFT
        hands[potatoTokenId].hasPotato = false;

        // 3. Remove the exploded NFT from the activeTokens array
        uint256 indexToRemove = _indexOfTokenInActiveTokens(potatoTokenId);
        console.log("IR");
        _removeTokenFromActiveTokensByIndex(indexToRemove);
        console.log("rTFATBI");

        // 4. Emit an event to notify that the potato exploded and get ready to assign potato to a rand tokenId
        emit PotatoExploded(potatoTokenId);
        uint256 indexToAssign = currentRandomWord % activeTokens.length;

        // Decrease the count of active tokens for the failed player
        addressActiveTokenCount[failedPlayer] -= 1;

        // If this player has no more active tokens, decrease the count of active addresses
        if (addressActiveTokenCount[failedPlayer] == 0) {
            activeAddresses -= 1;
        }

        // 5. Check if the game should move to the final round or end
        if (activeAddresses == 2) {
            gameState = GameState.FinalRound;
            emit FinalRoundStarted("Final Round Started");
            assignPotato(_findNextActiveToken());
        } else if (activeAddresses < 2) {
            gameState = GameState.Ended;
            emit PlayerWon(ownerOf(activeTokens[1]));
            Winners[currentGeneration] = ownerOf(activeTokens[1]);
        } else {
            updateExplosionTimer();
            getExplosionTime();
            emit UpdatedTimer(_secondsLeft);
            // calculate the index based on the current activeTokens.length
            if (indexToAssign == 0 && activeTokens.length > 1) {
                indexToAssign = 1;
            }
            assignPotato(_findNextActiveToken());
        }

        updateExplosionTimer();
        getExplosionTime();
        emit UpdatedTimer(_secondsLeft);
        _isExplosionInProgress = false;
    }

    function _indexOfTokenInActiveTokens(
        uint256 tokenId
    ) internal view returns (uint256) {
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

    // TODO: Implement logic for determining the winners and distributing rewards
    uint256[] private _shares = [100];
    address[] private _payees = [0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F];

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
