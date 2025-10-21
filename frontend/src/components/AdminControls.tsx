import React from 'react'

interface AdminControlsProps {
  darkMode: boolean
  address: string
  ownerAddress: string
  gameState: string
  onStartGame: () => void
  onStartGameNoMint: () => void
  onEndMinting: () => void
  onCloseMinting: () => void
  onPauseGame: () => void
  onResumeGame: () => void
  onRestartGame: () => void
  // Debug props
  startSim?: any
  startNoMintSim?: any
  endMintSim?: any
  closeMintSim?: any
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
  onStartGameNoMint, 
  onEndMinting,
  onCloseMinting, 
  onPauseGame, 
  onResumeGame, 
  onRestartGame,
  startSim,
  startNoMintSim,
  endMintSim,
  closeMintSim,
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Start Game - Show when Queued or Ended */}
        {(gameState === 'Queued' || gameState === 'Ended') && (
          <>
            <button
              className={`btn-primary text-lg py-4`}
              onClick={onStartGame}
            >
              🚀 Start New Round (With Minting)
            </button>
            <button
              className={`btn-secondary text-lg py-4 md:col-span-2`}
              onClick={onStartGameNoMint}
            >
              ⚡ Start Round (Skip Minting)
            </button>
          </>
        )}
        
        {/* Minting State Controls */}
        {gameState === 'Minting' && (
          <>
            <button
              className={`btn-outline text-lg py-4`}
              onClick={onPauseGame}
            >
              ⏸️ Pause Minting
            </button>
            
            <button
              className={`btn-outline text-lg py-4`}
              onClick={onCloseMinting}
            >
              🔒 Close Minting
            </button>
            
            <button
              className={`btn-secondary text-lg py-4`}
              onClick={onEndMinting}
            >
              ⏹️ End Minting & Start Game
            </button>
          </>
        )}
        
        {/* Paused State Controls */}
        {gameState === 'Paused' && (
          <>
            <button
              className={`btn-primary text-lg py-4 md:col-span-2 lg:col-span-3`}
              onClick={onResumeGame}
            >
              ▶️ Resume Game
            </button>
          </>
        )}
        
        {/* Playing/Final Round State Controls */}
        {(gameState === 'Playing' || gameState === 'Final Stage') && (
          <button
            className={`btn-outline text-lg py-4 md:col-span-2 lg:col-span-3`}
            onClick={onPauseGame}
          >
            ⏸️ Pause Game
          </button>
        )}
        
        {/* Restart - Show for Paused or Ended */}
        {(gameState === 'Paused' || gameState === 'Ended') && (
          <button
            className={`btn-outline text-lg py-4 md:col-span-2 lg:col-span-3`}
            onClick={onRestartGame}
          >
            🔄 Restart Game
          </button>
        )}
      </div>
      
      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} text-center`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Current Game State: <span className="font-semibold text-amber-500">{gameState}</span>
        </p>
      </div>
    </div>
  )
}
