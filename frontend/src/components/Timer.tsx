import React, { useState } from 'react'
import Image from 'next/image'
import Explosion from '../../public/assets/images/Explosion.gif'
import { GameState, isLiveState } from '../lib/game'

interface TimerProps {
  state: number | undefined
  /** Seconds left on the fuse (frozen while paused), or null when no fuse is burning. */
  countdown: number | null
  /** `explosionTime` of the current fuse; a new value resets the progress bar. */
  explosionTime: bigint | undefined
  /** True for a few seconds after a PotatoExploded event. */
  explosion: boolean
}

const DANGER_SECONDS = 10

/**
 * Fuse countdown: a big tabular number with a thin progress bar, plus the explosion GIF
 * while one goes off. Renders nothing when there is neither a fuse nor an explosion.
 */
export default function Timer({ state, countdown, explosionTime, explosion }: TimerProps) {
  const live = isLiveState(state)
  const paused = state === GameState.Paused && countdown !== null
  const showCountdown = (live && countdown !== null) || paused

  // Longest countdown seen for this fuse, so the bar drains from full even when the
  // fuse length is unknown. Stored from render (the "derive from previous render" pattern).
  const fuseKey = `${explosionTime ?? 0n}`
  const [fuse, setFuse] = useState({ key: fuseKey, total: countdown ?? 0 })
  if (countdown !== null && (fuse.key !== fuseKey || countdown > fuse.total)) {
    setFuse({ key: fuseKey, total: countdown })
  }
  const total = fuse.key === fuseKey ? fuse.total : countdown ?? 0
  const progress = countdown !== null && total > 0 ? Math.min(1, countdown / total) : 0

  if (!showCountdown && !explosion) return null

  const danger = !paused && countdown !== null && countdown < DANGER_SECONDS
  const label = paused ? 'Fuse paused' : countdown === 0 ? 'Fuse out' : 'Time left'
  const caption = paused
    ? 'Left on the fuse when play resumes.'
    : countdown === 0
      ? 'The fuse has run out.'
      : 'Until the potato explodes.'

  return (
    <div className="animate-fade-up">
      {showCountdown && (
        <>
          <p className="text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">{label}</p>
          <div
            className={`mt-1 text-[56px] sm:text-[72px] leading-none font-semibold tracking-tight tnum ${
              danger ? 'text-danger' : 'text-fg'
            }`}
            aria-live="off"
          >
            {countdown}
            <span className="ml-1 text-[28px] sm:text-[36px] text-fg-tertiary">s</span>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-apple ${danger ? 'bg-danger' : 'bg-accent'}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[13px] leading-5 text-fg-secondary">{caption}</p>
        </>
      )}

      {explosion && (
        <div className={`flex items-center gap-3 ${showCountdown ? 'mt-5' : ''}`}>
          <Image
            src={Explosion}
            alt="Explosion"
            width={96}
            height={96}
            unoptimized
            className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
          />
          <p className="text-[15px] leading-6 font-medium">Boom. A hand just exploded.</p>
        </div>
      )}
    </div>
  )
}
