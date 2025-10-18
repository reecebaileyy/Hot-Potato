import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useReadContracts } from 'wagmi'
import { Abi } from 'viem'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as const

interface TokenData {
  tokenId: number
  imageString: string
  isLoading: boolean
  isError: boolean
}

export function useTokenDataManager(activeTokenIds: number[]) {
  const [tokenDataCache, setTokenDataCache] = useState<Map<number, TokenData>>(new Map())
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced refresh function to prevent excessive API calls
  const debouncedRefresh = useCallback((callback: () => void, delay: number = 2000) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    refreshTimeoutRef.current = setTimeout(callback, delay)
  }, [])

  // Centralized contract reads for all tokens with optimized caching
  const contracts = useMemo(() => 
    activeTokenIds.map(tokenId => ({
      address: CONTRACT_ADDRESS,
      abi: ABI as Abi,
      functionName: 'getImageString' as const,
      args: [tokenId] as const,
    })), [activeTokenIds]
  )

  const { data: allImageStrings, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: activeTokenIds.length > 0,
      staleTime: 60000, // Increased to 60 seconds
      refetchInterval: false, // Disable automatic refetching
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: false, // Only refetch when explicitly called
      retry: 1, // Reduced retries
      retryDelay: 1000, // Fixed retry delay
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
          isLoading: !allImageStrings[index]?.result,
          isError: allImageStrings[index]?.status === 'failure',
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

  // Debounced refresh all data
  const refreshAll = useCallback(() => {
    debouncedRefresh(() => {
      setLastRefresh(Date.now())
      refetch()
    }, 2000)
  }, [debouncedRefresh, refetch])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  return {
    getTokenData,
    refreshAll,
    isLoading: isLoading && activeTokenIds.length > 0,
    error,
    lastRefresh,
  }
}
