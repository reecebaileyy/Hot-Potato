import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseEther, zeroAddress, type Address } from "viem";
import {
  deployGame,
  playRound,
  holderClient,
  activeTokenNotOwnedBy,
  explodeUntilEnded,
  seedFor,
  commitmentFor,
  PRICE,
  DEFAULT_FUSE,
} from "./helpers.js";

const STATE = { Queued: 0, Minting: 1, Playing: 2, Paused: 3, FinalRound: 4, Ended: 5 } as const;

describe("Game: minting", () => {
  it("rejects mints outside the Minting state", async () => {
    const f = await deployGame();
    const g = await f.as(f.players[0]);
    await f.viem.assertions.revertWithCustomError(g.write.mintHand([1n], { value: PRICE }), f.game, "WrongState");
  });

  it("enforces exact payment, per-wallet and per-round limits", async () => {
    const f = await deployGame({ mint: { price: PRICE, maxPerWallet: 2, maxPerRound: 3 } });
    await f.game.write.startGame([commitmentFor(seedFor(1))]);
    const a = await f.as(f.players[0]);
    const b = await f.as(f.players[1]);

    await f.viem.assertions.revertWithCustomError(a.write.mintHand([1n], { value: PRICE - 1n }), f.game, "WrongPayment");
    await f.viem.assertions.revertWithCustomError(a.write.mintHand([1n], { value: PRICE + 1n }), f.game, "WrongPayment");
    await f.viem.assertions.revertWithCustomError(a.write.mintHand([0n]), f.game, "ZeroQuantity");
    await f.viem.assertions.revertWithCustomError(a.write.mintHand([3n], { value: PRICE * 3n }), f.game, "WalletMintLimit");

    await a.write.mintHand([2n], { value: PRICE * 2n });
    await f.viem.assertions.revertWithCustomError(b.write.mintHand([2n], { value: PRICE * 2n }), f.game, "RoundMintLimit");
    await b.write.mintHand([1n], { value: PRICE });

    assert.equal(await f.game.read.totalSupply(), 3n);
    assert.equal(await f.game.read.roundPot([1n]), PRICE * 3n);
    assert.equal(await f.game.read.mintedInRound([1n, f.players[0].account.address]), 2n);
  });

  it("allows free minting when price is zero", async () => {
    const f = await deployGame({ mint: { price: 0n, maxPerWallet: 0, maxPerRound: 0 } });
    await f.game.write.startGame([commitmentFor(seedFor(1))]);
    const a = await f.as(f.players[0]);
    await a.write.mintHand([5n]);
    assert.equal(await f.game.read.balanceOf([f.players[0].account.address]), 5n);
  });

  it("keeps traits hidden until the seed is revealed, then rolls them in range", async () => {
    const f = await deployGame();
    await f.game.write.startGame([commitmentFor(seedFor(1))]);
    const a = await f.as(f.players[0]);
    const b = await f.as(f.players[1]);
    await a.write.mintHand([3n], { value: PRICE * 3n });
    await b.write.mintHand([3n], { value: PRICE * 3n });

    const [bg0, hand0] = (await f.game.read.traitsOf([1n])) as [number, number];
    assert.equal(bg0, 0);
    assert.equal(hand0, 0);
    const uriBefore = (await f.game.read.tokenURI([1n])) as string;
    assert.match(decodeDataUri(uriBefore), /Unrevealed/);

    await f.game.write.endMinting([seedFor(1)]);
    for (let id = 1n; id <= 6n; id++) {
      const [bg, hand] = (await f.game.read.traitsOf([id])) as [number, number];
      assert.ok(bg >= 1 && bg <= 20, `background ${bg}`);
      assert.ok(hand >= 1 && hand <= 41, `hand ${hand}`);
      const json = decodeDataUri((await f.game.read.tokenURI([id])) as string);
      assert.match(json, /"Hot Potato Hand #/);
      assert.doesNotMatch(json, /Unrevealed/);
    }
    const svg = (await f.game.read.getImageString([1n])) as string;
    assert.match(svg, /^<svg/);
  });
});

describe("Game: starting play", () => {
  it("needs two distinct holders and the right seed", async () => {
    const f = await deployGame();
    const seed = seedFor(1);
    await f.game.write.startGame([commitmentFor(seed)]);
    const a = await f.as(f.players[0]);
    await a.write.mintHand([2n], { value: PRICE * 2n });

    await f.viem.assertions.revertWithCustomError(f.game.write.endMinting([seed]), f.game, "NotEnoughPlayers");
    const b = await f.as(f.players[1]);
    await b.write.mintHand([1n], { value: PRICE });
    await f.viem.assertions.revertWithCustomError(f.game.write.endMinting([seedFor(2)]), f.game, "SeedMismatch");

    await f.viem.assertions.emit(f.game.write.endMinting([seed]), f.game, "PlayStarted");
    assert.equal(await f.game.read.state(), STATE.FinalRound); // only two wallets
    assert.notEqual(await f.game.read.potatoHolder(), zeroAddress);
    assert.equal(await f.game.read.activeHandCount([1n]), 3n);
    assert.equal(await f.game.read.activeWalletCount([1n]), 2n);
    const secondsLeft = Number(await f.game.read.getExplosionTime());
    assert.ok(secondsLeft > 0 && secondsLeft <= DEFAULT_FUSE.initial);
  });

  it("starts in Playing with three or more wallets", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    assert.equal(await f.game.read.state(), STATE.Playing);
  });

  it("only the owner can run the round", async () => {
    const f = await deployGame();
    const a = await f.as(f.players[0]);
    await f.viem.assertions.revertWithCustomError(a.write.startGame([commitmentFor(seedFor(1))]), f.game, "OwnableUnauthorizedAccount");
  });
});

