import React, { Suspense } from 'react'
import { HiArrowCircleUp, HiArrowCircleDown } from 'react-icons/hi'
import OptimizedTokenImage from './OptimizedTokenImage'
import { useTokenDataManager } from '../hooks/useTokenDataManager'
import GameArtifact from '../abi/Game.json'

const ABI = GameArtifact.abi

interface TokenGridProps {
  darkMode: boolean
  gameState: string
  loadingActiveTokenIds: boolean
  paginationData: {
    currentTokens: number[]
    pageCount: number
    pages: number[]
    startPage: number
    endPage: number
  }
  currentPage: number
  setCurrentPage: (page: number) => void
  explodedTokens: number[]
  potatoTokenId: number
  shouldRefresh: boolean
  onTokenExploded: (tokenId: number) => void
  onRefreshImages: () => void
  onSortTokensAsc: () => void
  onSortTokensDesc: () => void
  onSearch: (e: React.FormEvent) => void
  searchId: string
  setSearchId: (id: string) => void
}

export default function TokenGrid({
  darkMode,
  gameState,
  loadingActiveTokenIds,
  paginationData,
  currentPage,
  setCurrentPage,
  explodedTokens,
  potatoTokenId,
  shouldRefresh,
  onTokenExploded,
  onRefreshImages,
  onSortTokensAsc,
  onSortTokensDesc,
  onSearch,
  searchId,
  setSearchId
}: TokenGridProps) {
  // Use centralized token data management
  const { getTokenData, refreshAll, refreshImmediate, isLoading: tokenDataLoading } = useTokenDataManager(
    paginationData.currentTokens.filter(tokenId => !explodedTokens.includes(tokenId)),
    shouldRefresh
  )
  const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-300 h-32 w-32 rounded-lg"></div>
  )

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )

  const SkeletonText = ({ width = "w-32" }: { width?: string }) => (
    <div className={`animate-pulse bg-gray-300 h-4 ${width} rounded`}></div>
  )

  if (gameState !== 'Playing' && gameState !== 'Minting' && gameState !== 'Final Stage' && gameState !== 'Paused') {
    return null
  }

  if (loadingActiveTokenIds || tokenDataLoading) {
    return (
      <div className="text-center">
        <LoadingSpinner />
        <SkeletonText width="w-48" />
        <div className="grid grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-7xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-8 mb-8 animate-fade-in-up`}>
      <div className="text-center mb-8">
        <h1 className={`text-5xl font-bold gradient-text mb-4`}>Active Tokens</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          Current active tokens in the game
        </p>
        
        <button
          onClick={() => {
            refreshImmediate()
            onRefreshImages()
          }}
          className={`btn-secondary mb-6`}
        >
          🔄 Refresh Images
        </button>
      </div>

      {/* Controls Section */}
      <div className="space-y-6 mb-8">
        {/* Sort Controls */}
        <div className="text-center">
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sort By:</h3>
          <div className="flex justify-center space-x-4">
            <button 
              className={`btn-outline flex items-center space-x-2`}
              onClick={onSortTokensAsc}
            >
              <HiArrowCircleUp className="text-xl" />
              <span>Ascending</span>
            </button>
            <button 
              className={`btn-outline flex items-center space-x-2`}
              onClick={onSortTokensDesc}
            >
              <HiArrowCircleDown className="text-xl" />
              <span>Descending</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <form onSubmit={onSearch} className="flex space-x-2">
            <input
              type="number"
              placeholder="Search Token ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-xl border-2 focus-ring ${
                darkMode 
                  ? 'bg-gray-800 text-white border-gray-600 focus:border-amber-500' 
                  : 'bg-white text-gray-900 border-gray-300 focus:border-amber-500'
              }`}
            />
            <button
              type="submit"
              className={`btn-primary px-6 py-3`}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Token Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 mb-8`}>
        {paginationData.currentTokens.filter(tokenId => !explodedTokens.includes(tokenId)).map((tokenId, index) => {
          const tokenData = getTokenData(tokenId)
          return (
            <div 
              key={index} 
              className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-amber-500/30`}
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
                  delay={index * 100}
                  className="z-20"
                />
              </Suspense>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 text-lg">
        {currentPage !== 1 && (
          <button 
            className={`btn-outline px-4 py-2`}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Previous
          </button>
        )}
        
        <div className="flex space-x-2">
          {paginationData.pages.map((page, index) => (
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                page === currentPage 
                  ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg' 
                  : darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              key={index}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
        
        {currentPage !== paginationData.pageCount && (
          <button 
            className={`btn-outline px-4 py-2`}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
