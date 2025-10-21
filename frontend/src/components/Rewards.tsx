import React, { useState } from 'react'

export interface ClaimHistoryItem {
  amount: string
  txHash: string
  timestamp: number
  round?: number
}

interface RewardsProps {
  darkMode: boolean
  isWinner: boolean
  rewards: string
  onClaimRewards: () => void
  gameState: string | null
  claimHistory: ClaimHistoryItem[]
}

export default function Rewards({
  darkMode,
  isWinner,
  rewards,
  onClaimRewards,
  gameState,
  claimHistory
}: RewardsProps) {
  const [showHistory, setShowHistory] = useState(false)

  const formatTxHash = (hash: string) => {
    if (hash.length < 10) return hash
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className={`${darkMode ? 'card-dark' : 'card'} p-6 animate-fade-in-up`}>
      <h2 className={`text-3xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        💰 Rewards
      </h2>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-6 rounded-xl`}>
        <div className="text-center space-y-4">
          {isWinner && Number(rewards) > 0 ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                You Won!
              </h3>
              <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {rewards} ETH
              </div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Available to claim
              </p>
              <button 
                className={`btn-primary text-lg px-8 py-4 w-full animate-glow`}
                onClick={onClaimRewards}
              >
                Claim Rewards
              </button>
            </>
          ) : (
            <>
              <div className={`text-4xl font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {rewards} ETH
              </div>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {Number(rewards) > 0 ? 'Available to claim' : 'No rewards yet'}
              </p>
              {Number(rewards) > 0 && (
                <button 
                  className={`btn-primary text-lg px-8 py-4 w-full`}
                  onClick={onClaimRewards}
                >
                  Claim Rewards
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {gameState === "Ended" && isWinner && (
        <div className={`mt-4 text-center ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
          <p className="text-sm">🎉 Congratulations on your win! 🎉</p>
        </div>
      )}

      {/* Claim History Section */}
      <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl overflow-hidden`}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`w-full px-4 py-3 flex items-center justify-between ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          } transition-colors`}
        >
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📜 Claim History {claimHistory.length > 0 && `(${claimHistory.length})`}
          </span>
          <span className={`transform transition-transform ${showHistory ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {showHistory && (
          <div className="px-4 pb-4">
            {claimHistory.length === 0 ? (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No claims yet
              </p>
            ) : (
              <div className="space-y-3 mt-3 max-h-64 overflow-y-auto">
                {claimHistory.map((claim, index) => (
                  <div
                    key={`${claim.txHash}-${index}`}
                    className={`${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    } p-3 rounded-lg border ${
                      darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {claim.amount} ETH
                      </span>
                      {claim.round && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          Round {claim.round}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">TX:</span>
                        <a
                          href={`https://sepolia.basescan.org/tx/${claim.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          } underline`}
                        >
                          {formatTxHash(claim.txHash)}
                        </a>
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span> {formatDate(claim.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

