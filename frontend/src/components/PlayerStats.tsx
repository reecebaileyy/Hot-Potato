import React from 'react'

interface PlayerStatsProps {
  darkMode: boolean
  totalWins: number
  successfulPasses: number
  activeTokensCount: number
  rewards: string
}

export default function PlayerStats({ 
  darkMode, 
  totalWins, 
  successfulPasses, 
  activeTokensCount, 
  rewards 
}: PlayerStatsProps) {
  return (
    <div className={`w-full ${darkMode ? 'card-dark' : 'card'} p-6 animate-fade-in-up`}>
      <h2 className={`text-2xl font-bold text-center mb-6 gradient-text glow`}>Player Stats</h2>
      <div className="space-y-6">
        <div className="text-center">
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Total Wins</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>{totalWins}</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Successful Passes</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{successfulPasses}</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Active Tokens</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{activeTokensCount}</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Rewards</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{rewards} ETH</p>
        </div>
      </div>
    </div>
  )
}
