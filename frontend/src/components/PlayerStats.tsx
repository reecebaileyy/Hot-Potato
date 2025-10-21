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
    <div className={`w-full max-w-6xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-6 lg:p-8 animate-fade-in-up`}>
      <h2 className={`text-2xl lg:text-3xl font-bold text-center mb-6 gradient-text glow`}>Player Stats</h2>
      <div className="grid grid-cols-2 gap-6 lg:gap-8">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20">
          <p className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Total Wins</p>
          <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>{totalWins}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
          <p className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Successful Passes</p>
          <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{successfulPasses}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
          <p className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Active Tokens</p>
          <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{activeTokensCount}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
          <p className={`text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Rewards</p>
          <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{rewards} ETH</p>
        </div>
      </div>
    </div>
  )
}
