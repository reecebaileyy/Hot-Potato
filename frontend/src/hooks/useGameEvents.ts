import { useCallback, useEffect, useRef, useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import type { Log } from 'viem'
import { isGameConfigured } from '../config/chain'
import { formatEth, gameContract } from '../lib/game'
import { formatAddress } from '../utils/formatAddress'

export interface FeedItem {
  id: string
  text: string
}

const FEED_LIMIT = 50
const REFRESH_DEBOUNCE_MS = 400
const EXPLOSION_ANIMATION_MS = 3_000

/** Minimal view of a decoded Game event log (wagmi decodes against the ABI). */
type GameLog = Log & { eventName?: string; args?: Record<string, unknown> }

const num = (value: unknown) => (typeof value === 'bigint' ? value.toString() : String(value ?? '?'))
const addr = (value: unknown) => formatAddress(typeof value === 'string' ? value : undefined)
const eth = (value: unknown) => formatEth(typeof value === 'bigint' ? value : 0n)

/** Feed copy for each Game event. Events that return null are not shown. */
function describeEvent(log: GameLog): string | null {
  const a = log.args ?? {}
  switch (log.eventName) {
    case 'MintingStarted':
      return `Round ${num(a.round)} minting is open (pot ${eth(a.pot)} ETH)`
    case 'HandsMinted': {
      const quantity = Number(a.quantity ?? 0)
      return `${addr(a.player)} minted ${quantity} hand${quantity === 1 ? '' : 's'}`
    }
    case 'PlayStarted':
      return `Round ${num(a.round)} is live: ${num(a.activeHands)} hands, ${num(a.activeWallets)} players. Potato starts on #${num(a.potatoTokenId)}`
    case 'PotatoPassed':
      return `#${num(a.fromTokenId)} passed the potato to #${num(a.toTokenId)}`
    case 'PotatoExploded':
      return `💥 #${num(a.tokenId)} exploded${a.duringPass ? ' mid-pass' : ''} (${addr(a.player)})`
    case 'PotatoAssigned':
      return `🥔 The potato lands on #${num(a.tokenId)}`
    case 'PlayerEliminated':
      return `${addr(a.player)} is out`
    case 'FinalRoundStarted':
      return '🔥 Final round: two players left'
    case 'GameEnded':
      return `🏆 ${addr(a.winner)} won round ${num(a.round)} and ${eth(a.prize)} ETH`
    case 'GamePaused':
      return 'Cooling off: the game is paused'
    case 'GameResumed':
      return 'Back to it: the game resumed'
    case 'RoundCancelled':
      return `Round ${num(a.round)} was cancelled; ${eth(a.rolledOver)} ETH rolls over`
    case 'FundsWithdrawn':
      return `${addr(a.account)} claimed ${eth(a.amount)} ETH`
    case 'SeedRevealed':
      return `Round ${num(a.round)} seed revealed: traits unlocked`
    case 'MintConfigUpdated':
      return `Mint price is now ${eth(a.price)} ETH`
    case 'FuseConfigUpdated':
      return `Fuse is now ${num(a.initial)}s (min ${num(a.minimum)}s)`
    default:
      return null
  }
}

/**
 * Watches every Game event with a single filter, turns them into a feed and calls `onChange`
 * (debounced) so the page refetches its reads right away instead of waiting for the next poll.
 */
export function useGameEvents(onChange: () => void) {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [explosion, setExplosion] = useState(false)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const explosionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      if (explosionTimer.current) clearTimeout(explosionTimer.current)
    },
    [],
  )

  const onLogs = useCallback((logs: unknown[]) => {
    const items: FeedItem[] = []
    for (const log of logs as GameLog[]) {
      if (log.eventName === 'PotatoExploded') {
        setExplosion(true)
        if (explosionTimer.current) clearTimeout(explosionTimer.current)
        explosionTimer.current = setTimeout(() => setExplosion(false), EXPLOSION_ANIMATION_MS)
      }
      const text = describeEvent(log)
      if (text) items.push({ id: `${log.transactionHash}-${log.logIndex}`, text })
    }

    if (items.length) {
      setFeed((prev) => {
        const seen = new Set(prev.map((item) => item.id))
        const fresh = items.filter((item) => !seen.has(item.id))
        return fresh.length ? [...prev, ...fresh].slice(-FEED_LIMIT) : prev
      })
    }

    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => onChangeRef.current(), REFRESH_DEBOUNCE_MS)
  }, [])

  useWatchContractEvent({
    ...gameContract,
    enabled: isGameConfigured,
    onLogs,
    onError: (error) => console.warn('Game event watcher error:', error.message),
  })

  return { feed, explosion }
}