describe("Game: passing and exploding", () => {
  it("lets the holder pass to another player's active hand and counts the pass", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    const holder = await holderClient(f);
    const g = await f.as(holder);
    const target = await activeTokenNotOwnedBy(f, holder.account.address);
    const own = (await f.game.read.getActiveTokensOfOwner([holder.account.address])) as bigint[];

    await f.viem.assertions.revertWithCustomError(g.write.passPotato([own[0]]), f.game, "CannotPassToSelf");
    await f.viem.assertions.revertWithCustomError(g.write.passPotato([999n]), f.game, "TargetNotActive");

    await f.viem.assertions.emit(g.write.passPotato([target]), f.game, "PotatoPassed");
    assert.equal(await f.game.read.potatoTokenId(), target);
    assert.equal(await f.game.read.roundPasses(), 1n);
    assert.equal(await f.game.read.successfulPasses([holder.account.address]), 1n);
    assert.equal(await f.game.read.userHasPotatoToken([holder.account.address]), false);
  });

  it("rejects passes from anyone but the holder", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    const holder = await holderClient(f);
    const other = f.players.slice(0, 3).find((p) => p.account.address !== holder.account.address)!;
    const g = await f.as(other);
    const target = await activeTokenNotOwnedBy(f, other.account.address);
    await f.viem.assertions.revertWithCustomError(g.write.passPotato([target]), f.game, "NotPotatoHolder");
  });

  it("explodes on a late pass, eliminating that hand and moving the potato", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3), 2);
    const holder = await holderClient(f);
    const g = await f.as(holder);
    const burnt = await f.game.read.potatoTokenId();
    const target = await activeTokenNotOwnedBy(f, holder.account.address);

    await f.networkHelpers.time.increase(DEFAULT_FUSE.initial + 1);
    await f.viem.assertions.emitWithArgs(g.write.passPotato([target]), f.game, "PotatoExploded", [
      1n,
      burnt,
      holder.account.address,
      true,
    ]);
    assert.equal(await f.game.read.isActive([burnt]), false);
    assert.notEqual(await f.game.read.potatoTokenId(), burnt);
    assert.equal(await f.game.read.failedPasses([holder.account.address]), 1n);
    assert.equal(await f.game.read.activeHandCount([1n]), 5n);
    assert.equal(await f.game.read.activeHandsOf([holder.account.address]), 1n);
    assert.equal(await f.game.read.roundPasses(), 0n);
  });

  it("checkExplosion reverts while the fuse burns and works for anyone after", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    const stranger = await f.as(f.players[5]);
    await f.viem.assertions.revertWithCustomError(stranger.write.checkExplosion(), f.game, "FuseStillBurning");
    await f.networkHelpers.time.increase(DEFAULT_FUSE.initial + 1);
    await f.viem.assertions.emit(stranger.write.checkExplosion(), f.game, "PotatoExploded");
  });

  it("shortens the fuse as passes accumulate, down to the minimum", async () => {
    const f = await deployGame({ fuse: { initial: 60, decreaseEvery: 2, decreaseBy: 20, minimum: 15 } });
    await playRound(f, f.players.slice(0, 3), 2);

    // 4 passes => 2 steps => 60 - 40 = 20s; 6 passes => 60 - 60 < min => 15s
    for (let i = 0; i < 4; i++) await passOnce(f);
    await f.networkHelpers.time.increase(100);
    await f.game.write.checkExplosion();
    assert.equal(await f.game.read.roundPasses(), 4n);
    assert.equal(Number(await f.game.read.getExplosionTime()), 20);

    for (let i = 0; i < 2; i++) await passOnce(f);
    await f.networkHelpers.time.increase(100);
    await f.game.write.checkExplosion();
    assert.equal(Number(await f.game.read.getExplosionTime()), 15);
  });

  it("locks hand transfers during play and while paused mid-play", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    const a = await f.as(f.players[0]);
    const own = (await f.game.read.tokensOfOwner([f.players[0].account.address])) as bigint[];
    await f.viem.assertions.revertWithCustomError(
      a.write.transferFrom([f.players[0].account.address, f.players[5].account.address, own[0]]),
      f.game,
      "HandsLockedDuringPlay",
    );
    await f.game.write.pauseGame();
    await f.viem.assertions.revertWithCustomError(
      a.write.transferFrom([f.players[0].account.address, f.players[5].account.address, own[0]]),
      f.game,
      "HandsLockedDuringPlay",
    );
    await f.game.write.resumeGame();
    await explodeUntilEnded(f);
    await a.write.transferFrom([f.players[0].account.address, f.players[5].account.address, own[0]]);
    assert.equal(getAddress((await f.game.read.ownerOf([own[0]])) as Address), getAddress(f.players[5].account.address));
  });
});

