import { useCallback, useMemo } from 'react'
import { useBalance, useReadContracts } from 'wagmi'
import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { chain, isGameConfigured } from '../config/chain'
import { gameContract } from '../lib/game'
import type { GameInfo } from './useGame'

const PLAYER_POLL_MS = 15_000

/** Stats, hands and claimable rewards of `address`, read in one multicall. */
export function usePlayer(address: Address | undefined, info: GameInfo | undefined) {
  const round = info?.round ?? 0n
  const enabled = isGameConfigured && !!address
  const player = address ?? zeroAddress

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...gameContract, functionName: 'rewards', args: [player] },
      { ...gameContract, functionName: 'getPlayerStats', args: [player] },
      { ...gameContract, functionName: 'tokensOfOwner', args: [player] },
      { ...gameContract, functionName: 'getActiveTokensOfOwner', args: [player] },
      { ...gameContract, functionName: 'mintedInRound', args: [round, player] },
    ],
    query: { enabled, refetchInterval: PLAYER_POLL_MS, refetchIntervalInBackground: false },
  })

  const balance = useBalance({
    address,
    chainId: chain.id,
    query: { enabled: !!address, refetchInterval: PLAYER_POLL_MS },
  })

  const rewards = data?.[0]?.result
  const stats = data?.[1]?.result
  const owned = data?.[2]?.result
  const active = data?.[3]?.result
  const mintedThisRound = data?.[4]?.result

  const ownedTokenIds = useMemo(() => (owned ?? []).map(Number), [owned])
  const activeTokenIds = useMemo(() => (active ?? []).map(Number), [active])

  const refetchBalance = balance.refetch
  const refetchAll = useCallback(() => {
    void refetch()
    void refetchBalance()
  }, [refetch, refetchBalance])

  const holdsPotato =
    !!address && !!info?.potatoHolder && isAddressEqual(info.potatoHolder, address) && info.potatoTokenId > 0n

  return {
    isLoading: enabled && isLoading,
    refetch: refetchAll,
    rewards: rewards ?? 0n,
    passes: stats ? Number(stats[0]) : 0,
    fails: stats ? Number(stats[1]) : 0,
    wins: stats ? Number(stats[2]) : 0,
    ownedTokenIds,
    activeTokenIds,
    mintedThisRound: mintedThisRound ?? 0n,
    holdsPotato,
    balance: balance.data?.value,
  }
}

export type PlayerData = ReturnType<typeof usePlayer>
