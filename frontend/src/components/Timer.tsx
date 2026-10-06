import React from 'react'
import Image from 'next/image'
import Explosion from '../../public/assets/images/Explosion.gif'
import { GameState, isLiveState } from '../lib/game'

interface TimerProps {
  darkMode: boolean
  state: number | undefined
  /** Seconds left on the fuse (frozen while paused), or null when no fuse is burning. */
  countdown: number | null
  explosion: boolean
  onCheckExplosion: () => void
  busy: boolean
}

/** Fuse countdown, plus the "Check Explosion" button anyone can press once it reaches zero. */
export default function Timer({ darkMode, state, countdown, explosion, onCheckExplosion, busy }: TimerProps) {
  const live = isLiveState(state)
  const paused = state === GameState.Paused && countdown !== null
  const showTimer = (live && countdown !== null && countdown > 0) || paused
  const showCheckButton = live && countdown === 0

  if (!showTimer && !showCheckButton && !explosion) return null

  return (
    <div className={`w-full max-w-md mx-auto ${darkMode ? 'bg-red-900/95 border-red-700' : 'bg-red-100 border-red-300'} border-2 shadow-lg rounded-xl p-6 text-center animate-fade-in-up`}>
      {showTimer && (
        <>
          <div className="text-5xl mb-3">{paused ? '⏸️' : '⏰'}</div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-800'} mb-2`}>
            {paused ? 'Fuse Paused' : 'Time Remaining'}
          </h2>
          <div className={`text-4xl font-bold ${darkMode ? 'text-red-300' : 'text-red-600'} mb-2`}>{countdown}s</div>
          <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
            {paused ? 'left on the fuse when play resumes' : 'until explosion!'}
          </p>
        </>
      )}

      {explosion && (
        <div className="mt-4 flex justify-center">
          <Image src={Explosion} alt="Explosion" width={150} height={150} />
        </div>
      )}

      {showCheckButton && (
        <div className="space-y-4">
          <div className="text-5xl mb-2 animate-bounce">💥</div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-800'}`}>Time&apos;s Up!</h2>
          <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'} px-2`}>
            The fuse has run out. Anyone can set off the explosion.
          </p>
          <button
            onClick={onCheckExplosion}
            disabled={busy}
            className={`w-full px-6 py-3 rounded-lg font-bold text-base transition-all transform ${
              busy
                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-105'
            }`}
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Working...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">💥 Check Explosion</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