describe("Game: finishing and payouts", () => {
  it("ends with one wallet left, records the win and splits the pot", async () => {
    const f = await deployGame();
    const roster = f.players.slice(0, 4);
    await playRound(f, roster, 2);
    const pot = PRICE * 8n;
    assert.equal(await f.game.read.roundPot([1n]), pot);

    await explodeUntilEnded(f);
    assert.equal(await f.game.read.state(), STATE.Ended);
    const winner = (await f.game.read.hallOfFame([1n])) as Address;
    assert.notEqual(winner, zeroAddress);
    assert.equal(await f.game.read.totalWins([winner]), 1n);
    assert.deepEqual(await f.game.read.getAllWinners(), [winner]);
    assert.equal(await f.game.read.activeWalletCount([1n]), 1n);
    assert.equal(await f.game.read.activeHandsOf([winner]) >= 1n, true);
    assert.equal(await f.game.read.potatoHolder(), zeroAddress);

    const project = (pot * 1000n) / 10000n;
    const team = (pot * 3000n) / 10000n;
    const charity = (pot * 2000n) / 10000n;
    assert.equal(await f.game.read.rewards([winner]), pot - project - team - charity);
    assert.equal(await f.game.read.rewards([f.project.account.address]), project);
    assert.equal(await f.game.read.rewards([f.team1.account.address]), team / 2n);
    assert.equal(await f.game.read.rewards([f.team2.account.address]), team - team / 2n);
    assert.equal(await f.game.read.rewards([f.charity.account.address]), charity);

    const total =
      ((await f.game.read.rewards([winner])) as bigint) +
      project + team + charity;
    assert.equal(total, pot);
  });

  it("lets everyone withdraw exactly once", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    await explodeUntilEnded(f);
    const winner = (await f.game.read.hallOfFame([1n])) as Address;
    const winnerClient = [...f.players].find((p) => p.account.address.toLowerCase() === winner.toLowerCase())!;
    const g = await f.as(winnerClient);
    const owed = (await f.game.read.rewards([winner])) as bigint;
    assert.ok(owed > 0n);

    await f.viem.assertions.balancesHaveChanged(g.write.withdraw(), [{ address: winner, amount: owed }]);
    assert.equal(await f.game.read.rewards([winner]), 0n);
    await f.viem.assertions.revertWithCustomError(g.write.withdraw(), f.game, "NothingToWithdraw");

    const charityClient = await f.viem.getContractAt("Game", f.game.address, { client: { wallet: f.charity } });
    await charityClient.write.withdraw();
    assert.equal(await f.game.read.rewards([f.charity.account.address]), 0n);
  });

  it("pays a winner with no hands minted this round out of the current pot", async () => {
    // Round 1: three players mint. Round 2: nobody mints, same hands play again.
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    await explodeUntilEnded(f);
    const seed2 = seedFor(2);
    await f.game.write.startGame([commitmentFor(seed2)]);
    await f.game.write.endMinting([seed2]);
    assert.equal(await f.game.read.currentRound(), 2n);
    assert.equal(await f.game.read.activeHandCount([2n]), 3n);
    assert.equal(await f.game.read.roundPot([2n]), 0n);
    await explodeUntilEnded(f);
    assert.notEqual(await f.game.read.hallOfFame([2n]), zeroAddress);
  });
});

