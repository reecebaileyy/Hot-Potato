import React from 'react'
import { formatEth, gameStateLabel, isLiveState } from '../lib/game'
import type { GameInfo } from '../hooks/useGame'

interface RoundSummaryProps {
  darkMode: boolean
  info: GameInfo | undefined
  compact?: boolean
}

/** "Round N" headline with the round's key numbers. */
export default function RoundSummary({ darkMode, info, compact = false }: RoundSummaryProps) {
  const round = info && info.round > 0n ? info.round.toString() : null
  const title = round ? `Round ${round}` : 'Hot Potato'

  if (compact) {
    return (
      <h1 className="text-xl sm:text-2xl font-bold gradient-text glow">
        {title}
        {info && <span className="ml-2 text-sm align-middle">· {gameStateLabel(info.state)}</span>}
      </h1>
    )
  }

  const stats = info
    ? [
        { label: 'State', value: gameStateLabel(info.state) },
        { label: 'Pot', value: `${formatEth(info.pot)} ETH` },
        isLiveState(info.state) || info.activeHands > 0n
          ? { label: 'Hands in play', value: info.activeHands.toString() }
          : { label: 'Minted this round', value: info.mintedThisRound.toString() },
        isLiveState(info.state)
          ? { label: 'Players left', value: info.activeWallets.toString() }
          : { label: 'Total hands', value: info.totalMinted.toString() },
        { label: 'Passes', value: info.roundPasses.toString() },
      ]
    : []

  return (
    <div className="text-center mb-8 sm:mb-12 animate-fade-in-up px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 gradient-text glow">{title}</h1>
      <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-amber-500 to-red-500 mx-auto rounded-full" />
      {stats.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-900/70 text-white' : 'bg-white/80 text-gray-900'} shadow`}
            >
              <div className="text-xs uppercase tracking-wide opacity-70">{stat.label}</div>
              <div className="text-lg font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
