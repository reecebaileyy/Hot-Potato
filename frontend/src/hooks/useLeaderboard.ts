import { useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { zeroAddress, type Address } from 'viem'
import { isGameConfigured } from '../config/chain'
import { GameState, gameContract, winnerPrize } from '../lib/game'

export interface LeaderboardEntry {
  address: Address
  wins: number
  passes: number
  fails: number
}

/** Players per getLeaderboard call. Pages are fetched together in one multicall. */
const PAGE_SIZE = 250n

/** Wins first, then successful passes, then fewest explosions. */
export function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  return b.wins - a.wins || b.passes - a.passes || a.fails - b.fails
}

/** Lifetime stats of every address that ever held a hand, from `getLeaderboard(offset, limit)`. */
export function useLeaderboard() {
  const countQuery = useReadContract({
    ...gameContract,
    functionName: 'playerCount',
    query: { enabled: isGameConfigured },
  })
  const playerCount = countQuery.data ?? 0n

  const pages = useMemo(() => {
    const offsets: bigint[] = []
    for (let offset = 0n; offset < playerCount; offset += PAGE_SIZE) offsets.push(offset)
    return offsets
  }, [playerCount])

  const pagesQuery = useReadContracts({
    contracts: pages.map((offset) => ({
      ...gameContract,
      functionName: 'getLeaderboard' as const,
      args: [offset, PAGE_SIZE] as const,
    })),
    allowFailure: false,
    query: { enabled: isGameConfigured && pages.length > 0 },
  })

  const entries = useMemo(() => {
    const rows: LeaderboardEntry[] = []
    for (const [players, passes, fails, wins] of pagesQuery.data ?? []) {
      players.forEach((address, i) => {
        rows.push({
          address,
          passes: Number(passes[i]),
          fails: Number(fails[i]),
          wins: Number(wins[i]),
        })
      })
    }
    return rows.sort(compareEntries)
  }, [pagesQuery.data])

  return {
    entries,
    playerCount: Number(playerCount),
    isLoading: countQuery.isLoading || (pages.length > 0 && pagesQuery.isLoading),
    error: countQuery.error ?? pagesQuery.error,
    refetch: () => {
      void countQuery.refetch()
      void pagesQuery.refetch()
    },
  }
}

export type RoundOutcome = 'won' | 'live' | 'cancelled'

export interface HallOfFameEntry {
  round: number
  outcome: RoundOutcome
  winner: Address | null
  pot: bigint
  /** Winner's share of the pot (40%; the winner also gets rounding dust). */
  prize: bigint
}

/** Winner and pot of every round so far, newest first. */
export function useHallOfFame() {
  const headQuery = useReadContracts({
    contracts: [
      { ...gameContract, functionName: 'currentRound' },
      { ...gameContract, functionName: 'state' },
    ],
    allowFailure: false,
    query: { enabled: isGameConfigured },
  })
  const currentRound = Number(headQuery.data?.[0] ?? 0n)
  const state = headQuery.data?.[1]
  // A cancelled round goes back to Queued, so only an open round is still live.
  const currentIsLive = state !== undefined && state !== GameState.Queued && state !== GameState.Ended

  const rounds = useMemo(
    () => Array.from({ length: currentRound }, (_, i) => BigInt(currentRound - i)),
    [currentRound],
  )

  const roundsQuery = useReadContracts({
    contracts: rounds.flatMap((round) => [
      { ...gameContract, functionName: 'hallOfFame' as const, args: [round] as const },
      { ...gameContract, functionName: 'roundPot' as const, args: [round] as const },
    ]),
    query: { enabled: isGameConfigured && rounds.length > 0 },
  })

  const entries = useMemo<HallOfFameEntry[]>(() => {
    const data = roundsQuery.data
    if (!data) return []
    return rounds.map((round, i) => {
      const winner = data[i * 2]?.result as Address | undefined
      const pot = (data[i * 2 + 1]?.result as bigint | undefined) ?? 0n
      const hasWinner = !!winner && winner !== zeroAddress
      const isCurrent = Number(round) === currentRound
      const outcome: RoundOutcome = hasWinner ? 'won' : isCurrent && currentIsLive ? 'live' : 'cancelled'
      return {
        round: Number(round),
        outcome,
        winner: hasWinner ? winner : null,
        pot,
        prize: hasWinner ? winnerPrize(pot) : 0n,
      }
    })
  }, [rounds, roundsQuery.data, currentRound, currentIsLive])

  return {
    entries,
    currentRound,
    isLoading: headQuery.isLoading || (rounds.length > 0 && roundsQuery.isLoading),
    error: headQuery.error ?? roundsQuery.error,
  }
}
