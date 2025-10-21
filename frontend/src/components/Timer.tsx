import React from 'react'
import Image from 'next/image'
import Explosion from '../../public/assets/images/Explosion.gif'

interface TimerProps {
  remainingTime: number | null
  explosion: boolean
  darkMode: boolean
  onCheckExplosion?: () => void
  checkingExplosion?: boolean
  gameState?: string
}

export default function Timer({ remainingTime, explosion, darkMode, onCheckExplosion, checkingExplosion, gameState }: TimerProps) {
  // Don't show timer if game has ended
  const gameEnded = gameState === 'Ended' || gameState === 'Queued' || gameState === 'Minting'
  
  // Show check explosion button when time has run out
  const showCheckButton = !gameEnded && remainingTime !== null && remainingTime <= 0 && onCheckExplosion

  // Show timer when there's time remaining
  const showTimer = !gameEnded && remainingTime !== null && remainingTime > 0

  // Debug logging
  console.log('Timer - remainingTime:', remainingTime, 'showTimer:', showTimer, 'showCheckButton:', showCheckButton)

  if (!showTimer && !showCheckButton) {
    return null
  }

  return (
    <div className={`w-full ${darkMode ? 'bg-red-900/95 border-red-700' : 'bg-red-100 border-red-300'} border-2 shadow-lg rounded-xl p-6 text-center animate-fade-in-up`}>
      {showTimer && (
        <>
          <div className="text-5xl mb-3">⏰</div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-800'} mb-2`}>
            Time Remaining
          </h2>
          <div className={`text-4xl font-bold ${darkMode ? 'text-red-300' : 'text-red-600'} mb-2`}>
            {remainingTime}s
          </div>
          <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
            until explosion!
          </p>
          {explosion && (
            <div className="mt-4 flex justify-center">
              <Image src={Explosion} alt="Explosion" width={150} height={150} />
            </div>
          )}
        </>
      )}
      
      {showCheckButton && (
        <div className="space-y-4">
          <div className="text-5xl mb-2 animate-bounce">💥</div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-800'}`}>
            Time&apos;s Up!
          </h2>
          <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'} px-2`}>
            The potato holder may have exploded. Click below to trigger the explosion!
          </p>
          <button
            onClick={onCheckExplosion}
            disabled={checkingExplosion}
            className={`w-full px-6 py-3 rounded-lg font-bold text-base transition-all transform ${
              checkingExplosion
                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                : darkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-105'
            }`}
          >
            {checkingExplosion ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Checking...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                💥 Check Explosion
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
