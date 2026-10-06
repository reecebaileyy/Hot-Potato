import React, { useState } from 'react'
import { explorerTxUrl } from '../config/chain'
import { formatEth } from '../lib/game'
import type { ClaimHistoryItem } from '../hooks/useClaimHistory'

interface RewardsProps {
  darkMode: boolean
  /** Claimable wei (`rewards(address)`). */
  rewards: bigint
  /** Whether the connected wallet won the round that just ended. */
  isWinner: boolean
  onClaimRewards: () => void
  busy: boolean
  claimHistory: ClaimHistoryItem[]
}

const formatTxHash = (hash: string) => (hash.length < 10 ? hash : `${hash.slice(0, 6)}...${hash.slice(-4)}`)

export default function Rewards({ darkMode, rewards, isWinner, onClaimRewards, busy, claimHistory }: RewardsProps) {
  const [showHistory, setShowHistory] = useState(false)
  const hasRewards = rewards > 0n
  const amount = formatEth(rewards)

  return (
    <div className={`${darkMode ? 'card-dark' : 'card'} p-6 animate-fade-in-up`}>
      <h2 className={`text-3xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💰 Rewards</h2>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-6 rounded-xl`}>
        <div className="text-center space-y-4">
          {isWinner && (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>You Won!</h3>
            </>
          )}
          <div
            className={`text-4xl font-bold ${
              hasRewards ? (darkMode ? 'text-green-400' : 'text-green-600') : darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {amount} ETH
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {hasRewards ? 'Available to claim' : 'No rewards yet'}
          </p>
          {hasRewards && (
            <button
              className={`btn-primary text-lg px-8 py-4 w-full ${isWinner ? 'animate-glow' : ''} ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onClaimRewards}
              disabled={busy}
            >
              Claim Rewards
            </button>
          )}
        </div>
      </div>

      <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl overflow-hidden`}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`w-full px-4 py-3 flex items-center justify-between ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📜 Claim History {claimHistory.length > 0 && `(${claimHistory.length})`}
          </span>
          <span className={`transform transition-transform ${showHistory ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showHistory && (
          <div className="px-4 pb-4">
            {claimHistory.length === 0 ? (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No claims yet</p>
            ) : (
              <div className="space-y-3 mt-3 max-h-64 overflow-y-auto">
                {claimHistory.map((claim) => {
                  const txUrl = explorerTxUrl(claim.txHash)
                  return (
                    <div
                      key={claim.txHash}
                      className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-3 rounded-lg border`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {claim.amount} ETH
                        </span>
                        {claim.round !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            Round {claim.round}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">TX:</span>
                          {txUrl ? (
                            <a
                              href={txUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline`}
                            >
                              {formatTxHash(claim.txHash)}
                            </a>
                          ) : (
                            <span className="font-mono">{formatTxHash(claim.txHash)}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">Date:</span> {new Date(claim.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
