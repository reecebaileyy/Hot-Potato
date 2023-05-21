//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

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

struct TokenTraits {
    bool hasPotato;
    uint256 generation;
    // TODO: ADD MORE TRAITS FOR HANDS
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

    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    uint32 callbackGasLimit = 2500000;
    uint64 s_subscriptionId;

    bool private explosionTimeInitialized = false;
    bool private _isExplosionInProgress = false;

    uint256 public constant INITIAL_POTATO_EXPLOSION_DURATION = 2 minutes;
    uint256 public constant DECREASE_INTERVAL = 10;
    uint256 public constant DECREASE_DURATION = 5 seconds;
    uint256 public TOTAL_PASSES;
    uint256 public potatoTokenId;
    uint256 public currentGeneration = 0;
    uint256 public lastRequestId;
    uint256 public _price = 0 ether;
    uint256 public _maxsupply = 10000;
    uint256 public _maxperwallet = 3;
    uint256 public roundMints = 0;

    uint256 private FINAL_POTATO_EXPLOSION_DURATION = 10 minutes;
    address private _owner;
    uint256 private remainingTime;
    uint256 private _currentIndex = 1;

    uint256 internal EXPLOSION_TIME;

    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    mapping(uint256 => TokenTraits) public tokenTraits;
    mapping(address => uint256) public tokensMintedPerRound;
    mapping(address => uint256) public successfulPasses;
    mapping(address => uint256) public failedPasses;
    mapping(address => uint256) public totalWins;
    mapping(uint256 => RequestStatus) public statuses;
    mapping(address => uint256[]) public tokensOwnedByUser;
    mapping(GameState => string) private gameStateStrings;

    VRFCoordinatorV2Interface COORDINATOR;

    GameState internal gameState;
    GameState internal previousGameState;

    uint256[] public activeTokens;
    uint256[] public requestIds;

    event GameStarted();
    event GamePaused();
    event GameRestarted();
    event PotatoExploded(uint256 tokenId);
    event PotatoPassed(uint256 tokenIdFrom, uint256 tokenIdTo);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    constructor(uint64 subscriptionId)
        payable
        PaymentSplitter(_payees, _shares)
        ERC721A("UNKNOWN", "UNKNOWN")
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
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
        require(msg.value >= count * _price, "Must send at least 0.01 ETH");
        // require(
        //     tokensMintedPerRound[msg.sender] + count <= _maxperwallet,
        //     "Exceeded maximum tokens per round"
        // );
        require(roundMints < _maxsupply, "Max NFTs minted");
        require(count > 0, "Must mint at least one NFT");

        // LOOP THROUGH THE COUNT AND MINT THE TOKENS WHILE ASSIGNING THE POTATO AS FALSE
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _nextTokenId();
            activeTokens.push(tokenId);
            _safeMint(msg.sender, 1);
            tokenTraits[tokenId] = TokenTraits({
                hasPotato: false,
                generation: currentGeneration
            });
            tokensOwnedByUser[msg.sender].push(tokenId);
        }

        roundMints += count;
        tokensMintedPerRound[msg.sender] += count;
    }

    function passPotato(uint256 tokenIdTo) public {
        require(
            gameState == GameState.Playing || gameState == GameState.FinalRound,
            "Game not playing"
        );
        require(block.timestamp < EXPLOSION_TIME, "Potato exploded");
        require(_exists(tokenIdTo), "Target NFT does not exist");
        require(msg.sender != ownerOf(tokenIdTo), "Cannot pass potato to self");

        uint256 tokenIdFrom;
        uint256[] memory ownedTokens = tokensOwnedByUser[msg.sender];
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (tokenTraits[ownedTokens[i]].hasPotato) {
                tokenIdFrom = ownedTokens[i];
                break;
            }
        }

        potatoTokenId = tokenIdTo;
        tokenTraits[potatoTokenId] = TokenTraits({
            hasPotato: true,
            generation: currentGeneration
        });
        TOTAL_PASSES += 1;
        successfulPasses[msg.sender] += 1;

        checkAndProcessExplosion();
        emit PotatoPassed(tokenIdFrom, tokenIdTo);
    }

    function getGameState() public view returns (string memory) {
        return gameStateStrings[gameState];
    }

    function getExplosionTime() public view returns (uint256) {
        if (block.timestamp >= EXPLOSION_TIME) {
            return 0;
        } else {
            return EXPLOSION_TIME - block.timestamp;
        }
    }

    function checkExplosion() public {
        require(gameState == GameState.Playing, "Game not playing");
        if (block.timestamp >= EXPLOSION_TIME) {
            processExplosion();
        }
    }

    function userHasPotatoToken(address user) public view returns (bool) {
        uint256[] memory ownedTokens = tokensOwnedByUser[user];
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (tokenTraits[ownedTokens[i]].hasPotato) {
                return true;
            }
        }
        return false;
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

        string memory image;

        // This is where you would conditionally set your image based on the token's traits
        if (tokenTraits[tokenId].hasPotato) {
            image = string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: #ffce9e; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="#ffffff" /><text x="50%" y="50%" class="base" text-anchor="middle">',
                    "P",
                    "</text></svg>"
                )
            );
        } else {
            image = string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: #ffce9e; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="#ffffff" /><text x="50%" y="50%" class="base" text-anchor="middle">',
                    "NOT P",
                    "</text></svg>"
                )
            );
        }

        string memory attributes = string(
            abi.encodePacked(
                '"attributes": [',
                '{"trait_type": "Has Potato", "value": "',
                tokenTraits[tokenId].hasPotato ? "Yes" : "No",
                '"},',
                '{"trait_type": "Generation", "value": "',
                (tokenTraits[tokenId].generation).toString(),
                '"}',
                "]"
            )
        );
        string memory imageBase64 = Base64.encode(bytes(image));
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Token #',
                        tokenId.toString(),
                        '", "description": "A very special token!", "image": "data:image/svg+xml;base64,',
                        imageBase64,
                        '", ',
                        attributes,
                        "}"
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function getRoundMints() public view returns (uint256) {
        return roundMints;
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
            gameState == GameState.Ended ||
                gameState == GameState.Paused ||
                gameState == GameState.Queued,
            "Game already started"
        );
        gameState = GameState.Minting;
        currentGeneration += 1;
        emit GameStarted();
    }

    function endMinting() external onlyOwner {
        require(gameState == GameState.Minting, "Game not minting");
        randomize();
        updateExplosionTimer();
        gameState = GameState.Playing;
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
        emit GamePaused();
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
        roundMints = 0;
        delete tokenTraits[potatoTokenId];
        potatoTokenId = 0;
        TOTAL_PASSES = 0;

        emit GameRestarted();
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

    function randomize() public returns (uint256 requestId) {
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

        uint256 newPotatoTokenId = randomWords[0] % activeTokens.length;

        if (newPotatoTokenId == 0) {
            newPotatoTokenId = 1;
        }

        assignPotato(newPotatoTokenId);
        emit RequestFulfilled(requestId, randomWords);
    }

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
        if (activeTokens.length == 2) {
            gameState = GameState.FinalRound;
            assignPotato(activeTokens[_findFirstActiveToken()]);
        } else if (activeTokens.length == 1) {
            gameState = GameState.Ended;
        } else {
            updateExplosionTimer();
            assignPotato(activeTokens[_findFirstActiveToken()]);
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
