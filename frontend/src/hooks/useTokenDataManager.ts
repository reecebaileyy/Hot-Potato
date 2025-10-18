import { useState, useEffect, useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07' as const

interface TokenData {
  tokenId: number
  imageString: string
  isLoading: boolean
  isError: boolean
}

export function useTokenDataManager(activeTokenIds: number[]) {
  const [tokenDataCache, setTokenDataCache] = useState<Map<number, TokenData>>(new Map())
  const [lastRefresh, setLastRefresh] = useState<number>(0)

  // Centralized contract reads for all tokens
  const contracts = useMemo(() => 
    activeTokenIds.map(tokenId => ({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'getImageString' as const,
      args: [tokenId] as const,
    })), [activeTokenIds]
  )

  const { data: allImageStrings, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: activeTokenIds.length > 0,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // 1 minute
      retry: 2,
    }
  })

  // Update cache when data changes
  useEffect(() => {
    if (allImageStrings && activeTokenIds.length > 0) {
      const newCache = new Map<number, TokenData>()
      
      activeTokenIds.forEach((tokenId, index) => {
        const imageString = allImageStrings[index]?.result as string
        newCache.set(tokenId, {
          tokenId,
          imageString: imageString || '',
          isLoading: allImageStrings[index]?.status === 'pending',
          isError: allImageStrings[index]?.status === 'error',
        })
      })
      
      setTokenDataCache(newCache)
    }
  }, [allImageStrings, activeTokenIds])

  // Get data for a specific token
  const getTokenData = (tokenId: number): TokenData => {
    return tokenDataCache.get(tokenId) || {
      tokenId,
      imageString: '',
      isLoading: true,
      isError: false,
    }
  }

  // Refresh all data
  const refreshAll = () => {
    setLastRefresh(Date.now())
  }

  return {
    getTokenData,
    refreshAll,
    isLoading: isLoading && activeTokenIds.length > 0,
    error,
    lastRefresh,
  }
}