describe("Game: multiple rounds", () => {
  it("plays three rounds in a row with new and returning hands", async () => {
    const f = await deployGame();
    const r1 = f.players.slice(0, 3);
    await playRound(f, r1, 1, 1);
    await explodeUntilEnded(f);

    // Round 2: two new players join, old hands return.
    await playRound(f, f.players.slice(3, 5), 2, 2);
    assert.equal(await f.game.read.activeHandCount([2n]), 7n);
    assert.equal(await f.game.read.activeWalletCount([2n]), 5n);
    assert.equal(await f.game.read.roundPot([2n]), PRICE * 4n);
    for (let id = 1n; id <= 7n; id++) assert.equal(await f.game.read.isActive([id]), true);
    await explodeUntilEnded(f);
    assert.equal(await f.game.read.activeWalletCount([2n]), 1n);

    // Round 3: nobody new.
    const seed3 = seedFor(3);
    await f.game.write.startGame([commitmentFor(seed3)]);
    await f.game.write.endMinting([seed3]);
    assert.equal(await f.game.read.activeHandCount([3n]), 7n);
    assert.equal(await f.game.read.activeWalletCount([3n]), 5n);
    await explodeUntilEnded(f);

    const winners = (await f.game.read.getAllWinners()) as Address[];
    assert.equal(winners.length, 3);
    assert.equal(await f.game.read.roundOfToken([1n]), 1n);
    assert.equal(await f.game.read.roundOfToken([4n]), 2n);
    assert.equal(await f.game.read.roundOfToken([7n]), 2n);
    // Traits of round 1 hands are unchanged by later rounds.
    const [bg] = (await f.game.read.traitsOf([1n])) as [number, number];
    assert.ok(bg >= 1);
  });

  it("re-counts wallets correctly after hands change owners between rounds", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3), 1, 1);
    await explodeUntilEnded(f);

    // Player 0 gives their only hand to player 1: holders drop from 3 to 2.
    const a = await f.as(f.players[0]);
    await a.write.transferFrom([f.players[0].account.address, f.players[1].account.address, 1n]);
    const seed2 = seedFor(2);
    await f.game.write.startGame([commitmentFor(seed2)]);
    await f.game.write.endMinting([seed2]);
    assert.equal(await f.game.read.activeWalletCount([2n]), 2n);
    assert.equal(await f.game.read.state(), STATE.FinalRound);
    assert.equal(await f.game.read.activeHandsOf([f.players[1].account.address]), 2n);
    await explodeUntilEnded(f);
    const winner = (await f.game.read.hallOfFame([2n])) as Address;
    assert.ok([f.players[1], f.players[2]].some((p) => p.account.address.toLowerCase() === winner.toLowerCase()));
  });

  it("exposes a paginated leaderboard of every address that ever held a hand", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    await explodeUntilEnded(f);
    assert.equal(await f.game.read.playerCount(), 3n);
    const [players, passes, fails, wins] = (await f.game.read.getLeaderboard([0n, 10n])) as [
      Address[],
      bigint[],
      bigint[],
      bigint[],
    ];
    assert.equal(players.length, 3);
    assert.equal(wins.reduce((a, b) => a + b, 0n), 1n);
    assert.equal(fails.reduce((a, b) => a + b, 0n), 2n);
    assert.equal(passes.length, 3);
    const [page2] = await f.game.read.getLeaderboard([2n, 10n]);
    assert.equal(page2.length, 1);
    const [page3] = await f.game.read.getLeaderboard([5n, 10n]);
    assert.equal(page3.length, 0);
  });
});

