'use client'

import React, { useEffect, useState } from 'react'
import { useReadContract, useWatchContractEvent } from 'wagmi'
import { HiArrowCircleDown, HiArrowCircleUp } from 'react-icons/hi'
import TokenImage from '../components/TokenImage'
import { Abi } from 'viem'

interface ActiveTokensImagesProps {
  ownerAddress: `0x${string}`
  ABI: any
  shouldRefresh: boolean
  tokenId: number
}

const CONTRACT_ADDRESS = '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07' as const

const ActiveTokensImages: React.FC<ActiveTokensImagesProps> = ({
  ownerAddress,
  ABI,
  shouldRefresh,
  tokenId,
}) => {
  const [explodedTokens, setExplodedTokens] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(24)
  const [sortedTokens, setSortedTokens] = useState<bigint[]>([])


  // --- Contract Reads ---
  const {
    data: getActiveTokens,
    refetch: refetchGetActiveTokens,
  } = useReadContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'getActiveTokens',
  })

const {
  data: activeTokens,
  isLoading,
  isError,
  refetch: refetchActiveTokens,
} = useReadContract({
  abi: ABI,
  address: CONTRACT_ADDRESS,
  functionName: 'getActiveTokensOfOwner',
  args: [ownerAddress],
}) as {
    data?: bigint[]
    isLoading: boolean
    isError: boolean
    refetch?: () => Promise<any>
  }


  const {
    data: getImageString,
    refetch: refetchImageString,
  } = useReadContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'getImageString',
    args: [tokenId],
  })

  // --- Contract Events ---
  useWatchContractEvent({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    eventName: 'PotatoMinted',
    onLogs: async () => {
      try {
        await refetchImageString?.()
        await refetchGetActiveTokens?.()
      } catch (err) {
        console.error('Error updating on PotatoMinted', err)
      }
    },
  })

  // --- Effects ---
  useEffect(() => {
    refetchActiveTokens?.()
    refetchGetActiveTokens?.()
    refetchImageString?.()
  }, [ownerAddress, shouldRefresh])

  useEffect(() => {
    if (activeTokens) setSortedTokens(activeTokens as bigint[])
  }, [activeTokens])

  // --- Handlers ---
  const sortTokensAsc = () => {
    if (!activeTokens) return
    const sorted = [...activeTokens].sort((a, b) => Number(a - b))
    setSortedTokens(sorted)
  }

  const sortTokensDesc = () => {
    if (!activeTokens) return
    const sorted = [...activeTokens].sort((a, b) => Number(b - a))
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
  if (isError || !activeTokens)
    return (
      <div className="flex flex-col text-center">
        <p>Error loading active tokens.</p>
        <button
          className="border font-bold"
          onClick={() => refetchActiveTokens?.()}
        >
          Try Refreshing
        </button>
      </div>
    )

  if ((activeTokens as bigint[]).length === 0)
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
          .filter((id) => !explodedTokens.includes(Number(id)))
          .map((id, index) => (
            <div
              key={index}
              className="border rounded-lg p-2 text-center flex flex-col items-center"
            >
              <TokenImage
                delay={index * 1000}
                tokenId={Number(id)}
                onTokenExploded={handleTokenExploded}
                ABI={ABI}
                shouldRefresh={shouldRefresh}
                size={300}
              />
            </div>
          ))}
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
