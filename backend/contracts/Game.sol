// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721A, IERC721A} from "erc721a/contracts/ERC721A.sol";
import {ERC721AQueryable} from "erc721a/contracts/extensions/ERC721AQueryable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CommitRevealRandomness} from "./CommitRevealRandomness.sol";
import {IMetadataHandler} from "./interfaces/IMetadataHandler.sol";

/// @title Hot Potato
/// @notice Onchain hot potato. Every NFT is a pair of hands. Each round:
///   1. Minting: the owner commits a secret seed and opens minting.
///   2. Play: the owner reveals the seed. Every hand ever minted joins the round and a random
///      hand gets the potato. Its owner passes it to any active hand owned by someone else.
///   3. The fuse burns down regardless of passes. When it runs out, whoever holds the potato
///      loses that hand for the round and a random active hand gets the potato with a new fuse.
///   4. The last wallet with active hands wins 40% of the round's pot. The rest is split
///      10% project, 30% team (two wallets) and 20% charity. Everyone claims with `withdraw()`.
/// Hands cannot be transferred while a round is in play, so the set of players is fixed.
contract Game is ERC721AQueryable, Ownable2Step, ReentrancyGuard, CommitRevealRandomness {
    enum GameState {
        Queued,
        Minting,
        Playing,
        Paused,
        FinalRound,
        Ended
    }

    struct MintConfig {
        uint128 price; // wei per hand
        uint32 maxPerWallet; // per round, 0 = unlimited
        uint32 maxPerRound; // per round, 0 = unlimited
    }

    struct FuseConfig {
        uint32 initial; // seconds
        uint32 decreaseEvery; // passes per step, 0 = never decreases
        uint32 decreaseBy; // seconds per step
        uint32 minimum; // seconds
    }

    struct GameInfo {
        GameState state;
        uint256 round;
        uint256 potatoTokenId;
        address potatoHolder;
        uint256 explosionTime;
        uint256 secondsLeft;
        uint256 activeHands;
        uint256 activeWallets;
        uint256 roundPasses;
        uint256 pot;
        uint256 mintPrice;
        uint256 maxPerWallet;
        uint256 maxPerRound;
        uint256 mintedThisRound;
        uint256 totalMinted;
        bytes32 seedCommitment;
        bool seedRevealed;
    }

    uint256 public constant BPS = 10_000;
    uint256 public constant WINNER_BPS = 4_000;
    uint256 public constant PROJECT_BPS = 1_000;
    uint256 public constant TEAM_BPS = 3_000;
    uint256 public constant CHARITY_BPS = 2_000;

    IMetadataHandler public metadataHandler;

    GameState public state;
    GameState public pausedFrom;
    uint256 public currentRound;
    uint256 public potatoTokenId;
    /// @notice Timestamp at which the potato explodes. Zero when no fuse is burning.
    uint256 public explosionTime;
    uint256 public pausedSecondsLeft;
    uint256 public roundPasses;
    uint256 public roundExplosions;
    /// @notice ETH from cancelled rounds, added to the next round's pot.
    uint256 public rolloverPot;

    MintConfig public mintConfig;
    FuseConfig public fuseConfig;

    address public projectWallet;
    address public teamWallet1;
    address public teamWallet2;
    address public charityWallet;

    mapping(uint256 round => uint256) public roundPot;
    mapping(uint256 round => uint256) public roundMinted;
    mapping(uint256 round => mapping(address => uint256)) public mintedInRound;
    mapping(uint256 round => uint256) public roundFirstTokenId;
    mapping(uint256 round => bool) public roundActivated;
    mapping(uint256 round => uint256) public activeHandCount;
    mapping(uint256 round => uint256) public activeWalletCount;
    mapping(uint256 round => uint256) public roundHandTotal;
    mapping(uint256 round => address) public hallOfFame;

    mapping(address => uint256) public successfulPasses;
    mapping(address => uint256) public failedPasses;
    mapping(address => uint256) public totalWins;
    /// @notice Claimable ETH per address (winners and payees).
    mapping(address => uint256) public rewards;

    address[] internal _winners;
    address[] internal _players;
    mapping(address => bool) internal _isPlayer;
    uint256 internal _holderCount;

    // Active hands of a round, stored as a "virtual array": index i holds tokenId i + 1 unless
    // overwritten by a swap-and-pop removal. Being keyed by round, it needs no reset between rounds.
    mapping(uint256 round => mapping(uint256 index => uint256)) private _activeSlot;
    mapping(uint256 round => mapping(uint256 tokenId => uint256)) private _activeIndexPlusOne;
    mapping(uint256 round => mapping(uint256 tokenId => bool)) private _eliminated;
    mapping(uint256 round => mapping(address => uint256)) private _eliminatedHands;

    event MintingStarted(uint256 indexed round, bytes32 seedCommitment, uint256 pot);
    event HandsMinted(address indexed player, uint256 indexed round, uint256 firstTokenId, uint256 quantity);
    event PlayStarted(
        uint256 indexed round,
        uint256 activeHands,
        uint256 activeWallets,
        uint256 potatoTokenId,
        address potatoHolder,
        uint256 explosionTime
    );
    event PotatoPassed(
        uint256 indexed round,
        uint256 indexed fromTokenId,
        uint256 indexed toTokenId,
        address from,
        address to
    );
    event PotatoExploded(uint256 indexed round, uint256 indexed tokenId, address indexed player, bool duringPass);
    event PotatoAssigned(uint256 indexed round, uint256 indexed tokenId, address indexed holder, uint256 explosionTime);
    event PlayerEliminated(uint256 indexed round, address indexed player);
    event FinalRoundStarted(uint256 indexed round);
    event GameEnded(uint256 indexed round, address indexed winner, uint256 prize, uint256 pot);
    event GamePaused(uint256 indexed round, uint256 secondsLeft);
    event GameResumed(uint256 indexed round, uint256 explosionTime);
    event RoundCancelled(uint256 indexed round, uint256 rolledOver);
    event FundsWithdrawn(address indexed account, uint256 amount);
    event MintConfigUpdated(uint256 price, uint256 maxPerWallet, uint256 maxPerRound);
    event FuseConfigUpdated(uint256 initial, uint256 decreaseEvery, uint256 decreaseBy, uint256 minimum);
    event PayeesUpdated(address project, address team1, address team2, address charity);
    event MetadataHandlerUpdated(address handler);

    error WrongState(GameState current);
    error ZeroQuantity();
    error WrongPayment(uint256 expected, uint256 sent);
    error WalletMintLimit(uint256 limit);
    error RoundMintLimit(uint256 limit);
    error NotEnoughPlayers();
    error NotPotatoHolder();
    error TargetNotActive(uint256 tokenId);
    error CannotPassToSelf();
    error FuseStillBurning(uint256 secondsLeft);
    error HandsLockedDuringPlay();
    error NothingToWithdraw();
    error WithdrawFailed();
    error ZeroAddress();
    error InvalidFuseConfig();
    error NonexistentToken();

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        address metadataHandler_,
        address[4] memory payees, // project, team1, team2, charity
        MintConfig memory mintConfig_,
        FuseConfig memory fuseConfig_
    ) ERC721A(name_, symbol_) Ownable(initialOwner) {
        metadataHandler = IMetadataHandler(metadataHandler_);
        emit MetadataHandlerUpdated(metadataHandler_);
        _setPayees(payees[0], payees[1], payees[2], payees[3]);
        _setMintConfig(mintConfig_);
        _setFuseConfig(fuseConfig_);
    }

    /*//////////////////////////////////////////////////////////////
                              PLAYER ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Mint `quantity` hands into the current round. Hands keep playing in later rounds.
    function mintHand(uint256 quantity) external payable {
        if (state != GameState.Minting) revert WrongState(state);
        if (quantity == 0) revert ZeroQuantity();

        uint256 round = currentRound;
        MintConfig memory config = mintConfig;
        uint256 expected = uint256(config.price) * quantity;
        if (msg.value != expected) revert WrongPayment(expected, msg.value);

        uint256 walletMinted = mintedInRound[round][msg.sender] + quantity;
        if (config.maxPerWallet != 0 && walletMinted > config.maxPerWallet) {
            revert WalletMintLimit(config.maxPerWallet);
        }
        uint256 minted = roundMinted[round] + quantity;
        if (config.maxPerRound != 0 && minted > config.maxPerRound) {
            revert RoundMintLimit(config.maxPerRound);
        }

        mintedInRound[round][msg.sender] = walletMinted;
        roundMinted[round] = minted;
        roundPot[round] += msg.value;

        uint256 firstTokenId = _nextTokenId();
        _mixEntropy(round, keccak256(abi.encode(msg.sender, firstTokenId, quantity, block.timestamp)));
        _mint(msg.sender, quantity);

        emit HandsMinted(msg.sender, round, firstTokenId, quantity);
    }

    /// @notice Pass the potato to `toTokenId`. If the fuse has already run out, the potato
    /// explodes in your hands instead (the transaction still succeeds).
    function passPotato(uint256 toTokenId) external {
        _requireLive();
        uint256 round = currentRound;
        uint256 fromTokenId = potatoTokenId;
        if (ownerOf(fromTokenId) != msg.sender) revert NotPotatoHolder();

        if (block.timestamp >= explosionTime) {
            _explode(round, true);
            return;
        }

        if (!_isActive(round, toTokenId)) revert TargetNotActive(toTokenId);
        address to = ownerOf(toTokenId);
        if (to == msg.sender) revert CannotPassToSelf();

        potatoTokenId = toTokenId;
        unchecked {
            ++roundPasses;
            ++successfulPasses[msg.sender];
        }
        emit PotatoPassed(round, fromTokenId, toTokenId, msg.sender, to);
    }

    /// @notice Anyone can detonate the potato once its fuse has run out. Called by the keeper bot
    /// and by the frontend when the timer hits zero.
    function checkExplosion() external {
        _requireLive();
        if (block.timestamp < explosionTime) revert FuseStillBurning(explosionTime - block.timestamp);
        _explode(currentRound, false);
    }

    /// @notice Claim ETH owed to the caller (prize or payee share).
    function withdraw() external nonReentrant {
        uint256 amount = rewards[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        rewards[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit FundsWithdrawn(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                              OWNER ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Open a new round for minting. `seedCommitment` is `computeCommitment(seed)` for a
    /// secret random seed the operator keeps until `endMinting`.
    function startGame(bytes32 seedCommitment_) external onlyOwner {
        if (state != GameState.Queued && state != GameState.Ended) revert WrongState(state);

        uint256 round = ++currentRound;
        _commitSeed(round, seedCommitment_);
        roundFirstTokenId[round] = _nextTokenId();
        roundPot[round] = rolloverPot;
        rolloverPot = 0;

        potatoTokenId = 0;
        explosionTime = 0;
        roundPasses = 0;
        roundExplosions = 0;
        state = GameState.Minting;

        emit MintingStarted(round, seedCommitment_, roundPot[round]);
    }

    /// @notice Close minting, reveal the seed and start play. Every hand ever minted is in.
    function endMinting(bytes32 seed) external onlyOwner {
        if (state != GameState.Minting) revert WrongState(state);
        if (_holderCount < 2) revert NotEnoughPlayers();

        uint256 round = currentRound;
        _revealSeed(round, seed);

        uint256 hands = _totalMinted();
        roundActivated[round] = true;
        roundHandTotal[round] = hands;
        activeHandCount[round] = hands;
        activeWalletCount[round] = _holderCount;

        potatoTokenId = _activeAt(round, _randomWord(round, 0) % hands);
        state = _holderCount == 2 ? GameState.FinalRound : GameState.Playing;
        _lightFuse();

        emit PlayStarted(round, hands, _holderCount, potatoTokenId, ownerOf(potatoTokenId), explosionTime);
        if (state == GameState.FinalRound) emit FinalRoundStarted(round);
    }

    function pauseGame() external onlyOwner {
        GameState current = state;
        if (current != GameState.Minting && current != GameState.Playing && current != GameState.FinalRound) {
            revert WrongState(current);
        }
        pausedFrom = current;
        state = GameState.Paused;
        if (current != GameState.Minting) {
            pausedSecondsLeft = explosionTime > block.timestamp ? explosionTime - block.timestamp : 0;
        }
        emit GamePaused(currentRound, pausedSecondsLeft);
    }

    function resumeGame() external onlyOwner {
        if (state != GameState.Paused) revert WrongState(state);
        state = pausedFrom;
        if (pausedFrom != GameState.Minting) {
            explosionTime = block.timestamp + pausedSecondsLeft;
            pausedSecondsLeft = 0;
        }
        emit GameResumed(currentRound, explosionTime);
    }

    /// @notice Abort the current round with no winner. Its pot rolls over into the next round.
    function cancelRound() external onlyOwner {
        if (state == GameState.Queued || state == GameState.Ended) revert WrongState(state);
        uint256 round = currentRound;
        _fallbackSeed(round);

        uint256 pot = roundPot[round];
        roundPot[round] = 0;
        rolloverPot += pot;

        potatoTokenId = 0;
        explosionTime = 0;
        pausedSecondsLeft = 0;
        state = GameState.Queued;
        emit RoundCancelled(round, pot);
    }

    function setMintConfig(MintConfig calldata config) external onlyOwner {
        if (state != GameState.Queued && state != GameState.Ended) revert WrongState(state);
        _setMintConfig(config);
    }

    function setFuseConfig(FuseConfig calldata config) external onlyOwner {
        if (state != GameState.Queued && state != GameState.Ended && state != GameState.Minting) {
            revert WrongState(state);
        }
        _setFuseConfig(config);
    }

    function setPayees(address project, address team1, address team2, address charity) external onlyOwner {
        _setPayees(project, team1, team2, charity);
    }

    function setMetadataHandler(address handler) external onlyOwner {
        metadataHandler = IMetadataHandler(handler);
        emit MetadataHandlerUpdated(handler);
    }

    /*//////////////////////////////////////////////////////////////
                                  VIEWS
    //////////////////////////////////////////////////////////////*/

    function getGameState() external view returns (string memory) {
        GameState s = state;
        if (s == GameState.Queued) return "Queued";
        if (s == GameState.Minting) return "Minting";
        if (s == GameState.Playing) return "Playing";
        if (s == GameState.Paused) return "Paused";
        if (s == GameState.FinalRound) return "Final Round";
        return "Ended";
    }

    function getGameInfo() external view returns (GameInfo memory info) {
        uint256 round = currentRound;
        info.state = state;
        info.round = round;
        info.potatoTokenId = potatoTokenId;
        info.potatoHolder = potatoHolder();
        info.explosionTime = explosionTime;
        info.secondsLeft = getExplosionTime();
        info.activeHands = activeHandCount[round];
        info.activeWallets = activeWalletCount[round];
        info.roundPasses = roundPasses;
        info.pot = roundPot[round];
        info.mintPrice = mintConfig.price;
        info.maxPerWallet = mintConfig.maxPerWallet;
        info.maxPerRound = mintConfig.maxPerRound;
        info.mintedThisRound = roundMinted[round];
        info.totalMinted = _totalMinted();
        info.seedCommitment = seedCommitment[round];
        info.seedRevealed = roundSeed[round] != bytes32(0);
    }

    /// @notice Seconds until the potato explodes (0 if it can be detonated now or no fuse burns).
    function getExplosionTime() public view returns (uint256) {
        if (state == GameState.Paused) return pausedSecondsLeft;
        if (!_isLiveState(state)) return 0;
        return explosionTime > block.timestamp ? explosionTime - block.timestamp : 0;
    }

    /// @notice Owner of the hand holding the potato, or zero when no round is in play.
    function potatoHolder() public view returns (address) {
        if (potatoTokenId == 0) return address(0);
        return ownerOf(potatoTokenId);
    }

    function userHasPotatoToken(address user) external view returns (bool) {
        return user != address(0) && potatoHolder() == user;
    }

    /// @notice Whether `tokenId` is still in the current round.
    function isActive(uint256 tokenId) public view returns (bool) {
        return _isActive(currentRound, tokenId);
    }

    /// @notice Number of hands `user` still has in the current round.
    function activeHandsOf(address user) public view returns (uint256) {
        uint256 round = currentRound;
        if (!roundActivated[round]) return 0;
        return balanceOf(user) - _eliminatedHands[round][user];
    }

    function getActiveTokenIds() external view returns (uint256[] memory ids) {
        uint256 round = currentRound;
        uint256 count = activeHandCount[round];
        ids = new uint256[](count);
        for (uint256 i; i < count; ++i) {
            ids[i] = _activeAt(round, i);
        }
    }

    function getActiveTokensOfOwner(address user) external view returns (uint256[] memory ids) {
        uint256[] memory owned = this.tokensOfOwner(user);
        uint256 round = currentRound;
        ids = new uint256[](owned.length);
        uint256 count;
        for (uint256 i; i < owned.length; ++i) {
            if (_isActive(round, owned[i])) ids[count++] = owned[i];
        }
        assembly {
            mstore(ids, count)
        }
    }

    function getPlayerStats(address player) external view returns (uint256, uint256, uint256) {
        return (successfulPasses[player], failedPasses[player], totalWins[player]);
    }

    function getAllWinners() external view returns (address[] memory) {
        return _winners;
    }

    function playerCount() external view returns (uint256) {
        return _players.length;
    }

    /// @notice Lifetime stats for every address that has held a hand, paginated.
    function getLeaderboard(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (
            address[] memory players,
            uint256[] memory passes,
            uint256[] memory fails,
            uint256[] memory wins
        )
    {
        uint256 total = _players.length;
        uint256 end = offset + limit > total ? total : offset + limit;
        uint256 size = end > offset ? end - offset : 0;
        players = new address[](size);
        passes = new uint256[](size);
        fails = new uint256[](size);
        wins = new uint256[](size);
        for (uint256 i; i < size; ++i) {
            address player = _players[offset + i];
            players[i] = player;
            passes[i] = successfulPasses[player];
            fails[i] = failedPasses[player];
            wins[i] = totalWins[player];
        }
    }

    /// @notice Round a hand was minted in.
    function roundOfToken(uint256 tokenId) public view returns (uint256) {
        if (!_exists(tokenId)) revert NonexistentToken();
        uint256 low = 1;
        uint256 high = currentRound;
        while (low < high) {
            uint256 mid = (low + high + 1) / 2;
            if (roundFirstTokenId[mid] <= tokenId) low = mid;
            else high = mid - 1;
        }
        return low;
    }

    /// @notice Background (1-20) and hand type (1-41) of a hand. Both are 0 until the seed of the
    /// round it was minted in is revealed, so minters cannot pick rare traits.
    function traitsOf(uint256 tokenId) public view returns (uint8 background, uint8 handType) {
        bytes32 seed = roundSeed[roundOfToken(tokenId)];
        if (seed == bytes32(0)) return (0, 0);
        background = uint8(_rollTier(seed, tokenId, "BACKGROUND", 11, 6, 3));
        handType = uint8(_rollTier(seed, tokenId, "HAND", 25, 9, 7));
    }

    function tokenURI(uint256 tokenId) public view override(ERC721A, IERC721A) returns (string memory) {
        (uint8 background, uint8 handType) = traitsOf(tokenId);
        return
            metadataHandler.getTokenURI(
                tokenId,
                background,
                handType,
                _hasPotato(tokenId),
                uint32(roundOfToken(tokenId)),
                isActive(tokenId),
                1
            );
    }

    function getImageString(uint256 tokenId) external view returns (string memory) {
        (uint8 background, uint8 handType) = traitsOf(tokenId);
        return metadataHandler.getSVGInterface(background, handType, _hasPotato(tokenId), 1);
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNALS
    //////////////////////////////////////////////////////////////*/

    function _explode(uint256 round, bool duringPass) internal {
        uint256 tokenId = potatoTokenId;
        address loser = ownerOf(tokenId);
        unchecked {
            ++failedPasses[loser];
        }
        _removeActive(round, tokenId);
        emit PotatoExploded(round, tokenId, loser, duringPass);

        if (++_eliminatedHands[round][loser] == balanceOf(loser)) {
            --activeWalletCount[round];
            emit PlayerEliminated(round, loser);
        }

        uint256 wallets = activeWalletCount[round];
        if (wallets == 1) {
            _finishRound(round);
            return;
        }
        if (wallets == 2 && state == GameState.Playing) {
            state = GameState.FinalRound;
            emit FinalRoundStarted(round);
        }

        uint256 nonce = ++roundExplosions;
        potatoTokenId = _activeAt(round, _randomWord(round, nonce) % activeHandCount[round]);
        _lightFuse();
        emit PotatoAssigned(round, potatoTokenId, ownerOf(potatoTokenId), explosionTime);
    }

    function _finishRound(uint256 round) internal {
        address winner = ownerOf(_activeAt(round, 0));
        state = GameState.Ended;
        potatoTokenId = 0;
        explosionTime = 0;

        hallOfFame[round] = winner;
        _winners.push(winner);
        unchecked {
            ++totalWins[winner];
        }

        uint256 pot = roundPot[round];
        uint256 project = (pot * PROJECT_BPS) / BPS;
        uint256 team = (pot * TEAM_BPS) / BPS;
        uint256 charity = (pot * CHARITY_BPS) / BPS;
        uint256 prize = pot - project - team - charity; // winner also gets rounding dust

        rewards[winner] += prize;
        rewards[projectWallet] += project;
        rewards[teamWallet1] += team / 2;
        rewards[teamWallet2] += team - team / 2;
        rewards[charityWallet] += charity;

        emit GameEnded(round, winner, prize, pot);
    }

    function _lightFuse() internal {
        FuseConfig memory fuse = fuseConfig;
        uint256 duration = fuse.initial;
        if (fuse.decreaseEvery != 0) {
            uint256 reduction = (roundPasses / fuse.decreaseEvery) * fuse.decreaseBy;
            duration = reduction >= duration - fuse.minimum ? fuse.minimum : duration - reduction;
        }
        explosionTime = block.timestamp + duration;
    }

    function _activeAt(uint256 round, uint256 index) internal view returns (uint256) {
        uint256 tokenId = _activeSlot[round][index];
        return tokenId == 0 ? index + 1 : tokenId;
    }

    function _removeActive(uint256 round, uint256 tokenId) internal {
        uint256 indexPlusOne = _activeIndexPlusOne[round][tokenId];
        uint256 index = indexPlusOne == 0 ? tokenId - 1 : indexPlusOne - 1;
        uint256 lastIndex = activeHandCount[round] - 1;
        if (index != lastIndex) {
            uint256 lastTokenId = _activeAt(round, lastIndex);
            _activeSlot[round][index] = lastTokenId;
            _activeIndexPlusOne[round][lastTokenId] = index + 1;
        }
        activeHandCount[round] = lastIndex;
        _eliminated[round][tokenId] = true;
    }

    function _isActive(uint256 round, uint256 tokenId) internal view returns (bool) {
        return
            roundActivated[round] &&
            tokenId != 0 &&
            tokenId <= roundHandTotal[round] &&
            !_eliminated[round][tokenId];
    }

    function _hasPotato(uint256 tokenId) internal view returns (bool) {
        return tokenId != 0 && tokenId == potatoTokenId;
    }

    function _isLiveState(GameState s) internal pure returns (bool) {
        return s == GameState.Playing || s == GameState.FinalRound;
    }

    function _requireLive() internal view {
        if (!_isLiveState(state)) revert WrongState(state);
    }

    /// @dev Rolls a tier (60% common, 30% rare, 10% legendary) then an id inside it.
    /// Ids are laid out common first: 1..common, then rare, then legendary.
    function _rollTier(
        bytes32 seed,
        uint256 tokenId,
        string memory salt,
        uint256 common,
        uint256 rare,
        uint256 legendary
    ) internal pure returns (uint256) {
        uint256 roll = uint256(keccak256(abi.encode(seed, tokenId, salt)));
        uint256 tier = roll % 100;
        uint256 pick = roll >> 128;
        if (tier < 60) return (pick % common) + 1;
        if (tier < 90) return (pick % rare) + common + 1;
        return (pick % legendary) + common + rare + 1;
    }

    function _setMintConfig(MintConfig memory config) internal {
        mintConfig = config;
        emit MintConfigUpdated(config.price, config.maxPerWallet, config.maxPerRound);
    }

    function _setFuseConfig(FuseConfig memory config) internal {
        if (config.minimum == 0 || config.initial < config.minimum) revert InvalidFuseConfig();
        fuseConfig = config;
        emit FuseConfigUpdated(config.initial, config.decreaseEvery, config.decreaseBy, config.minimum);
    }

    function _setPayees(address project, address team1, address team2, address charity) internal {
        if (project == address(0) || team1 == address(0) || team2 == address(0) || charity == address(0)) {
            revert ZeroAddress();
        }
        projectWallet = project;
        teamWallet1 = team1;
        teamWallet2 = team2;
        charityWallet = charity;
        emit PayeesUpdated(project, team1, team2, charity);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @dev Locks hands while a round is in play (including while it is paused mid-play).
    function _beforeTokenTransfers(address from, address, uint256, uint256) internal view override {
        if (from == address(0)) return;
        GameState s = state;
        if (_isLiveState(s) || (s == GameState.Paused && pausedFrom != GameState.Minting)) {
            revert HandsLockedDuringPlay();
        }
    }

    /// @dev Tracks the number of distinct holders and every address that ever held a hand.
    function _afterTokenTransfers(address from, address to, uint256, uint256 quantity) internal override {
        if (from == to) return;
        if (from != address(0) && balanceOf(from) == 0) --_holderCount;
        if (to != address(0)) {
            if (balanceOf(to) == quantity) ++_holderCount;
            if (!_isPlayer[to]) {
                _isPlayer[to] = true;
                _players.push(to);
            }
        }
    }
}
