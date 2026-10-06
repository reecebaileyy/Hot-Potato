import { useEffect, useMemo, useState } from 'react'
import { GameState, isLiveState } from '../lib/game'
import type { GameInfo } from './useGame'

/**
 * Seconds until the potato explodes, ticking client-side from `explosionTime`.
 *
 * `secondsLeft` in the same read tells us the chain's clock at read time
 * (explosionTime - secondsLeft), which corrects for a skewed local clock.
 * Returns null when no fuse is burning; while paused it is the frozen remainder.
 */
export function useCountdown(info: GameInfo | undefined, updatedAt: number): number | null {
  const [now, setNow] = useState(() => Date.now())
  const live = isLiveState(info?.state)

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [live])

  // chainTime - localTime, in seconds. Only derivable while the fuse still had time left.
  const clockOffset = useMemo(() => {
    if (!info || !live || info.secondsLeft === 0n || !updatedAt) return 0
    const chainNowAtRead = Number(info.explosionTime - info.secondsLeft)
    return chainNowAtRead - updatedAt / 1000
  }, [info, live, updatedAt])

  if (!info) return null
  if (info.state === GameState.Paused) return info.secondsLeft > 0n ? Number(info.secondsLeft) : null
  if (!live || info.explosionTime === 0n) return null
  const remaining = Number(info.explosionTime) - (now / 1000 + clockOffset)
  return Math.max(0, Math.ceil(remaining))
}
