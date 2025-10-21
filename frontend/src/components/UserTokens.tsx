import React, { Suspense } from 'react'
import OptimizedTokenImage from './OptimizedTokenImage'
import { useTokenDataManager } from '../hooks/useTokenDataManager'

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
  
  // Use token data manager for proper data fetching
  const { getTokenData, refreshImmediate, isLoading } = useTokenDataManager(userTokens || [])

  const handleRefresh = () => {
    console.log('Refreshing user token images...')
    // Trigger token data manager refresh
    refreshImmediate()
    // Also trigger parent refresh
    onRefreshImages()
  }

  const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-300 w-full aspect-square rounded-lg"></div>
  )
  
  return (
    <div className={`w-full max-w-6xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-6 lg:p-8 animate-fade-in-up`}>
      <h2 className={`text-2xl lg:text-3xl font-bold text-center mb-6 gradient-text glow`}>Your Active Tokens</h2>
      
      {userTokens.length === 0 ? (
        <div className="text-center py-8">
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You don&apos;t have any active tokens in this game
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {userTokens.map((tokenId) => (
            <SkeletonCard key={tokenId} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {userTokens.map((tokenId, index) => {
            const tokenData = getTokenData(tokenId)
            const isExploded = explodedTokens.includes(tokenId)
            const hasPotato = tokenId === potatoTokenId
            
            return (
              <div
                key={tokenId}
                className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                  isExploded 
                    ? 'opacity-50' 
                    : hasPotato 
                      ? 'ring-4 ring-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                      : 'ring-2 ring-gray-300 dark:ring-gray-600 hover:ring-amber-500/50 hover:scale-105'
                } ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}
              >
                <Suspense fallback={<SkeletonCard />}>
                  <OptimizedTokenImage
                    tokenId={tokenId}
                    imageString={tokenData.imageString}
                    isLoading={tokenData.isLoading}
                    isError={tokenData.isError}
                    potatoTokenId={potatoTokenId}
                    onTokenExploded={onTokenExploded}
                    onRefresh={refreshImmediate}
                    delay={index * 50}
                  />
                </Suspense>
                
                {hasPotato && (
                  <div className="absolute top-2 right-2 text-3xl drop-shadow-lg animate-bounce">
                    🥔
                  </div>
                )}
                
                {isExploded && (
                  <div className="absolute inset-0 bg-red-500/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-4xl animate-pulse">💥</span>
                  </div>
                )}
              </div>
            )
          })}
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
