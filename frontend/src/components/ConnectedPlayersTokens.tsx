import React from 'react'

interface UserTokensProps {
  darkMode: boolean
  userTokens: number[]
  potatoTokenId: number
  explodedTokens: number[]
  onTokenExploded: (tokenId: number) => void
  onRefreshImages: () => void
}

export default function UserTokens({
  darkMode,
  userTokens,
  potatoTokenId,
  explodedTokens,
  onTokenExploded,
  onRefreshImages
}: UserTokensProps) {
  return (
    <div className={`w-full ${darkMode ? 'card-dark' : 'card'} p-6 animate-fade-in-up`}>
      <h2 className={`text-2xl font-bold text-center mb-6 gradient-text glow`}>Your Active Tokens</h2>
      
      {userTokens.length === 0 ? (
        <div className="text-center py-8">
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You don't have any active tokens in this game
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {userTokens.map((tokenId) => (
            <div
              key={tokenId}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                explodedTokens.includes(tokenId) 
                  ? 'opacity-50' 
                  : tokenId === potatoTokenId 
                    ? 'ring-4 ring-red-500 animate-pulse' 
                    : ''
              }`}
              onClick={() => onTokenExploded(tokenId)}
            >
              <div className={`w-full h-full flex items-center justify-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <span className={`text-lg font-bold ${
                  tokenId === potatoTokenId 
                    ? 'text-red-500' 
                    : darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  #{tokenId}
                </span>
              </div>
              {tokenId === potatoTokenId && (
                <div className="absolute top-1 right-1 text-lg">🥔</div>
              )}
              {explodedTokens.includes(tokenId) && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl">💥</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={onRefreshImages}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } transition-colors`}
        >
          Refresh Tokens
        </button>
      </div>
    </div>
  )
}