describe("Game: pause, resume, cancel", () => {
  it("keeps the remaining fuse across a pause", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    await f.networkHelpers.time.increase(20);
    await f.game.write.pauseGame();
    const left = Number(await f.game.read.getExplosionTime());
    assert.ok(left >= 38 && left <= 40, `left=${left}`);
    await f.networkHelpers.time.increase(600);
    assert.equal(Number(await f.game.read.getExplosionTime()), left);
    const holder = await holderClient(f);
    const g = await f.as(holder);
    await f.viem.assertions.revertWithCustomError(g.write.passPotato([1n]), f.game, "WrongState");
    await f.viem.assertions.revertWithCustomError(f.game.write.checkExplosion(), f.game, "WrongState");

    await f.game.write.resumeGame();
    const after = Number(await f.game.read.getExplosionTime());
    assert.ok(after >= left - 2 && after <= left, `after=${after}`);
    assert.equal(await f.game.read.state(), STATE.Playing);
  });

  it("can pause and resume minting", async () => {
    const f = await deployGame();
    await f.game.write.startGame([commitmentFor(seedFor(1))]);
    await f.game.write.pauseGame();
    const a = await f.as(f.players[0]);
    await f.viem.assertions.revertWithCustomError(a.write.mintHand([1n], { value: PRICE }), f.game, "WrongState");
    await f.game.write.resumeGame();
    await a.write.mintHand([1n], { value: PRICE });
    assert.equal(await f.game.read.state(), STATE.Minting);
  });

  it("cancels a round, rolls the pot over, and still reveals traits", async () => {
    const f = await deployGame();
    await f.game.write.startGame([commitmentFor(seedFor(1))]);
    const a = await f.as(f.players[0]);
    await a.write.mintHand([2n], { value: PRICE * 2n });
    await f.game.write.cancelRound();
    assert.equal(await f.game.read.state(), STATE.Queued);
    assert.equal(await f.game.read.rolloverPot(), PRICE * 2n);
    const [bg, hand] = (await f.game.read.traitsOf([1n])) as [number, number];
    assert.ok(bg >= 1 && hand >= 1);

    await playRound(f, f.players.slice(1, 3), 1, 2);
    assert.equal(await f.game.read.roundPot([2n]), PRICE * 4n);
    assert.equal(await f.game.read.rolloverPot(), 0n);
    assert.equal(await f.game.read.activeHandCount([2n]), 4n);
    await explodeUntilEnded(f);
    const winner = (await f.game.read.hallOfFame([2n])) as Address;
    const owed = (await f.game.read.rewards([winner])) as bigint;
    assert.equal(owed, (PRICE * 4n * 4000n) / 10000n);
  });

  it("cancelling mid-play unlocks transfers and keeps stats", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    await f.networkHelpers.time.increase(DEFAULT_FUSE.initial + 1);
    await f.game.write.checkExplosion();
    await f.game.write.cancelRound();
    assert.equal(await f.game.read.potatoHolder(), zeroAddress);
    assert.equal(await f.game.read.getExplosionTime(), 0n);
    const a = await f.as(f.players[0]);
    await a.write.transferFrom([f.players[0].account.address, f.players[5].account.address, 1n]);
  });
});

