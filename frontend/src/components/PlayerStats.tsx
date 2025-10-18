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
    <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} shadow rounded-xl p-4`}>
      <h2 className={`text-2xl font-bold text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Player Stats</h2>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Total Wins</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-green-600'}`}>{totalWins}</p>
        </div>
        <div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Successful Passes</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{successfulPasses}</p>
        </div>
        <div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Active Tokens</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{activeTokensCount}</p>
        </div>
        <div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Rewards</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{rewards} ETH</p>
        </div>
      </div>
    </div>
  )
}
