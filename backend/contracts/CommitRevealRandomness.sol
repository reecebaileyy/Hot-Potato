// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title CommitRevealRandomness
/// @notice Per-round randomness for chains without a VRF oracle (Robinhood Chain has none,
/// and `block.prevrandao` is a constant there).
///
/// Flow for each round:
///   1. The operator picks a secret 32-byte seed off chain and commits `keccak256(abi.encode(seed))`
///      before anyone can mint into the round.
///   2. Every mint mixes the minter, token range and timestamp into a running entropy hash.
///   3. The operator reveals the seed to start play. The round seed is
///      `keccak256(seed, mintEntropy, round)`, so neither the operator nor the players fix it alone.
///
/// Trust model: the operator cannot change the seed after committing, but could refuse to reveal
/// (the round can then only be cancelled) or mint extra hands to grind the outcome. A VRF-based
/// source can replace this contract later by implementing the same internal hooks.
abstract contract CommitRevealRandomness {
    /// @notice Commitment to the operator's secret seed, per round.
    mapping(uint256 round => bytes32) public seedCommitment;
    /// @notice Final random seed of a round, zero until revealed.
    mapping(uint256 round => bytes32) public roundSeed;

    mapping(uint256 round => bytes32) private _mintEntropy;

    event SeedCommitted(uint256 indexed round, bytes32 commitment);
    event SeedRevealed(uint256 indexed round, bytes32 seed, bytes32 roundSeed);

    error InvalidCommitment();
    error SeedAlreadyRevealed();
    error SeedMismatch();

    /// @notice Helper for operators and scripts: the commitment for a given seed.
    function computeCommitment(bytes32 seed) public pure returns (bytes32) {
        return keccak256(abi.encode(seed));
    }

    function _commitSeed(uint256 round, bytes32 commitment) internal {
        if (commitment == bytes32(0)) revert InvalidCommitment();
        seedCommitment[round] = commitment;
        emit SeedCommitted(round, commitment);
    }

    function _mixEntropy(uint256 round, bytes32 data) internal {
        _mintEntropy[round] = keccak256(abi.encode(_mintEntropy[round], data));
    }

    function _revealSeed(uint256 round, bytes32 seed) internal returns (bytes32 finalSeed) {
        if (roundSeed[round] != bytes32(0)) revert SeedAlreadyRevealed();
        if (computeCommitment(seed) != seedCommitment[round]) revert SeedMismatch();
        finalSeed = keccak256(abi.encode(seed, _mintEntropy[round], round));
        roundSeed[round] = finalSeed;
        emit SeedRevealed(round, seed, finalSeed);
    }

    /// @dev Used only when a round is cancelled before its seed is revealed, so hands minted in it
    /// still get traits. Weak randomness, acceptable because no game outcome depends on it.
    function _fallbackSeed(uint256 round) internal {
        if (roundSeed[round] != bytes32(0)) return;
        bytes32 finalSeed = keccak256(
            abi.encode(seedCommitment[round], _mintEntropy[round], round, block.timestamp)
        );
        roundSeed[round] = finalSeed;
        emit SeedRevealed(round, bytes32(0), finalSeed);
    }

    function _randomWord(uint256 round, uint256 nonce) internal view returns (uint256) {
        return uint256(keccak256(abi.encode(roundSeed[round], nonce)));
    }
}
