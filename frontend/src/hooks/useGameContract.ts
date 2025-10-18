import { useState, useEffect, useMemo } from 'react'
import { useAccount, useWatchContractEvent, useReadContract, useReadContracts, useBalance, useSimulateContract, useWriteContract, useEnsName } from 'wagmi'
import { formatUnits, parseEther } from 'viem'
import { ethers, providers } from 'ethers'
import { createDeferredPromise, type DeferredPromise } from '../pages/helpers/deferredPromise'
import { safeParseEventLogs } from '../pages/helpers/viemUtils'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as const

export function useGameContract(tokenId: string = '') {
  const { address } = useAccount()
  const [_address, setAddress] = useState<string>('')

  useEffect(() => {
    if (address) {
      setAddress(address)
      console.log(`${address} address`)
    }
  }, [address])

  // Memoized contract configuration
  const gameContract = useMemo(() => ({
    address: CONTRACT_ADDRESS,
    abi: ABI,
  } as const), [])

  // Optimized contract reads with memoized contracts
  const contracts = useMemo(() => [
    {
      ...gameContract,
      functionName: '_price' as const,
    },
    {
      ...gameContract,
      functionName: 'potatoTokenId' as const,
    },
    {
      ...gameContract,
      functionName: 'currentGeneration' as const,
    },
    {
      ...gameContract,
      functionName: 'roundMints' as const,
    },
    {
      ...gameContract,
      functionName: '_owner' as const,
    },
    {
      ...gameContract,
      functionName: 'getAllWinners' as const,
    },
    {
      ...gameContract,
      functionName: 'rewards' as const,
      args: [_address]
    },
    {
      ...gameContract,
      functionName: 'totalWins' as const,
      args: [_address]
    },
    {
      ...gameContract,
      functionName: '_maxperwallet' as const,
    },
    {
      ...gameContract,
      functionName: '_isTokenActive' as const,
      args: [tokenId]
    },
    {
      ...gameContract,
      functionName: 'ownerOf' as const,
      args: [tokenId]
    }
  ] as const, [_address, tokenId])

  const { data: readResults, isLoading: loadingReadResults, refetch: refetchReadResults, error: readError } = useReadContracts({
    contracts,
    query: {
      retry: 1, // Reduced retries
      retryDelay: 2000, // Fixed retry delay
      staleTime: 60000, // Increased to 60 seconds
      refetchInterval: false, // Disable automatic refetching
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: false, // Only refetch when explicitly called
      refetchOnReconnect: false, // Disable refetch on reconnect
    }
  })

  // Memoized parsed results
  const parsedResults = useMemo(() => {
    if (!readResults) return null
    
    // Debug logging for raw contract data
    console.log('=== RAW CONTRACT DATA ===')
    console.log('readResults:', readResults)
    console.log('readResults[0] (_price):', readResults[0])
    console.log('readResults[1] (potatoTokenId):', readResults[1])
    console.log('readResults[2] (currentGeneration):', readResults[2])
    console.log('readResults[3] (roundMints):', readResults[3])
    console.log('readResults[4] (_owner):', readResults[4])
    console.log('readResults[5] (getAllWinners):', readResults[5])
    console.log('readResults[6] (rewards):', readResults[6])
    console.log('readResults[7] (totalWins):', readResults[7])
    console.log('readResults[8] (_maxperwallet):', readResults[8])
    console.log('readResults[9] (_isTokenActive):', readResults[9])
    console.log('readResults[10] (ownerOf):', readResults[10])
    console.log('========================')
    
    return {
      _price: readResults[0] ? formatUnits(readResults[0] as unknown as bigint, 18) : '0',
      _potato_token: readResults[1] ? parseInt(readResults[1] as unknown as string, 10) : 0,
      _currentGeneration: readResults[2] ? parseInt(readResults[2] as unknown as string, 10) : 0,
      totalMints: readResults[3] ? parseInt(readResults[3] as unknown as string, 10) : 0,
      _ownerAddress: readResults[4]?.toString(),
      allWinners: readResults[5].result as `0x${string}`[],
      _rewards: readResults[6] ? formatUnits(readResults[6] as unknown as bigint, 18) : '0',
      totalWins: readResults[7] ? parseInt(readResults[7] as unknown as string, 10) : 0,
      maxPerWallet: readResults[8] ? parseInt(readResults[8] as unknown as string, 10) : 0,
      isTokenActive: readResults[9] as unknown as boolean,
      ownerOf: readResults[10]?.toString(),
    }
  }, [readResults])
  
  const isWinner = useMemo(() => 
    Array.isArray(parsedResults?.allWinners) ? parsedResults.allWinners.includes(_address as `0x${string}`) : false,
    [parsedResults?.allWinners, _address]
  )

  return {
    gameContract,
    parsedResults,
    isWinner,
    _address,
    loadingReadResults,
    refetchReadResults,
    readError
  }
}
