import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useReadContracts } from 'wagmi'
import { Abi } from 'viem'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x7Bfa203a115421a08bE6E27bEcb495D3cb4003B9' as const

interface TokenData {
  tokenId: number
  imageString: string
  isLoading: boolean
  isError: boolean
}

export function useTokenDataManager(activeTokenIds: number[], shouldRefresh?: boolean) {
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

  // Memoize activeTokenIds string to prevent unnecessary re-renders
  const activeTokenIdsString = useMemo(() => activeTokenIds.join(','), [activeTokenIds])

  // Centralized contract reads for all tokens with optimized caching
  const contracts = useMemo(() => 
    activeTokenIds.map(tokenId => ({
      address: CONTRACT_ADDRESS,
      abi: ABI as Abi,
      functionName: 'getImageString' as const,
      args: [tokenId] as const,
    })), [activeTokenIds, activeTokenIdsString] // Use string comparison instead of array
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
  }, [allImageStrings, activeTokenIds, activeTokenIdsString]) // Use string comparison

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

  // Immediate refresh for critical updates (like after minting)
  const refreshImmediate = useCallback(() => {
    console.log('Immediate refresh triggered')
    setLastRefresh(Date.now())
    refetch()
  }, [refetch])

  // Respond to external refresh trigger
  useEffect(() => {
    if (shouldRefresh) {
      console.log('External refresh triggered - refreshing token data')
      refreshAll()
    }
  }, [shouldRefresh, refreshAll])

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
    refreshImmediate,
    isLoading: isLoading && activeTokenIds.length > 0,
    error,
    lastRefresh,
  }
}
