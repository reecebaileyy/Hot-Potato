import React from 'react'

interface AdminControlsProps {
  darkMode: boolean
  address: string
  ownerAddress: string
  gameState: string
  onStartGame: () => void
  onEndMinting: () => void
  onPauseGame: () => void
  onResumeGame: () => void
  onRestartGame: () => void
  // Debug props
  startSim?: any
  endMintSim?: any
  pauseSim?: any
  resumeSim?: any
  restartSim?: any
}

export default function AdminControls({ 
  darkMode, 
  address, 
  ownerAddress,
  gameState, 
  onStartGame, 
  onEndMinting, 
  onPauseGame, 
  onResumeGame, 
  onRestartGame,
  startSim,
  endMintSim,
  pauseSim,
  resumeSim,
  restartSim
}: AdminControlsProps) {
  console.log('=== ADMIN CONTROLS RENDER ===');
  console.log('address:', address);
  console.log('ownerAddress:', ownerAddress);
  console.log('gameState:', gameState);
  console.log('address match:', address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase());
  
  if (!address || !ownerAddress || address.toLowerCase() !== ownerAddress.toLowerCase()) {
    console.log('Admin controls not rendered - address mismatch or missing');
    return null
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
      <div className="text-center mb-8">
        <h2 className={`text-4xl font-bold gradient-text mb-4`}>🎮 Admin Controls</h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage the game state and settings
        </p>
        {/* Debug info */}
        <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} text-left`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <strong>Debug Info:</strong><br/>
            Address: {address}<br/>
            Owner: {ownerAddress}<br/>
            Game State: {gameState}<br/>
            Match: {address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase() ? '✅' : '❌'}<br/>
            <br/>
            <strong>Simulation Status:</strong><br/>
            Start: {startSim?.request ? '✅' : '❌'}<br/>
            End Mint: {endMintSim?.request ? '✅' : '❌'}<br/>
            Pause: {pauseSim?.request ? '✅' : '❌'}<br/>
            Resume: {resumeSim?.request ? '✅' : '❌'}<br/>
            Restart: {restartSim?.request ? '✅' : '❌'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          className={`btn-primary text-lg py-4 md:col-span-2 lg:col-span-3`}
          onClick={onStartGame}
        >
          🚀 Start Game
        </button>
        
        <button
          className={`btn-secondary text-lg py-4 md:col-span-2 lg:col-span-3`}
          onClick={onEndMinting}
        >
          ⏹️ End Minting
        </button>
        
        <button
          className={`btn-outline text-lg py-4`}
          onClick={onPauseGame}
        >
          ⏸️ Pause Game
        </button>
        
        <button
          className={`btn-outline text-lg py-4`}
          onClick={onResumeGame}
        >
          ▶️ Resume Game
        </button>
        
        <button
          className={`btn-outline text-lg py-4`}
          onClick={onRestartGame}
        >
          🔄 Restart Game
        </button>
      </div>
      
      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} text-center`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Current Game State: <span className="font-semibold text-amber-500">{gameState}</span>
        </p>
      </div>
    </div>
  )
}
