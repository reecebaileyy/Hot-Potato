import React from 'react'
import { formatEth } from '../lib/game'

interface PlayerStatsProps {
  darkMode: boolean
  wins: number
  passes: number
  fails: number
  activeHands: number
  rewards: bigint
}

export default function PlayerStats({ darkMode, wins, passes, fails, activeHands, rewards }: PlayerStatsProps) {
  const stats = [
    { label: 'Total Wins', value: wins, tone: 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20', text: darkMode ? 'text-yellow-400' : 'text-green-600' },
    { label: 'Successful Passes', value: passes, tone: 'from-blue-500/10 to-blue-600/10 border-blue-500/20', text: darkMode ? 'text-blue-400' : 'text-blue-600' },
    { label: 'Explosions', value: fails, tone: 'from-red-500/10 to-red-600/10 border-red-500/20', text: darkMode ? 'text-red-400' : 'text-red-600' },
    { label: 'Hands in Play', value: activeHands, tone: 'from-purple-500/10 to-purple-600/10 border-purple-500/20', text: darkMode ? 'text-purple-400' : 'text-purple-600' },
  ]

  return (
    <div className={`w-full max-w-6xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-6 lg:p-8 animate-fade-in-up`}>
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 gradient-text glow">Player Stats</h2>
      <div className="grid grid-cols-2 gap-6 lg:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`text-center p-4 rounded-lg bg-gradient-to-br border ${stat.tone}`}>
            <p className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>{stat.label}</p>
            <p className={`text-3xl lg:text-4xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
        <p className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Claimable</p>
        <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{formatEth(rewards)} ETH</p>
      </div>
    </div>
  )
}
