import { useState, useEffect, useMemo } from 'react'
import { useAccount, useWatchContractEvent, useReadContract, useReadContracts, useBalance, useSimulateContract, useWriteContract, useEnsName } from 'wagmi'
import { formatUnits, parseEther } from 'viem'
import { ethers, providers } from 'ethers'
import { createDeferredPromise, type DeferredPromise } from '../utils/deferredPromise'
import { safeParseEventLogs } from '../utils/viemUtils'
import GameArtifact from '../abi/Game.json'

const ABI = GameArtifact.abi
const CONTRACT_ADDRESS = '0x050Bd2067828D5e94a3E90Be05949C6798b2c176' as const

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

  // Get current generation first to use for hallOfFame lookup
  const { data: currentGenData } = useReadContracts({
    contracts: [{
      ...gameContract,
      functionName: 'currentGeneration' as const,
    }],
    query: {
      staleTime: 60000,
    }
  })

  const currentGen = currentGenData?.[0]?.result ? parseInt(currentGenData[0].result as unknown as string, 10) : 1

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

    // Add hallOfFame for current generation to get current round winner
    baseContracts.push({
      ...gameContract,
      functionName: 'hallOfFame' as const,
      args: [currentGen]
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
  }, [_address, tokenId, gameContract, currentGen])

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

  // Debug error logging
  useEffect(() => {
    if (readError) {
      console.log('=== CONTRACT READ ERROR ===')
      console.log('readError:', readError)
      console.log('readError type:', typeof readError)
      console.log('readError message:', readError.message)
      console.log('readError details:', readError)
      console.log('===========================')
    }
  }, [readError])

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
    // Base contracts are always called: name, symbol, totalSupply, owner, getGameState, currentGeneration, _price, potatoTokenId, _maxperwallet, getAllWinners, hallOfFame[currentGen]
    const baseResults = readResults.slice(0, 11)
    
    // Address-dependent results (rewards, totalWins) come after base results if address exists
    const addressResults = _address ? readResults.slice(11, 13) : []
    
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
      currentRoundWinner: baseResults[10]?.result?.toString() || null,
      _rewards: addressResults[0]?.result ? formatUnits(addressResults[0].result as unknown as bigint, 18) : '0',
      totalWins: addressResults[1]?.result ? parseInt(addressResults[1].result as unknown as string, 10) : 0,
      maxPerWallet: baseResults[8]?.result ? parseInt(baseResults[8].result as unknown as string, 10) : 0,
      isTokenActive: false, // Will be updated when we find the correct function
      ownerOf: tokenResults[0]?.result?.toString(),
      gameState: gameStateString,
    }
  }, [readResults, _address, tokenId, loadingReadResults, readError])
  
  const isWinner = useMemo(() => {
    if (!_address || !parsedResults?.currentRoundWinner) return false
    return parsedResults.currentRoundWinner.toLowerCase() === _address.toLowerCase()
  }, [parsedResults?.currentRoundWinner, _address])

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
