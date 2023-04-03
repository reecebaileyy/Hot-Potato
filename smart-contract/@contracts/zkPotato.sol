//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/interfaces/IERC721ABurnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";

contract zkPotato is
    Ownable,
    ERC721A,
    ERC721AQueryable,
    PaymentSplitter,
    ReentrancyGuard
{
    using Strings for uint256;

    uint256 private MINT_DURATION = 10 minutes;
    uint256 public constant INITIAL_POTATO_EXPLOSION_DURATION = 2 minutes;
    uint256 public constant DECREASE_INTERVAL = 10;
    uint256 public constant DECREASE_DURATION = 5 seconds;
    uint256 private FINAL_POTATO_EXPLOSION_DURATION = 10 minutes;
    uint256 public EXPLOSION_TIME;
    uint256 public TOTAL_PASSES;
    uint256 private _price = 0.01 ether;
    uint256 public _maxsupply = 10000;
    uint256 public _maxperwallet = 3;
    address private _owner;
    uint256 private _currentIndex = 1;

    enum GameState {
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

    GameState public gameState;

    uint256 public mintingEndTime;
    uint256 public explosionTime;

    mapping(uint256 => uint256) public successfulPasses;
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
        ERC721A("zkPotato", "HPG")
    {
        _owner = msg.sender;
        _currentIndex = _startTokenId();
    }

    // ONLY OWNER FUNCTIONS

    function startGame() external onlyOwner {
        require(
            gameState == GameState.Ended || gameState == GameState.Paused,
            "Game already started"
        );
        gameState = GameState.Minting;
        mintingEndTime = block.timestamp + MINT_DURATION;
        emit GameStarted();
    }

    function pauseGame() external onlyOwner {
        require(gameState == GameState.Playing, "Game not playing");
        gameState = GameState.Paused;
        emit GamePaused();
    }

    function restartGame() external onlyOwner {
        require(gameState == GameState.Paused, "Game not paused");
        gameState = GameState.Playing;
        emit GameRestarted();
    }

    function assignPotato(uint256 tokenId) external onlyOwner {
        // Remove the potato from the current holder, if any
        if (potatoTokenId != 0) {
            tokenTraits[potatoTokenId].hasPotato = false;
        }
        //TODO: Implement logic for assigning the potato trait to the desired token
        potatoTokenId = activeTokens [69];
        tokenTraits[potatoTokenId].hasPotato = true;
    }

    // PUBLIC FUNCTIONS

    function mintHand(uint256 count) external payable nonReentrant {
        require(gameState == GameState.Minting, "Game not minting");
        require(block.timestamp < mintingEndTime, "Minting period ended");
        require(msg.value >= count * _price, "Must send at least 0.01 ETH");
        require(
            balanceOf(msg.sender) < _maxperwallet,
            "Max NFTs per wallet reached"
        );
        require(totalSupply() < _maxsupply, "Max NFTs minted");
        require(count > 0, "Must mint at least one NFT");

        // LOOP THROUGH THE COUNT AND MINT THE TOKENS WHILE ASSIGNING THE POTATO AS FALSE
        for (uint256 i = 0; i < count; i++) {
            _safeMint(msg.sender, 1);
            activeTokens.push(_nextTokenId());
            tokenTraits[_nextTokenId()] = TokenTraits({hasPotato: false});
        }
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

        updateExplosionTimer();
        emit PotatoPassed(tokenIdFrom, tokenIdTo);

        // TODO: Implement logic for passing the potato and updating explosion time
    }

    // INTERNAL FUNCTIONS

    function updateExplosionTimer() internal {
    // Calculate the current explosion duration based on the total number of passes
    uint256 currentDuration = INITIAL_POTATO_EXPLOSION_DURATION - (TOTAL_PASSES / DECREASE_INTERVAL) * DECREASE_DURATION;

    // Ensure that the duration does not go below 15 seconds
    uint256 minimumDuration = 15 seconds;
    if (currentDuration < minimumDuration) {
        currentDuration = minimumDuration;
    }

    EXPLOSION_TIME = block.timestamp + currentDuration;
}


    function processExplosion() internal {
        // TODO: Implement logic for processing an explosion and removing the NFT from the game
    }

    function checkExplosion() external {
        require(gameState == GameState.Playing, "Game not playing");
        if (block.timestamp >= EXPLOSION_TIME) {
            processExplosion();
        }
    }

    // TODO: Implement logic for determining the winners and distributing rewards
    uint256[] private _shares = [60, 25, 10];
    address[] private _payees = [
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4,
        0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2,
        0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
    ];

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
