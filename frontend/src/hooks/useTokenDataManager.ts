import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import GameArtifact from '../abi/Game.json'

const ABI = GameArtifact.abi
const BATCH_SIZE = 20 // Fetch 20 tokens at a time

interface TokenData {
  tokenId: number
  imageString: string
  isLoading: boolean
  isError: boolean
}

export function useTokenDataManager(activeTokenIds: number[], shouldRefresh?: boolean) {
  const [tokenDataCache, setTokenDataCache] = useState<Map<number, TokenData>>(new Map())
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const [currentBatch, setCurrentBatch] = useState<number>(0)
  const [isLoadingBatches, setIsLoadingBatches] = useState<boolean>(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced refresh function to prevent excessive API calls
  const debouncedRefresh = useCallback((callback: () => void, delay: number = 2000) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    refreshTimeoutRef.current = setTimeout(callback, delay)
  }, [])

  // Memoize activeTokenIds string to prevent unnecessary re-renders
  const activeTokenIdsString = useMemo(() => activeTokenIds.join(','), [activeTokenIds])

  // Calculate total batches needed
  const totalBatches = useMemo(() => {
    return Math.ceil(activeTokenIds.length / BATCH_SIZE)
  }, [activeTokenIds.length])

  // Get current batch of token IDs
  const currentBatchTokenIds = useMemo(() => {
    const start = currentBatch * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, activeTokenIds.length)
    return activeTokenIds.slice(start, end)
  }, [activeTokenIds, currentBatch, activeTokenIdsString])

  // Fetch batch of token images from cache API
  const fetchBatchFromCache = useCallback(async (tokenIds: number[]) => {
    if (tokenIds.length === 0) return

    // Create abort controller for this batch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      console.log(`Fetching batch of ${tokenIds.length} tokens from cache API`)
      
      // Fetch each token from cache API in parallel
      const promises = tokenIds.map(async (tokenId) => {
        try {
          const response = await fetch(`/api/get-token-image?tokenId=${tokenId}`, {
            signal: abortControllerRef.current?.signal,
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          return {
            tokenId,
            imageString: data.imageString,
            isLoading: false,
            isError: false,
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            throw error
          }
          console.error(`Error fetching token ${tokenId}:`, error)
          return {
            tokenId,
            imageString: '',
            isLoading: false,
            isError: true,
          }
        }
      })

      const results = await Promise.all(promises)
      
      // Update cache with results
      setTokenDataCache((prevCache) => {
        const newCache = new Map(prevCache)
        results.forEach((result) => {
          newCache.set(result.tokenId, result)
        })
        return newCache
      })

      return results
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Batch fetch aborted')
        return []
      }
      console.error('Error fetching batch:', error)
      return []
    }
  }, [])

  // Fetch current batch when it changes
  useEffect(() => {
    if (currentBatchTokenIds.length > 0) {
      setIsLoadingBatches(true)
      
      fetchBatchFromCache(currentBatchTokenIds).then((results) => {
        if (!results || results.length === 0) {
          setIsLoadingBatches(false)
          return
        }

        // Automatically fetch next batch after a short delay
        if (currentBatch < totalBatches - 1) {
          if (batchTimeoutRef.current) {
            clearTimeout(batchTimeoutRef.current)
          }
          batchTimeoutRef.current = setTimeout(() => {
            console.log(`Loading batch ${currentBatch + 2}/${totalBatches}`)
            setCurrentBatch((prev) => prev + 1)
          }, 300) // 300ms delay between batches - reduced since we're using cache API
        } else {
          setIsLoadingBatches(false)
          console.log('All token batches loaded')
        }
      })
    }
  }, [currentBatchTokenIds, currentBatch, totalBatches, fetchBatchFromCache])

  // Reset batch when activeTokenIds changes
  useEffect(() => {
    if (activeTokenIds.length > 0) {
      setCurrentBatch(0)
      setIsLoadingBatches(false)
      // Clear cache for tokens no longer in activeTokenIds
      setTokenDataCache((prevCache) => {
        const newCache = new Map()
        activeTokenIds.forEach(tokenId => {
          if (prevCache.has(tokenId)) {
            newCache.set(tokenId, prevCache.get(tokenId)!)
          }
        })
        return newCache
      })
    }
  }, [activeTokenIdsString])

  // Get data for a specific token
  const getTokenData = useCallback((tokenId: number): TokenData => {
    return tokenDataCache.get(tokenId) || {
      tokenId,
      imageString: '',
      isLoading: true,
      isError: false,
    }
  }, [tokenDataCache])

  // Debounced refresh all data
  const refreshAll = useCallback(() => {
    debouncedRefresh(() => {
      console.log('Refreshing all token data')
      setLastRefresh(Date.now())
      setCurrentBatch(0)
      setTokenDataCache(new Map())
    }, 2000)
  }, [debouncedRefresh])

  // Immediate refresh for critical updates (like after minting)
  const refreshImmediate = useCallback(() => {
    console.log('Immediate refresh triggered')
    setLastRefresh(Date.now())
    setCurrentBatch(0)
    setTokenDataCache(new Map())
  }, [])

  // Respond to external refresh trigger
  useEffect(() => {
    if (shouldRefresh) {
      console.log('External refresh triggered - refreshing token data')
      refreshAll()
    }
  }, [shouldRefresh, refreshAll])

  // Cleanup timeouts and abort controllers on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Calculate overall loading state
  const overallIsLoading = useMemo(() => {
    return isLoadingBatches || currentBatch < totalBatches - 1
  }, [isLoadingBatches, currentBatch, totalBatches])

  // Calculate loading progress
  const loadingProgress = useMemo(() => {
    if (totalBatches === 0) return 100
    return Math.round(((currentBatch + 1) / totalBatches) * 100)
  }, [currentBatch, totalBatches])

  return {
    getTokenData,
    refreshAll,
    refreshImmediate,
    isLoading: overallIsLoading,
    loadingProgress,
    totalBatches,
    currentBatch: currentBatch + 1,
    error: null,
    lastRefresh,
  }
}
