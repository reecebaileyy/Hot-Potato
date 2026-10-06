import { useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { zeroAddress, type Address } from 'viem'
import { isGameConfigured } from '../config/chain'
import { GameState, gameContract } from '../lib/game'

const GAME_INFO_POLL_MS = 4_000

/**
 * Everything the play page needs about the current round, from one `getGameInfo()` call that
 * is polled every few seconds and refetched on contract events.
 */
export function useGameInfo() {
  const query = useReadContract({
    ...gameContract,
    functionName: 'getGameInfo',
    query: {
      enabled: isGameConfigured,
      refetchInterval: GAME_INFO_POLL_MS,
      refetchIntervalInBackground: false,
    },
  })
  return {
    info: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    /** Local time (ms) of the read, used to line the countdown up with the chain clock. */
    updatedAt: query.dataUpdatedAt,
  }
}

export type GameInfo = NonNullable<ReturnType<typeof useGameInfo>['info']>

/** Values that rarely change: the owner (admin) and the art renderer. */
export function useGameMeta() {
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...gameContract, functionName: 'owner' },
      { ...gameContract, functionName: 'metadataHandler' },
    ],
    query: { enabled: isGameConfigured, staleTime: 5 * 60_000 },
  })
  return {
    owner: data?.[0]?.result as Address | undefined,
    metadataHandler: data?.[1]?.result as Address | undefined,
    refetch,
  }
}

/** Winner of `round` once it has ended (zero address while the round is open or if cancelled). */
export function useRoundWinner(info: GameInfo | undefined) {
  const ended = info?.state === GameState.Ended
  const { data, refetch } = useReadContract({
    ...gameContract,
    functionName: 'hallOfFame',
    args: [info?.round ?? 0n],
    query: { enabled: isGameConfigured && ended },
  })
  const winner = ended && data && data !== zeroAddress ? data : undefined
  return { winner, refetch }
}

/**
 * Hands taking part in the round. Once play has started that is `getActiveTokenIds()`;
 * before that every hand ever minted joins the next round, so it is 1..totalMinted.
 */
export function useRoundTokenIds(info: GameInfo | undefined) {
  const inPlay =
    !!info &&
    info.seedRevealed &&
    info.activeHands > 0n &&
    (info.state === GameState.Playing ||
      info.state === GameState.FinalRound ||
      info.state === GameState.Ended ||
      info.state === GameState.Paused)

  const { data, isLoading, refetch } = useReadContract({
    ...gameContract,
    functionName: 'getActiveTokenIds',
    query: { enabled: isGameConfigured && inPlay },
  })

  const totalMinted = Number(info?.totalMinted ?? 0n)
  const tokenIds = useMemo(
    () =>
      inPlay ? (data ?? []).map(Number) : Array.from({ length: totalMinted }, (_, i) => i + 1),
    [inPlay, data, totalMinted],
  )

  return { tokenIds, inPlay, isLoading: inPlay && isLoading, refetch }
}
