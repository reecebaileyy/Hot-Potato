import React from 'react'
import { HiArrowCircleDown, HiArrowCircleUp } from 'react-icons/hi'
import type { Address } from 'viem'
import HandImage from './HandImage'
import { useHandImages } from '../hooks/useHandImages'
import { useTokenManagement } from '../hooks/useTokenManagement'
import type { GameInfo } from '../hooks/useGame'

interface TokenGridProps {
  darkMode: boolean
  title: string
  subtitle: string
  tokenIds: number[]
  isLoading: boolean
  info: GameInfo | undefined
  metadataHandler: Address | undefined
}

function SkeletonCard() {
  return <div className="animate-pulse bg-gray-300 h-32 w-32 rounded-lg" />
}

/** Paginated, sortable, searchable grid of hands in the round. */
export default function TokenGrid({
  darkMode,
  title,
  subtitle,
  tokenIds,
  isLoading,
  info,
  metadataHandler,
}: TokenGridProps) {
  const {
    currentPage,
    setCurrentPage,
    searchId,
    setSearchId,
    paginationData,
    sortTokensAsc,
    sortTokensDesc,
    handleSearch,
  } = useTokenManagement(tokenIds)
  const images = useHandImages(paginationData.currentTokens, info, metadataHandler)
  const potatoTokenId = Number(info?.potatoTokenId ?? 0n)

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (tokenIds.length === 0) return null

  return (
    <div className={`w-full max-w-7xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-4 sm:p-6 lg:p-8 mb-8 animate-fade-in-up`}>
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold gradient-text mb-4">{title}</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="text-center">
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sort By:</h3>
          <div className="flex justify-center space-x-4">
            <button className="btn-outline flex items-center space-x-2" onClick={sortTokensAsc}>
              <HiArrowCircleUp className="text-xl" />
              <span>Ascending</span>
            </button>
            <button className="btn-outline flex items-center space-x-2" onClick={sortTokensDesc}>
              <HiArrowCircleDown className="text-xl" />
              <span>Descending</span>
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="flex space-x-2">
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
            <button type="submit" className="btn-primary px-6 py-3">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 mb-8">
        {paginationData.currentTokens.map((tokenId) => (
          <div
            key={tokenId}
            className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
              tokenId === potatoTokenId ? 'border-red-500' : 'border-transparent hover:border-amber-500/30'
            }`}
          >
            <HandImage tokenId={tokenId} image={images.get(tokenId)} isPotato={tokenId === potatoTokenId} />
          </div>
        ))}
      </div>

      {paginationData.pageCount > 1 && (
        <div className="flex justify-center items-center space-x-2 text-lg">
          {currentPage !== 1 && (
            <button className="btn-outline px-4 py-2" onClick={() => setCurrentPage(currentPage - 1)}>
              ← Previous
            </button>
          )}
          <div className="flex space-x-2">
            {paginationData.pages.map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          {currentPage !== paginationData.pageCount && (
            <button className="btn-outline px-4 py-2" onClick={() => setCurrentPage(currentPage + 1)}>
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
