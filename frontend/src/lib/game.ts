import { formatEther } from 'viem'
import { gameAbi } from '../abi/gameAbi'
import { GAME_ADDRESS } from '../config/chain'

/** `{ address, abi }` for wagmi/viem calls against the Game contract. */
export const gameContract = { address: GAME_ADDRESS, abi: gameAbi } as const

/** Mirrors `Game.GameState`. */
export const GameState = {
  Queued: 0,
  Minting: 1,
  Playing: 2,
  Paused: 3,
  FinalRound: 4,
  Ended: 5,
} as const
export type GameState = (typeof GameState)[keyof typeof GameState]

const STATE_LABELS: Record<GameState, string> = {
  [GameState.Queued]: 'Queued',
  [GameState.Minting]: 'Minting',
  [GameState.Playing]: 'Playing',
  [GameState.Paused]: 'Paused',
  [GameState.FinalRound]: 'Final Round',
  [GameState.Ended]: 'Ended',
}

export function gameStateLabel(state: number | undefined): string {
  if (state === undefined) return 'Loading'
  return STATE_LABELS[state as GameState] ?? `Unknown (${state})`
}

/** Playing or FinalRound: the fuse is burning and the potato can be passed. */
export function isLiveState(state: number | undefined): boolean {
  return state === GameState.Playing || state === GameState.FinalRound
}

/** Formats wei as ETH with at most `decimals` fraction digits, rounding down. */
export function formatEth(wei: bigint | undefined, decimals = 4): string {
  if (wei === undefined) return '0'
  const [whole, fraction = ''] = formatEther(wei).split('.')
  const trimmed = fraction.slice(0, decimals).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole
}

const BPS = 10_000n
const PROJECT_BPS = 1_000n
const TEAM_BPS = 3_000n
const CHARITY_BPS = 2_000n

/** Winner's prize for a pot, computed exactly like Game._finishRound (40% plus rounding dust). */
export function winnerPrize(pot: bigint): bigint {
  return pot - (pot * PROJECT_BPS) / BPS - (pot * TEAM_BPS) / BPS - (pot * CHARITY_BPS) / BPS
}