describe("Game: admin config", () => {
  it("rejects config changes mid-play and bad fuse settings", async () => {
    const f = await deployGame();
    await f.viem.assertions.revertWithCustomError(
      f.game.write.setFuseConfig([{ initial: 10, decreaseEvery: 0, decreaseBy: 0, minimum: 15 }]),
      f.game,
      "InvalidFuseConfig",
    );
    await playRound(f, f.players.slice(0, 3));
    await f.viem.assertions.revertWithCustomError(
      f.game.write.setMintConfig([{ price: 0n, maxPerWallet: 0, maxPerRound: 0 }]),
      f.game,
      "WrongState",
    );
    await f.viem.assertions.revertWithCustomError(
      f.game.write.setFuseConfig([{ initial: 30, decreaseEvery: 0, decreaseBy: 0, minimum: 15 }]),
      f.game,
      "WrongState",
    );
    await explodeUntilEnded(f);
    await f.game.write.setMintConfig([{ price: parseEther("0.02"), maxPerWallet: 5, maxPerRound: 100 }]);
    const info = (await f.game.read.getGameInfo()) as { mintPrice: bigint; maxPerWallet: bigint };
    assert.equal(info.mintPrice, parseEther("0.02"));
    assert.equal(info.maxPerWallet, 5n);
  });

  it("rejects zero payees", async () => {
    const f = await deployGame();
    await f.viem.assertions.revertWithCustomError(
      f.game.write.setPayees([zeroAddress, f.team1.account.address, f.team2.account.address, f.charity.account.address]),
      f.game,
      "ZeroAddress",
    );
  });

  it("reports game info in one call", async () => {
    const f = await deployGame();
    await playRound(f, f.players.slice(0, 3));
    const info = (await f.game.read.getGameInfo()) as {
      state: number;
      round: bigint;
      activeHands: bigint;
      activeWallets: bigint;
      pot: bigint;
      seedRevealed: boolean;
      potatoHolder: Address;
    };
    assert.equal(info.state, STATE.Playing);
    assert.equal(info.round, 1n);
    assert.equal(info.activeHands, 3n);
    assert.equal(info.activeWallets, 3n);
    assert.equal(info.pot, PRICE * 3n);
    assert.equal(info.seedRevealed, true);
    assert.equal(info.potatoHolder, await f.game.read.potatoHolder());
    assert.equal(await f.game.read.getGameState(), "Playing");
  });
});

describe("Game: scale", () => {
  it("handles a round with 40 wallets x 3 hands within sane gas", async () => {
    const f = await deployGame({ mint: { price: 0n, maxPerWallet: 0, maxPerRound: 0 } });
    const extra = await f.viem.getWalletClients();
    const roster = extra.slice(5, 45);
    assert.equal(roster.length, 40);
    await f.game.write.startGame([commitmentFor(seedFor(1))]);
    for (const p of roster) {
      const g = await f.as(p);
      await g.write.mintHand([3n]);
    }
    const hash = await f.game.write.endMinting([seedFor(1)]);
    const receipt = await f.publicClient.waitForTransactionReceipt({ hash });
    assert.ok(receipt.gasUsed < 300_000n, `endMinting used ${receipt.gasUsed}`);

    // The round ends when 39 wallets are out, which takes between 117 and 119 explosions.
    let maxExplodeGas = 0n;
    let explosions = 0;
    while ((await f.game.read.state()) !== STATE.Ended) {
      await f.networkHelpers.time.increase(100);
      const h = await f.game.write.checkExplosion();
      const r = await f.publicClient.waitForTransactionReceipt({ hash: h });
      if (r.gasUsed > maxExplodeGas) maxExplodeGas = r.gasUsed;
      explosions++;
    }
    assert.ok(explosions >= 117 && explosions <= 119, `explosions=${explosions}`);
    assert.ok(maxExplodeGas < 250_000n, `explosion used ${maxExplodeGas}`);
  });
});

function decodeDataUri(uri: string): string {
  const prefix = "data:application/json;base64,";
  assert.ok(uri.startsWith(prefix));
  return Buffer.from(uri.slice(prefix.length), "base64").toString("utf8");
}

async function passOnce(f: Awaited<ReturnType<typeof deployGame>>) {
  const holder = await holderClient(f);
  const g = await f.as(holder);
  const target = await activeTokenNotOwnedBy(f, holder.account.address);
  await g.write.passPotato([target]);
}
