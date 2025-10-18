import React, { Suspense } from 'react'
import { HiArrowCircleUp, HiArrowCircleDown } from 'react-icons/hi'
import OptimizedTokenImage from './OptimizedTokenImage'
import { useTokenDataManager } from '../hooks/useTokenDataManager'
import ABI from '../abi/Game.json'

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
  const { getTokenData, refreshAll, isLoading: tokenDataLoading } = useTokenDataManager(
    paginationData.currentTokens.filter(tokenId => !explodedTokens.includes(tokenId))
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
    <div className={`p-4 col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-xl`}>
      <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Active Tokens:</h1>
      <div className="flex justify-center">
        <button
          onClick={() => {
            refreshAll()
            onRefreshImages()
          }}
          className={`mb-6 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
        >
          Refresh Images
        </button>
      </div>

      <div className='text-3xl sm:text-xl md:text-xl lg:text-xl text-center'>
        <h1 className='underline'>Sort By:</h1>
        <button className='mr-5' onClick={onSortTokensAsc}><HiArrowCircleUp /></button>
        <button onClick={onSortTokensDesc}><HiArrowCircleDown /></button>
      </div>
      <div className='grid grid-cols-8'>
        <form onSubmit={onSearch} className="col-start-3 col-span-4 flex flex-row justify-center items-center space-x-2 mt-4 mb-4">
          <input
            type="number"
            placeholder="Search Token ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-white`}
          >
            Search
          </button>
        </form>
      </div>
      <div className={`grid grid-cols-8 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-center items-center`}>
        {paginationData.currentTokens.filter(tokenId => !explodedTokens.includes(tokenId)).map((tokenId, index) => {
          const tokenData = getTokenData(tokenId)
          return (
            <div key={index} className="border rounded-lg p-2 text-center justify-center items-center flex flex-col">
              <Suspense fallback={<SkeletonCard />}>
                <OptimizedTokenImage
                  tokenId={tokenId}
                  imageString={tokenData.imageString}
                  isLoading={tokenData.isLoading}
                  isError={tokenData.isError}
                  potatoTokenId={potatoTokenId}
                  onTokenExploded={onTokenExploded}
                  onRefresh={refreshAll}
                  delay={index * 100} // Reduced delay
                  className="z-20"
                />
              </Suspense>
            </div>
          )
        })}
      </div>

      <div className='text-3xl lg:text-2xl md:text-2xl sm:text-xl text-center'>
        {currentPage !== 1 &&
          <button className='justify-items-center mx-8 sm:mx-4 mt-4' onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
        }
        {paginationData.pages.map((page, index) => (
          <button
            className={`justify-items-center mx-8 sm:mx-4 mt- bg-clip-text ${page === currentPage ? (darkMode ? 'text-transparent bg-gradient-to-br from-amber-800 to-red-800' : 'text-transparent bg-gradient-to-b from-yellow-400 to-red-500') : 'text-black'}`}
            key={index}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        {currentPage !== paginationData.pageCount &&
          <button className='justify-items-center mx-8 sm:mx-4 mt-4' onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
        }
      </div>
    </div>
  )
}
