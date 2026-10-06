import { useCallback, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { GAME_ADDRESS, chain } from '../config/chain'

export interface ClaimHistoryItem {
  amount: string
  txHash: string
  timestamp: number
  round?: number
}

function readHistory(key: string): ClaimHistoryItem[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? (parsed as ClaimHistoryItem[]) : []
  } catch {
    return []
  }
}

/** Claims made from this browser, per chain, game and wallet (kept in localStorage). */
export function useClaimHistory(address: Address | undefined) {
  const key = address
    ? `hotpotato:claims:${chain.id}:${GAME_ADDRESS.toLowerCase()}:${address.toLowerCase()}`
    : null
  const [version, setVersion] = useState(0)

  const history = useMemo(
    () => (key ? readHistory(key) : []),
    // `version` re-reads storage after addClaim writes to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, version],
  )

  const addClaim = useCallback(
    (item: ClaimHistoryItem) => {
      if (!key) return
      try {
        window.localStorage.setItem(key, JSON.stringify([item, ...readHistory(key)].slice(0, 50)))
      } catch {
        // storage unavailable: the claim still happened on chain
      }
      setVersion((v) => v + 1)
    },
    [key],
  )

  return { history, addClaim }
}
