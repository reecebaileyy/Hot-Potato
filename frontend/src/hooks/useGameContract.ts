import { useState, useEffect, useMemo } from 'react'
import { useAccount, useWatchContractEvent, useReadContract, useReadContracts, useBalance, useSimulateContract, useWriteContract, useEnsName } from 'wagmi'
import { formatUnits, parseEther } from 'viem'
import { ethers, providers } from 'ethers'
import { createDeferredPromise, type DeferredPromise } from '../pages/helpers/deferredPromise'
import { safeParseEventLogs } from '../pages/helpers/viemUtils'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0xD89A2aE68A3696D42327D75C02095b632D1B8f53' as const

// Debug logging for contract configuration
console.log('=== CONTRACT CONFIG DEBUG ===')
console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS)
console.log('ABI length:', ABI.length)
console.log('ABI has getGameState:', ABI.some((item: any) => item.name === 'getGameState'))
console.log('=============================')

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

  // Contract calls - start with basic ERC721 functions that should always work
  const contracts = useMemo(() => {
    const baseContracts: any[] = [
      {
        ...gameContract,
        functionName: 'name' as const,
      },
      {
        ...gameContract,
        functionName: 'symbol' as const,
      },
      {
        ...gameContract,
        functionName: 'totalSupply' as const,
      },
      {
        ...gameContract,
        functionName: 'owner' as const,
      },
      {
        ...gameContract,
        functionName: 'getGameState' as const,
      },
      {
        ...gameContract,
        functionName: 'currentGeneration' as const,
      },
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
        functionName: '_maxperwallet' as const,
      }
    ]

    // Add getAllWinners function
    baseContracts.push({
      ...gameContract,
      functionName: 'getAllWinners' as const,
    })

    // Only add address-dependent calls if we have an address
    if (_address) {
      baseContracts.push(
        {
          ...gameContract,
          functionName: 'rewards' as const,
          args: [_address]
        },
        {
          ...gameContract,
          functionName: 'totalWins' as const,
          args: [_address]
        }
      )
    }

    // Only add tokenId-dependent calls if we have a tokenId
    if (tokenId) {
      baseContracts.push({
        ...gameContract,
        functionName: 'ownerOf' as const,
        args: [tokenId]
      })
    }

    return baseContracts
  }, [_address, tokenId])

  const { data: readResults, isLoading: loadingReadResults, refetch: refetchReadResults, error: readError } = useReadContracts({
    contracts,
    query: {
      retry: 1, // Reduced retries
      retryDelay: 2000, // Fixed retry delay
      staleTime: 60000, // Increased to 60 seconds
      refetchInterval: false, // Disable automatic refetching
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: true, // Enable refetch on mount for initial data
      refetchOnReconnect: false, // Disable refetch on reconnect
    }
  })

  // Memoized parsed results
  const parsedResults = useMemo(() => {
    if (!readResults) {
      console.log('=== NO CONTRACT DATA ===')
      console.log('readResults is null or undefined')
      console.log('loadingReadResults:', loadingReadResults)
      console.log('readError:', readError)
      console.log('========================')
      return null
    }
    
    // Debug logging for raw contract data
    console.log('=== RAW CONTRACT DATA ===')
    console.log('readResults:', readResults)
    console.log('readResults length:', readResults.length)
    readResults.forEach((result, index) => {
      console.log(`readResults[${index}]:`, result)
      console.log(`readResults[${index}] success:`, result.status === 'success')
      console.log(`readResults[${index}] error:`, result.error)
    })
    console.log('========================')
    
    // Handle dynamic array based on what contracts were called
    // Base contracts are always called: name, symbol, totalSupply, owner, getGameState, currentGeneration, _price, potatoTokenId, _maxperwallet, getAllWinners
    const baseResults = readResults.slice(0, 10)
    
    // Address-dependent results (rewards, totalWins) come after base results if address exists
    const addressResults = _address ? readResults.slice(10, 12) : []
    
    // TokenId-dependent results come last if tokenId exists
    const tokenResults = tokenId ? readResults.slice(-1) : []
    
    const gameStateResult = baseResults[4]?.result
    const gameStateString = gameStateResult?.toString() || 'Unknown'
    
    console.log('=== GAME STATE DEBUG ===')
    console.log('baseResults[4] (getGameState):', baseResults[4])
    console.log('gameStateResult:', gameStateResult)
    console.log('gameStateString:', gameStateString)
    console.log('========================')
    
    return {
      _price: baseResults[6]?.result ? formatUnits(baseResults[6].result as unknown as bigint, 18) : '0',
      _potato_token: baseResults[7]?.result ? parseInt(baseResults[7].result as unknown as string, 10) : 0,
      _currentGeneration: baseResults[5]?.result ? parseInt(baseResults[5].result as unknown as string, 10) : 1,
      totalMints: baseResults[2]?.result ? parseInt(baseResults[2].result as unknown as string, 10) : 0,
      _ownerAddress: baseResults[3]?.result?.toString(),
      allWinners: baseResults[9]?.result as unknown as string[] || [],
      _rewards: addressResults[0]?.result ? formatUnits(addressResults[0].result as unknown as bigint, 18) : '0',
      totalWins: addressResults[1]?.result ? parseInt(addressResults[1].result as unknown as string, 10) : 0,
      maxPerWallet: baseResults[8]?.result ? parseInt(baseResults[8].result as unknown as string, 10) : 0,
      isTokenActive: false, // Will be updated when we find the correct function
      ownerOf: tokenResults[0]?.result?.toString(),
      gameState: gameStateString,
    }
  }, [readResults, _address, tokenId])
  
  const isWinner = useMemo(() => {
    if (!Array.isArray(parsedResults?.allWinners) || !_address) return false
    return (parsedResults.allWinners as string[]).includes(_address)
  }, [parsedResults?.allWinners, _address])

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
