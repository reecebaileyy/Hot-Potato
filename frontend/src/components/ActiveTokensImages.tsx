'use client'

import React, { useEffect, useState } from 'react'
import { HiArrowCircleDown, HiArrowCircleUp } from 'react-icons/hi'
import TokenImage from '../components/TokenImage'
import { useTokenDataManager } from '../hooks/useTokenDataManager'

interface ActiveTokensImagesProps {
  activeTokenIds: number[]
  potatoTokenId: number
  shouldRefresh: boolean
}

const ActiveTokensImages: React.FC<ActiveTokensImagesProps> = ({
  activeTokenIds,
  potatoTokenId,
  shouldRefresh,
}) => {
  const [explodedTokens, setExplodedTokens] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(24)
  const [sortedTokens, setSortedTokens] = useState<number[]>([])

  // Use centralized token data manager
  const { getTokenData, refreshAll, isLoading } = useTokenDataManager(activeTokenIds)

  // --- Effects ---
  useEffect(() => {
    if (activeTokenIds.length > 0) {
      setSortedTokens(activeTokenIds)
    }
  }, [activeTokenIds])

  useEffect(() => {
    if (shouldRefresh) {
      refreshAll()
    }
  }, [shouldRefresh, refreshAll])

  // --- Handlers ---
  const sortTokensAsc = () => {
    const sorted = [...activeTokenIds].sort((a, b) => a - b)
    setSortedTokens(sorted)
  }

  const sortTokensDesc = () => {
    const sorted = [...activeTokenIds].sort((a, b) => b - a)
    setSortedTokens(sorted)
  }

  const handleTokenExploded = (tokenId: number) => {
    setExplodedTokens((prev) => [...prev, tokenId])
  }

  // --- Pagination ---
  const indexOfLastToken = currentPage * itemsPerPage
  const indexOfFirstToken = indexOfLastToken - itemsPerPage
  const currentTokens = sortedTokens.slice(indexOfFirstToken, indexOfLastToken)

  // --- Rendering ---
  if (isLoading) return <div>Loading...</div>

  if (activeTokenIds.length === 0)
    return (
      <div className="flex flex-col text-center">
        <h1 className="text-xl">Mint some hands to join the round!</h1>
      </div>
    )

  return (
    <div>
      <div className="text-center text-xl">
        <h1 className="underline">Sort By:</h1>
        <button className="mr-5" onClick={sortTokensAsc}>
          <HiArrowCircleUp />
        </button>
        <button onClick={sortTokensDesc}>
          <HiArrowCircleDown />
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-4 justify-center items-center">
        {currentTokens
          .filter((id) => !explodedTokens.includes(id))
          .map((id, index) => {
            const tokenData = getTokenData(id)
            return (
              <div
                key={id}
                className="border rounded-lg p-2 text-center flex flex-col items-center"
              >
                <TokenImage
                  tokenId={id}
                  imageString={tokenData.imageString}
                  potatoTokenId={potatoTokenId}
                  isLoading={tokenData.isLoading}
                  isError={tokenData.isError}
                  onTokenExploded={handleTokenExploded}
                  size={300}
                />
              </div>
            )
          })}
      </div>

      <div className="text-center mt-4">
        {Array(Math.ceil(sortedTokens.length / itemsPerPage))
          .fill(0)
          .map((_, i) => (
            <button
              key={i}
              className="mx-2"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
      </div>
    </div>
  )
}

export default ActiveTokensImages
