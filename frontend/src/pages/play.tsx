'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Abi, formatUnits, parseEther, parseEventLogs } from 'viem'
import { useAccount, useWatchContractEvent, useReadContract, UseReadContractsReturnType, useReadContracts, useBalance, useSimulateContract, useWriteContract, useEnsName, useChainId } from 'wagmi'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import ABI from '../abi/Game.json'
import { toast, ToastContainer } from 'react-toastify'
import { ethers, providers } from 'ethers'
import { useGameContract } from '../hooks/useGameContract'
import { useGameEvents } from '../hooks/useGameEvents'

// Import the event watching flag for debugging
const DISABLE_EVENT_WATCHING = false
import { useGameState } from '../hooks/useGameState'
import { useTokenManagement } from '../hooks/useTokenManagement'
import { useTokenDataManager } from '../hooks/useTokenDataManager'
import { usePrivyContractWrites } from '../hooks/usePrivyContractWrites'
import ErrorDisplay, { SuccessDisplay, LoadingDisplay } from '../components/TransactionNotifications'
import { createDeferredPromise, type DeferredPromise } from '../utils/deferredPromise'
import Navigation from '../components/Navigation'
import GameStateComponents from '../components/GameStateComponents'
import TokenGrid from '../components/TokenGrid'
import AdminControls from '../components/AdminControls'
import PassPotatoForm from '../components/PassPotatoForm'
import Timer from '../components/Timer'
import PlayerStats from '../components/PlayerStats'
import EventFeed from '../components/EventFeed'

// Lazy load heavy components
const TokenImage = dynamic(() => import('../components/TokenImage'), {
  loading: () => <div className="animate-pulse bg-gray-300 h-32 w-32 rounded"></div>,
  ssr: false
})

interface PlayProps {
  initalGameState?: string | null
  gen?: number
  price?: number | bigint
  maxSupply?: number
}

