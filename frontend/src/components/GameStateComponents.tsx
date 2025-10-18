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
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )

  const SkeletonText = ({ width = "w-32" }: { width?: string }) => (
    <div className={`animate-pulse bg-gray-300 h-4 ${width} rounded`}></div>
  )

  const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-300 h-32 w-32 rounded-lg"></div>
  )

  if (!address) {
    return (
      <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Connect First</h1>
        <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Connect your wallet to view this page! Hope you join the fun soon...</h3>
        <Image alt='Image' src={hot} width={200} height={200} />
      </div>
    )
  }

  if (gameState === "Playing" || gameState === "Final Stage") {
    return (
      <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {isWinner && Number(rewards) !== 0 &&
          <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
            onClick={onClaimRewards}
          >
            Claim Rewards
          </button>
        }
      </div>
    )
  }

  if (gameState === "Minting") {
    return (
      <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar max-h-96 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Mint Hands</h1>
        <div className="flex flex-col items-center space-y-4">
          <input
            type="number"
            placeholder="Amount"
            value={mintAmount}
            onChange={(e) => {
              setMintAmount(e.target.value)
              setTotalCost(Number(e.target.value) * Number(price))
            }}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
          />
          <button
            className={`px-6 py-3 rounded-lg font-bold ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800 hover:from-amber-700 hover:to-red-700' : 'bg-gradient-to-b from-yellow-400 to-red-500 hover:from-yellow-300 hover:to-red-400'} text-white`}
            onClick={onMint}
            disabled={mintPending}
          >
            {mintPending ? 'Minting...' : `Mint ${mintAmount || 0} Hands`}
          </button>
          <p className="text-sm text-gray-500">
            Price: {price} ETH per hand
          </p>
          <p className="text-sm text-gray-500">
            Total Cost: {totalCost.toFixed(4)} ETH
          </p>
          <p className="text-sm text-gray-500">
            Balance: {balance} ETH
          </p>
        </div>
      </div>
    )
  }

  if (gameState === "Paused") {
    return (
      <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Paused</h1>
        <p className="text-center">The game is currently paused. Please wait for it to resume.</p>
      </div>
    )
  }

  if (gameState === "Queued") {
    return (
      <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Queued</h1>
        <p className="text-center">Waiting for the game to start...</p>
      </div>
    )
  }

  if (gameState === "Ended") {
    return (
      <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Ended</h1>
        <p className="text-center">The game has ended. Wait for the next round to start.</p>
      </div>
    )
  }

  // Default case for unknown states
  return (
    <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game State: {gameState || 'Unknown'}</h1>
      <p className="text-center">Current game state: {gameState || 'Unknown'}</p>
    </div>
  )
}
