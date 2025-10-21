import React from 'react'
import Image from 'next/image'
import hot from '../../public/assets/images/hot.png'

interface GameStateProps {
  darkMode: boolean
  gameState: string | null
  address: string | null
  mintAmount: string
  setMintAmount: (amount: string) => void
  totalCost: number
  setTotalCost: (cost: number) => void
  price: string
  balance: string
  mintPending: boolean
  onMint: () => void
  isWinner: boolean
  rewards: string
  onClaimRewards: () => void
}

export default function GameStateComponents({
  darkMode,
  gameState,
  address,
  mintAmount,
  setMintAmount,
  totalCost,
  setTotalCost,
  price,
  balance,
  mintPending,
  onMint,
  isWinner,
  rewards,
  onClaimRewards
}: GameStateProps) {
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-amber-500"></div>
    </div>
  )

  const SkeletonText = ({ width = "w-32" }: { width?: string }) => (
    <div className={`animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} h-4 ${width} rounded`}></div>
  )

  const SkeletonCard = () => (
    <div className={`animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} h-40 w-full rounded-2xl`}></div>
  )

  if (!address) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
        <div className="text-center">
          <h1 className={`text-5xl font-bold mb-6 gradient-text`}>Connect First</h1>
          <h3 className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Connect your wallet to view this page! Hope you join the fun soon...
          </h3>
          <div className="animate-float">
            <Image alt='Hot Potato' src={hot} width={200} height={200} className="mx-auto drop-shadow-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "Playing" || gameState === "Final Stage") {
    // Only show something if user is a winner with rewards
    if (isWinner && Number(rewards) !== 0) {
      return (
        <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
          <div className="text-center">
            <div className="space-y-6">
              <h2 className={`text-3xl font-bold gradient-text mb-4`}>🎉 Congratulations! 🎉</h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                You won this round! Claim your rewards below.
              </p>
              <button 
                className={`btn-primary text-lg px-8 py-4 animate-glow`}
                onClick={onClaimRewards}
              >
                Claim {rewards} ETH Rewards
              </button>
            </div>
          </div>
        </div>
      )
    }
    // Return null if not a winner or no rewards - don't render empty div
    return null
  }

  if (gameState === "Minting") {
    return (
      <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
        <div className="text-center space-y-6">
          <h1 className={`text-5xl font-bold gradient-text mb-2`}>Mint Hands</h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get your hands ready for the hot potato game!
          </p>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={mintAmount}
                onChange={(e) => {
                  setMintAmount(e.target.value)
                  setTotalCost(Number(e.target.value) * Number(price))
                }}
                className={`w-full px-6 py-4 rounded-xl border-2 text-lg focus-ring ${
                  darkMode 
                    ? 'bg-gray-800 text-white border-gray-600 focus:border-amber-500' 
                    : 'bg-white text-gray-900 border-gray-300 focus:border-amber-500'
                }`}
              />
              
              <button
                className={`btn-primary text-lg px-8 py-4 w-full ${mintPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onMint}
                disabled={mintPending}
              >
                {mintPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Minting...</span>
                  </div>
                ) : (
                  `Mint ${mintAmount || 0} Hands`
                )}
              </button>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
                <p className="font-semibold text-amber-500">Price per Hand</p>
                <p className="text-lg">{price} ETH</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
                <p className="font-semibold text-red-500">Total Cost</p>
                <p className="text-lg">{totalCost.toFixed(4)} ETH</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
                <p className="font-semibold text-green-500">Your Balance</p>
                <p className="text-lg">{balance} ETH</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "Paused") {
    return (
      <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
        <div className="text-center space-y-6">
          <h1 className={`text-5xl font-bold gradient-text mb-4`}>⏸️ Game Paused</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The game is currently paused. Please wait for it to resume.
          </p>
          <div className="animate-pulse-slow">
            <div className={`w-16 h-16 mx-auto rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "Queued") {
    return (
      <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
        <div className="text-center space-y-6">
          <h1 className={`text-5xl font-bold gradient-text mb-4`}>⏳ Game Queued</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Waiting for the game to start...
          </p>
          <div className="animate-bounce-slow">
            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-amber-500 to-red-500`}></div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "Ended") {
    return (
      <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
        <div className="text-center space-y-6">
          <h1 className={`text-5xl font-bold gradient-text mb-4`}>🏁 Game Ended</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The game has ended. Wait for the next round to start.
          </p>
          <div className="animate-pulse-slow">
            <div className={`w-16 h-16 mx-auto rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    )
  }

  // Default case for unknown states
  return (
    <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
      <div className="text-center space-y-6">
        <h1 className={`text-5xl font-bold gradient-text mb-4`}>Game State: {gameState || 'Unknown'}</h1>
        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Current game state: {gameState || 'Unknown'}
        </p>
      </div>
    </div>
  )
}
