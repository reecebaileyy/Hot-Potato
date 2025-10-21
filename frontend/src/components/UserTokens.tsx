import React, { useState, useEffect } from 'react'
import Image from 'next/image'

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
  // Debug logging
  console.log('=== UserTokens Component ===')
  console.log('userTokens:', userTokens)
  console.log('userTokens length:', userTokens?.length)
  console.log('userTokens type:', typeof userTokens)
  
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [imageKeys, setImageKeys] = useState<Record<number, number>>({})

  useEffect(() => {
    // Reset image errors when tokens change
    setImageErrors(new Set())
    // Initialize image keys for cache busting
    const keys: Record<number, number> = {}
    userTokens.forEach(tokenId => {
      keys[tokenId] = Date.now()
    })
    setImageKeys(keys)
  }, [userTokens])

  const handleImageError = (tokenId: number) => {
    setImageErrors(prev => new Set(prev).add(tokenId))
  }

  const handleRefresh = () => {
    // Update all image keys to force reload
    const keys: Record<number, number> = {}
    userTokens.forEach(tokenId => {
      keys[tokenId] = Date.now()
    })
    setImageKeys(keys)
    setImageErrors(new Set())
    onRefreshImages()
  }
  
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
                    : 'ring-2 ring-gray-300 dark:ring-gray-600'
              }`}
              onClick={() => onTokenExploded(tokenId)}
            >
              {!imageErrors.has(tokenId) ? (
                <>
                  <Image
                    src={`https://ipfs.io/ipfs/QmSxtg2N43kcK37HcafSkq7LccTEPy6f6fX9hA6MX5tKPZ/${tokenId}.png?t=${imageKeys[tokenId] || Date.now()}`}
                    alt={`Token ${tokenId}`}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(tokenId)}
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center py-1">
                    <span className="text-sm font-bold">#{tokenId}</span>
                  </div>
                </>
              ) : (
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
              )}
              {tokenId === potatoTokenId && (
                <div className="absolute top-1 right-1 text-2xl drop-shadow-lg">🥔</div>
              )}
              {explodedTokens.includes(tokenId) && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-3xl">💥</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={handleRefresh}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } transition-colors`}
        >
          Refresh Token Images
        </button>
      </div>
    </div>
  )
}
