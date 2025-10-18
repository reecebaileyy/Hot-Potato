import React from 'react'

interface AdminControlsProps {
  darkMode: boolean
  address: string
  gameState: string
  onStartGame: () => void
  onEndMinting: () => void
  onPauseGame: () => void
  onResumeGame: () => void
  onRestartGame: () => void
}

export default function AdminControls({ 
  darkMode, 
  address, 
  gameState, 
  onStartGame, 
  onEndMinting, 
  onPauseGame, 
  onResumeGame, 
  onRestartGame 
}: AdminControlsProps) {
  if (address !== "0x41b1e204e9c15fF5894bd47C6Dc3a7Fa98C775C7") {
    return null
  }

  return (
    <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-xl overflow-x-auto`}>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 sm:grid-cols-3 gap-4">
        <button
          className={`bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-3 md:col-span-3 sm:col-span-3`}
          onClick={onStartGame}
        >
          Start Game
        </button>
        <button
          className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2 md:col-span-3 sm:col-span-3"
          onClick={onEndMinting}
        >
          End Minting
        </button>
        <button
          className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
          onClick={onPauseGame}
        >
          Pause Game
        </button>
        <button
          className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
          onClick={onResumeGame}
        >
          Resume Game
        </button>
        <button
          className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
          onClick={onRestartGame}
        >
          Restart Game
        </button>
      </div>
    </div>
  )
}