export default function Play({ initalGameState, gen, price, maxSupply }: PlayProps): React.JSX.Element {
  // --- Provider (WebSocket) ---
  const provider = useMemo(() => new providers.WebSocketProvider(
    process.env.NEXT_PUBLIC_ALCHEMY_URL_WEBSOCKET!
  ), [])

  // --- Custom Hooks ---
  const { getGameState, prevGameState, updateGameState } = useGameState(initalGameState ?? null)
  const { 
    activeTokens, 
    setActiveTokens, 
    explodedTokens, 
    sortedTokens, 
    setSortedTokens, 
    currentPage, 
    setCurrentPage, 
    searchId, 
    setSearchId, 
    shouldRefresh, 
    paginationData, 
    sortTokensAsc, 
    sortTokensDesc, 
    handleTokenExploded, 
    refreshAllImages, 
    handleSearch 
  } = useTokenManagement()
  
  // --- State Hooks ---
  const [mintAmount, setMintAmount] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [tokenId, setTokenId] = useState<string>('')
  const [totalCost, setTotalCost] = useState<number>(0)
  const [passPromise, setPassPromise] = useState<DeferredPromise<void> | null>(null)
  const [isLoadingActiveTokens, setIsLoadingActiveTokens] = useState<boolean>(true)
  const [_potatoTokenId, setPotatoTokenId] = useState<number>(0)
  const [passArgs, setPassArgs] = useState<unknown[] | null>(null)
  const [mintArgs, setMintArgs] = useState<unknown[] | null>(null)
  
  // Transaction notification states
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null)
  const [transactionLoading, setTransactionLoading] = useState<string | null>(null)

  // --- Game Contract Hook (needs tokenId) ---
  const { gameContract, parsedResults, isWinner: hookIsWinner, _address, loadingReadResults, refetchReadResults, readError } = useGameContract(tokenId)
  const chainId = useChainId()
  const { isConnected } = useAccount()
  
  // Privy connection detection
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  
  // Enhanced connection detection that works with Privy embedded wallets
  const walletsLength = wallets.length
  const firstWalletAddress = wallets[0]?.address
  const isActuallyConnected = useMemo(() => {
    return isConnected || (authenticated && walletsLength > 0 && firstWalletAddress)
  }, [isConnected, authenticated, walletsLength, firstWalletAddress])
  
  // Get the actual address from either wagmi or Privy
  const actualAddress = useMemo(() => {
    if (_address) return _address
    if (walletsLength > 0 && firstWalletAddress) return firstWalletAddress
    return null
  }, [_address, walletsLength, firstWalletAddress])

  // Override isWinner calculation to use actualAddress
  const isWinner = useMemo(() => {
    if (!Array.isArray(parsedResults?.allWinners) || !actualAddress) return false
    return (parsedResults.allWinners as string[]).includes(actualAddress)
  }, [parsedResults?.allWinners, actualAddress])

  // --- Contract Writes Hook (needs mintAmount, price, tokenId) ---
  const {
    mintSim,
    writeMint,
    mintPending,
    passSim,
    writePass,
    passPending,
    claimSim,
    writeClaim,
    startSim,
    writeStartGame,
    starting,
    endMintSim,
    writeEndMint,
    ending,
    pauseSim,
    writePause,
    pausing,
    resumeSim,
    writeResume,
    resuming,
    restartSim,
    writeRestart,
    restarting,
    isPrivyWallet,
    walletType
  } = usePrivyContractWrites(mintAmount, parsedResults?._price, tokenId, getGameState || undefined)

  // --- Game Events Hook (needs _address) ---
  const { 
    events, 
    setEvents, 
    shouldRefresh: eventShouldRefresh, 
    explosion, 
    remainingTime, 
    setRemainingTime, 
    roundMints, 
    setRoundMints,
    triggerRefresh,
    pollingEnabled,
    setPollingEnabled
  } = useGameEvents(actualAddress || '', () => refetchAdditionalResults(), refreshAllImages)
  
  // --- Memoized values ---
  const displayPrice = useMemo(() => ethers.utils.formatEther(BigInt(price || 0)), [price])
  
  // --- Constants ---
  const CONTRACT = '0x1fB69dDc3C0CA3af33400294893b7e99b8f224dF' as `0x${string}`
  const CONTRACT_ADDRESS = '0x1fB69dDc3C0CA3af33400294893b7e99b8f224dF' as const
  const ADMIN_ADDRESS = "0x41b1e204e9c15fF5894bd47C6Dc3a7Fa98C775C7"

  // -----------------------------Single Reads End---------------------------------

  // Batch all additional contract reads to reduce requests - start with basic functions
  const additionalContracts = useMemo(() => {
    const contracts: any[] = [
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as Abi,
        functionName: 'getActiveTokenIds' as const,
      },
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as Abi,
        functionName: 'getExplosionTime' as const,
      },
      {
        address: CONTRACT_ADDRESS,
        abi: ABI as Abi,
        functionName: 'getAllWinners' as const,
      }
    ]

    // Only add address-dependent calls if we have an address
    if (actualAddress) {
      contracts.push(
        {
          address: CONTRACT_ADDRESS,
          abi: ABI as Abi,
          functionName: 'userHasPotatoToken' as const,
          args: [actualAddress] as const,
        },
        {
          address: CONTRACT_ADDRESS,
          abi: ABI as Abi,
          functionName: 'successfulPasses' as const,
          args: [actualAddress] as const,
        },
        {
          address: CONTRACT_ADDRESS,
          abi: ABI as Abi,
          functionName: 'addressActiveTokenCount' as const,
          args: [actualAddress] as const,
        }
      )
    }

    return contracts
  }, [actualAddress])

  const { data: additionalResults, isLoading: loadingAdditionalResults, refetch: refetchAdditionalResults } = useReadContracts({
    contracts: additionalContracts,
    query: {
      enabled: true, // Always enabled to get basic contract data
      staleTime: 60000, // Increased to 60 seconds
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Enable refetch on mount for initial data
      refetchOnReconnect: false, // Disable refetch on reconnect
      retry: 1, // Reduced retries
      retryDelay: 2000, // Fixed retry delay
    }
  })

  // Memoized parsed results for additional data
  const additionalData = useMemo(() => {
    if (!additionalResults) return null
    
    // Handle dynamic array based on what contracts were called
    // Base contracts: getActiveTokenIds, getExplosionTime, getAllWinners
    const baseResults = additionalResults.slice(0, 3)
    
    // Address-dependent results come after base results if address exists
    const addressResults = actualAddress ? additionalResults.slice(3, 6) : []
    
    return {
      explosionTime: baseResults[1]?.result ? parseInt(baseResults[1].result as unknown as string, 10) : 0,
      roundWinner: undefined, // Will be updated when we find the correct function
      hasPotatoToken: addressResults[0]?.result?.toString(),
      getActiveTokenIds: baseResults[0]?.result as unknown as number[] || [],
      allWinners: baseResults[2]?.result as unknown as string[] || [],
      successfulPasses: addressResults[1]?.result ? parseInt(addressResults[1].result as unknown as string, 10) : 0,
      activeTokensCount: addressResults[2]?.result ? parseInt(addressResults[2].result as unknown as string, 10) : 0,
      gameState: parsedResults?.gameState || 'Unknown',
    }
  }, [additionalResults, actualAddress, parsedResults?.gameState])

  const { data: bal, isLoading: balanceLoading, isError } = useBalance({
    address: actualAddress ? actualAddress as `0x${string}` : undefined,
    chainId: 84532,
    query: {
      enabled: !!actualAddress, // Only fetch balance when address is available
      staleTime: 60000, // Increased to 60 seconds
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Enable refetch on mount for initial data
      refetchOnReconnect: false, // Disable refetch on reconnect
      retry: 1, // Reduced retries
    }
  })

  const value = bal?.value ?? 0n
  const balance = formatUnits(value, bal?.decimals ?? 18)

  const { data: winnerEnsName, isError: errorWinnerEnsName, isLoading: loadingWinnerEnsName } = useEnsName({
    address: additionalData?.roundWinner ? additionalData.roundWinner as `0x${string}` : undefined,
    query: {
      enabled: !!additionalData?.roundWinner, // Only fetch ENS when round winner exists
      staleTime: 60000, // Increased to 60 seconds
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Enable refetch on mount for initial data
      refetchOnReconnect: false, // Disable refetch on reconnect
      retry: 1, // Reduced retries
    }
  })

  // Write Hooks - Now handled by useContractWrites hook

  // Enhanced transaction handlers with error handling
  const handleTransaction = async (transactionFn: () => Promise<any>, action: string, showNotifications: boolean = true) => {
    try {
      if (showNotifications) {
        setTransactionError(null)
        setTransactionSuccess(null)
        setTransactionLoading(`Processing ${action}...`)
      }
      
      const result = await transactionFn()
      
      if (showNotifications) {
        setTransactionLoading(null)
        setTransactionSuccess(`${action} completed successfully!`)
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setTransactionSuccess(null), 5000)
      }
      
      return result
    } catch (error: any) {
      if (showNotifications) {
        setTransactionLoading(null)
        const errorMessage = error?.message || error?.toString() || `Failed to ${action.toLowerCase()}`
        setTransactionError(errorMessage)
        
        // Auto-hide error message after 8 seconds
        setTimeout(() => setTransactionError(null), 8000)
      }
      
      throw error
    }
  }

  // Toast functions
  function noAddressToast() {
    toast.info("Please Connect to Interact")
  }

  function startToast() {
    toast.error("Must Restart Game to Start Again")
  }

  function endToast() {
    toast.error("Minting Already Ended")
  }

  function pauseToast() {
    toast.error("Game Already Paused")
  }

  function resumeToast() {
    toast.error("Game Already Resumed")
  }

  function restartToast() {
    toast.error("Game Already Restarted")
  }

  function noRewardsToast() {
    toast.error("No Rewards to Claim")
  }

  function maxPerWalletToast() {
    toast.error("Max Tokens Per Wallet Reached")
  }

  function noPotatoToast() {
    toast.error("You Don't Have the Potato")
  }

  function notActiveToast() {
    toast.error("Token Not Active")
  }

  function notOwnerToast() {
    toast.error("You Don't Own This Token")
  }

  // Event handlers - Now handled by useGameEvents hook

  // --- Loading states ---
  const isLoading = loadingReadResults || loadingAdditionalResults || balanceLoading
  

  // --- Optimized effects ---
  useEffect(() => {
    if (parsedResults?._potato_token) {
      setPotatoTokenId(parsedResults._potato_token);
    }
    if (additionalData?.explosionTime) {
      setRemainingTime(additionalData.explosionTime);
    }
  }, [parsedResults?._potato_token, additionalData?.explosionTime, setRemainingTime]);

  useEffect(() => {
    if (additionalData?.getActiveTokenIds) {
      const ids = additionalData.getActiveTokenIds;
      // Ensure ids is an array before calling slice
      if (Array.isArray(ids)) {
        const activeIds = ids.slice(1).map((tokenId) => Number(tokenId));
        setActiveTokens(activeIds);
        setIsLoadingActiveTokens(false);
      } else {
        console.warn('getActiveTokenIds is not an array:', ids);
        setActiveTokens([]);
        setIsLoadingActiveTokens(false);
      }
    }
  }, [additionalData?.getActiveTokenIds, setActiveTokens]);

  useEffect(() => {
    setSortedTokens(activeTokens);
  }, [activeTokens, setSortedTokens]);

  useEffect(() => {
    console.log("An UNKNOWN X BEDTIME PRODUCTION")
  }, []);

  // Log contract read errors and debug data
  useEffect(() => {
    if (readError) {
      console.error('Contract read error:', readError)
      toast.error('Failed to load game data. Please try again.')
    }
  }, [readError]);


  // Update game state when contract data changes
  useEffect(() => {
    if (parsedResults?.gameState && parsedResults.gameState !== getGameState) {
      console.log('Updating game state from contract:', parsedResults.gameState)
      updateGameState(parsedResults.gameState)
    }
  }, [parsedResults?.gameState, getGameState, updateGameState]);

  // Debug admin controls
  useEffect(() => {
    console.log('=== ADMIN CONTROLS DEBUG ===');
    console.log('actualAddress:', actualAddress);
    console.log('parsedResults?._ownerAddress:', parsedResults?._ownerAddress);
    console.log('getGameState:', getGameState);
    console.log('startSim:', startSim);
    console.log('endMintSim:', endMintSim);
    console.log('pauseSim:', pauseSim);
    console.log('resumeSim:', resumeSim);
    console.log('restartSim:', restartSim);
  }, [actualAddress, parsedResults?._ownerAddress, getGameState, startSim, endMintSim, pauseSim, resumeSim, restartSim]);

  // Refresh contract data when events trigger shouldRefresh
  useEffect(() => {
    if (eventShouldRefresh) {
      console.log('Event triggered refresh - refetching contract data')
      refetchReadResults()
      // Also refresh token images
      refreshAllImages()
    }
  }, [eventShouldRefresh, refetchReadResults, refreshAllImages]);

  // --- Optimized timer effect ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (remainingTime && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime && prevTime > 0) {
            return prevTime - 1;
          } else {
            if (timer) clearInterval(timer);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [remainingTime, setRemainingTime]);


  // Helper functions - Now handled by custom hooks

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${darkMode ? 'darkmode bg-fixed text-white min-h-screen font-darumadrop' : 'normal bg-fixed min-h-screen font-darumadrop'}`}>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={
            darkMode ? 'dark' : 'light'
          }
        />
        <Navigation 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
        />

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 gradient-text ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {parsedResults?._currentGeneration ? `Round ${parsedResults._currentGeneration}` : "Round 1"}
            </h1>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-amber-500 to-red-500 mx-auto rounded-full"></div>
          </div>

        <GameStateComponents
          darkMode={darkMode}
          gameState={getGameState}
          address={actualAddress}
          mintAmount={mintAmount}
          setMintAmount={setMintAmount}
          totalCost={totalCost}
          setTotalCost={setTotalCost}
          price={parsedResults?._price || '0'}
          balance={balance}
          mintPending={mintPending}
          onMint={() => {
                          if (!actualAddress) {
                            noAddressToast();
                          } else if ((additionalData?.activeTokensCount || 0) >= (parsedResults?.maxPerWallet ?? 0)) {
                            maxPerWalletToast();
                          } else if (mintSim?.request) {
                            handleTransaction(() => writeMint(mintSim.request), 'Mint').then(() => {
                              // Refresh token images after successful mint
                              console.log('Mint successful - refreshing token images')
                              refreshAllImages()
                            }).catch((error) => {
                              console.error('Mint failed:', error)
                            });
                          }
                        }}
          isWinner={isWinner}
          rewards={parsedResults?._rewards || '0'}
          onClaimRewards={() => {
            if (!actualAddress) {
              noAddressToast();
            } else if (Number(parsedResults?._rewards || 0) == 0) {
              noRewardsToast();
            } else if (claimSim?.request) {
              handleTransaction(() => writeClaim(claimSim.request), 'Claim Rewards');
            }
          }}
        />

        <EventFeed darkMode={darkMode} events={events} />

        <TokenGrid
          darkMode={darkMode}
          gameState={getGameState || ''}
          loadingActiveTokenIds={loadingAdditionalResults}
          paginationData={paginationData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          explodedTokens={explodedTokens}
          potatoTokenId={parsedResults?._potato_token || 0}
          shouldRefresh={shouldRefresh}
          onTokenExploded={handleTokenExploded}
          onRefreshImages={refreshAllImages}
          onSortTokensAsc={sortTokensAsc}
          onSortTokensDesc={sortTokensDesc}
          onSearch={handleSearch}
          searchId={searchId}
          setSearchId={setSearchId}
        />

        <AdminControls
          darkMode={darkMode}
          address={actualAddress || ''}
          ownerAddress={parsedResults?._ownerAddress || ''}
          gameState={getGameState || ''}
          startSim={startSim}
          endMintSim={endMintSim}
          pauseSim={pauseSim}
          resumeSim={resumeSim}
          restartSim={restartSim}
          onStartGame={() => {
                    console.log('=== START GAME CLICKED ===');
                    console.log('actualAddress:', actualAddress);
                    console.log('getGameState:', getGameState);
                    console.log('startSim:', startSim);
                    console.log('startSim?.request:', startSim?.request);
                    
                    if (!actualAddress) {
                      console.log('No address - showing toast');
                      noAddressToast();
                    } else if (getGameState !== "Queued") {
                      console.log('Game state not Queued - showing toast');
                      startToast();
                    } else if (startSim?.request) {
                      console.log('Starting game transaction...');
                      handleTransaction(() => writeStartGame(startSim.request), 'Start Game');
                    } else {
                      console.log('No valid simulation request available, trying direct transaction...');
                      try {
                        handleTransaction(() => writeStartGame({
                          abi: ABI,
                          address: CONTRACT_ADDRESS,
                          functionName: 'startGame'
                        }), 'Start Game');
                      } catch (error: any) {
                        console.error('Direct transaction failed:', error);
                        // Check if it's an unknown error signature
                        if (error?.message?.includes('Unable to decode signature')) {
                          toast.error('Cannot start game at this time - contract constraint');
                        } else {
                          toast.error('Unable to start game - transaction failed');
                        }
                      }
                    }
                  }}
          onEndMinting={() => {
                    console.log('=== END MINTING CLICKED ===');
                    console.log('actualAddress:', actualAddress);
                    console.log('getGameState:', getGameState);
                    console.log('endMintSim:', endMintSim);
                    console.log('endMintSim?.request:', endMintSim?.request);
                    
                    if (!actualAddress) {
                      console.log('No address - showing toast');
                      noAddressToast();
                    } else if (getGameState !== "Minting") {
                      console.log('Game state not Minting - showing toast');
                      endToast();
                    } else if (endMintSim?.request) {
                      console.log("Ending minting transaction...");
                      handleTransaction(() => writeEndMint(endMintSim.request), 'End Minting');
                    } else {
                      console.log('No valid simulation request available, trying direct transaction...');
                      // Try direct transaction even without simulation
                      try {
                        handleTransaction(() => writeEndMint({
                          abi: ABI,
                          address: CONTRACT_ADDRESS,
                          functionName: 'endMinting',
                          gas: 5000000n // Higher gas limit for VRF request
                        }), 'End Minting');
                      } catch (error: any) {
                        console.error('Direct transaction failed:', error);
                        // Check if it's an unknown error signature
                        if (error?.message?.includes('Unable to decode signature')) {
                          toast.error('Cannot end minting at this time - contract constraint');
                        } else {
                          toast.error('Unable to end minting - transaction failed');
                        }
                      }
                    }
                  }}
          onPauseGame={() => {
                    console.log('=== PAUSE GAME CLICKED ===');
                    console.log('actualAddress:', actualAddress);
                    console.log('getGameState:', getGameState);
                    console.log('pauseSim:', pauseSim);
                    console.log('pauseSim?.request:', pauseSim?.request);
                    
                    if (!actualAddress) {
                      console.log('No address - showing toast');
                      noAddressToast();
                    } else if (getGameState !== "Playing" && getGameState !== "Final Stage" && getGameState !== "Minting") {
                      console.log('Game state not pausable - showing toast');
                      pauseToast();
                    } else if (pauseSim?.request) {
                      console.log('Pausing game transaction...');
                      handleTransaction(() => writePause(pauseSim.request), 'Pause Game');
                    } else {
                      console.log('No valid simulation request available, trying direct transaction...');
                      try {
                        handleTransaction(() => writePause({
                          abi: ABI,
                          address: CONTRACT_ADDRESS,
                          functionName: 'pauseGame'
                        }), 'Pause Game');
                      } catch (error: any) {
                        console.error('Direct transaction failed:', error);
                        // Check if it's an unknown error signature
                        if (error?.message?.includes('Unable to decode signature')) {
                          toast.error('Cannot pause game at this time - contract constraint');
                        } else {
                          toast.error('Unable to pause game - transaction failed');
                        }
                      }
                    }
                  }}
          onResumeGame={() => {
                    console.log('=== RESUME GAME CLICKED ===');
                    console.log('actualAddress:', actualAddress);
                    console.log('getGameState:', getGameState);
                    console.log('resumeSim:', resumeSim);
                    console.log('resumeSim?.request:', resumeSim?.request);
                    
                    if (!actualAddress) {
                      console.log('No address - showing toast');
                      noAddressToast();
                    } else if (getGameState !== "Paused") {
                      console.log('Game state not Paused - showing toast');
                      resumeToast();
                    } else if (resumeSim?.request) {
                      console.log('Resuming game transaction...');
                      handleTransaction(() => writeResume(resumeSim.request), 'Resume Game');
                    } else {
                      console.log('No valid simulation request available, trying direct transaction...');
                      try {
                        handleTransaction(() => writeResume({
                          abi: ABI,
                          address: CONTRACT_ADDRESS,
                          functionName: 'resumeGame'
                        }), 'Resume Game');
                      } catch (error: any) {
                        console.error('Direct transaction failed:', error);
                        // Check if it's an unknown error signature
                        if (error?.message?.includes('Unable to decode signature')) {
                          toast.error('Cannot resume game at this time - contract constraint');
                        } else {
                          toast.error('Unable to resume game - transaction failed');
                        }
                      }
                    }
                  }}
          onRestartGame={() => {
                    console.log('=== RESTART GAME CLICKED ===');
                    console.log('actualAddress:', actualAddress);
                    console.log('getGameState:', getGameState);
                    console.log('restartSim:', restartSim);
                    console.log('restartSim?.request:', restartSim?.request);
                    
                    if (!actualAddress) {
                      console.log('No address - showing toast');
                      noAddressToast();
                    } else if (getGameState !== "Ended") {
                      console.log('Game state not Ended - showing toast');
                      restartToast();
                    } else if (restartSim?.request) {
                      console.log('Restarting game transaction...');
                      handleTransaction(() => writeRestart(restartSim.request), 'Restart Game');
                    } else {
                      console.log('No valid simulation request available, trying direct transaction...');
                      try {
                        handleTransaction(() => writeRestart({
                          abi: ABI,
                          address: CONTRACT_ADDRESS,
                          functionName: 'restartGame'
                        }), 'Restart Game');
                      } catch (error: any) {
                        console.error('Direct transaction failed:', error);
                        // Check if it's an unknown error signature
                        if (error?.message?.includes('Unable to decode signature')) {
                          toast.error('Cannot restart game at this time - contract constraint');
                        } else {
                          toast.error('Unable to restart game - transaction failed');
                        }
                      }
                    }
                  }}
        />

          {getGameState === "Playing" && actualAddress && (
          <PassPotatoForm
            darkMode={darkMode}
            tokenId={tokenId}
            setTokenId={setTokenId}
            passPending={passPending}
            onPassPotato={() => {
                    if (!actualAddress) {
                      noAddressToast();
                    } else if (additionalData?.hasPotatoToken !== "true") {
                      noPotatoToast();
                    } else if (!parsedResults?.isTokenActive) {
                      notActiveToast();
                    } else if (parsedResults?.ownerOf !== actualAddress) {
                      notOwnerToast();
                    } else if (passSim?.request) {
                      handleTransaction(() => writePass(passSim.request), 'Pass Potato');
                    }
                  }}
          />
        )}

        <Timer 
          remainingTime={remainingTime} 
          explosion={explosion} 
          darkMode={darkMode} 
        />

        <PlayerStats
          darkMode={darkMode}
          totalWins={parsedResults?.totalWins || 0}
          successfulPasses={additionalData?.successfulPasses || 0}
          activeTokensCount={additionalData?.activeTokensCount || 0}
          rewards={parsedResults?._rewards || '0'}
        />

        </div>

        {/* Transaction Notifications */}
        <ErrorDisplay 
          error={transactionError} 
          onClose={() => setTransactionError(null)} 
          darkMode={darkMode} 
        />
        <SuccessDisplay 
          message={transactionSuccess || ''} 
          onClose={() => setTransactionSuccess(null)} 
          darkMode={darkMode} 
        />
        <LoadingDisplay 
          message={transactionLoading || ''} 
          darkMode={darkMode} 
        />
      </div>
    </>
  )
}
