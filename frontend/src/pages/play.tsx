'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Abi, formatUnits, parseEther, parseEventLogs } from 'viem'
import { useAccount, useWatchContractEvent, useReadContract, UseReadContractsReturnType, useReadContracts, useBalance, useSimulateContract, useWriteContract, useEnsName } from 'wagmi'
import ABI from '../abi/Game.json'
import { toast, ToastContainer } from 'react-toastify'
import { ethers, providers } from 'ethers'
import { useGameContract } from '../hooks/useGameContract'
import { useGameEvents } from '../hooks/useGameEvents'
import { useGameState } from '../hooks/useGameState'
import { useTokenManagement } from '../hooks/useTokenManagement'
import { useTokenDataManager } from '../hooks/useTokenDataManager'
import { useContractWrites } from '../hooks/useContractWrites'
import { createDeferredPromise, type DeferredPromise } from './helpers/deferredPromise'
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

  // --- Game Contract Hook (needs tokenId) ---
  const { gameContract, parsedResults, isWinner, _address, loadingReadResults, refetchReadResults, readError } = useGameContract(tokenId)

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
    restarting
  } = useContractWrites(mintAmount, parsedResults?._price, tokenId)

  // --- Game Events Hook (needs _address) ---
  const { events, setEvents, explosion, remainingTime, setRemainingTime } = useGameEvents(_address, () => refetchAdditionalResults())
  
  // --- Memoized values ---
  const displayPrice = useMemo(() => ethers.utils.formatEther(BigInt(price || 0)), [price])
  
  // --- Constants ---
  const CONTRACT = '0xD89A2aE68A3696D42327D75C02095b632D1B8f53' as `0x${string}`
  const CONTRACT_ADDRESS = '0xD89A2aE68A3696D42327D75C02095b632D1B8f53' as const
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
    if (_address) {
      contracts.push(
        {
          address: CONTRACT_ADDRESS,
          abi: ABI as Abi,
          functionName: 'userHasPotatoToken' as const,
          args: [_address] as const,
        },
        {
          address: CONTRACT_ADDRESS,
          abi: ABI as Abi,
          functionName: 'successfulPasses' as const,
          args: [_address] as const,
        },
        {
          address: CONTRACT_ADDRESS,
          abi: ABI as Abi,
          functionName: 'addressActiveTokenCount' as const,
          args: [_address] as const,
        }
      )
    }

    return contracts
  }, [_address])

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
    const addressResults = _address ? additionalResults.slice(3, 6) : []
    
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
  }, [additionalResults, _address, parsedResults?.gameState])

  const { data: bal, isLoading: balanceLoading, isError } = useBalance({
    address: _address ? _address as `0x${string}` : undefined,
    chainId: 84532,
    query: {
      enabled: !!_address, // Only fetch balance when address is available
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
  }, [parsedResults?._potato_token, additionalData?.explosionTime]);

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
  }, [additionalData?.getActiveTokenIds]);

  useEffect(() => {
    setSortedTokens(activeTokens);
  }, [activeTokens]);

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
  }, [remainingTime]);


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

        <h1 className={`${darkMode ? 'text-4xl md:w-2/3 lg:w-1/2 col-start-2 col-span-6 w-full text-center mx-auto' : 'text-4xl md:w-2/3 lg:w-1/2 col-start-2 col-span-6 w-full text-center mx-auto'}`}>
          {parsedResults?._currentGeneration ? `Round ${parsedResults._currentGeneration}` : "Round 1"}
        </h1>

        {/* Debug Test Button */}
        <div className="w-full flex justify-center mb-4">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={async () => {
              console.log('=== MANUAL CONTRACT TEST ===')
              try {
                // Test basic network connectivity
                const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org')
                const network = await provider.getNetwork()
                console.log('Network:', network)
                
                // Test contract existence
                const code = await provider.getCode('0xD89A2aE68A3696D42327D75C02095b632D1B8f53')
                console.log('Contract code length:', code.length)
                console.log('Contract exists:', code !== '0x')
                
                // Test basic contract call
                const contract = new ethers.Contract('0xD89A2aE68A3696D42327D75C02095b632D1B8f53', ABI, provider)
                try {
                  const name = await contract.name()
                  console.log('Contract name:', name)
                } catch (err) {
                  console.log('Name call failed:', err)
                }
                
                try {
                  const gameState = await contract.getGameState()
                  console.log('Game state:', gameState)
                } catch (err) {
                  console.log('Game state call failed:', err)
                }
                
              } catch (error) {
                console.log('Network test failed:', error)
              }
              console.log('================================')
            }}
          >
            Test New Contract
          </button>
        </div>

        <GameStateComponents
          darkMode={darkMode}
          gameState={getGameState}
          address={_address}
          mintAmount={mintAmount}
          setMintAmount={setMintAmount}
          totalCost={totalCost}
          setTotalCost={setTotalCost}
          price={parsedResults?._price || '0'}
          balance={balance}
          mintPending={mintPending}
          onMint={() => {
                          if (!_address) {
                            noAddressToast();
                          } else if ((additionalData?.activeTokensCount || 0) >= (parsedResults?.maxPerWallet ?? 0)) {
                            maxPerWalletToast();
                          } else if (mintSim?.request) {
                            writeMint(mintSim.request);
                          }
                        }}
          isWinner={isWinner}
          rewards={parsedResults?._rewards || '0'}
          onClaimRewards={() => {
            if (!_address) {
              noAddressToast();
            } else if (Number(parsedResults?._rewards || 0) == 0) {
              noRewardsToast();
            } else if (claimSim?.request) {
              writeClaim(claimSim.request);
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
          address={_address || ''}
          gameState={getGameState || ''}
          onStartGame={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Queued") {
                      startToast();
                    } else if (startSim?.request) {
                      writeStartGame(startSim.request);
                    }
                  }}
          onEndMinting={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Minting") {
                      endToast();
                    } else if (endMintSim?.request) {
                      console.log("end minting")
                      writeEndMint(endMintSim.request);
                      console.log("end minting success")
                    }
                  }}
          onPauseGame={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Playing" && getGameState !== "Final Stage" && getGameState !== "Minting") {
                      pauseToast();
                    } else if (pauseSim?.request) {
                      writePause(pauseSim.request);
                    }
                  }}
          onResumeGame={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Paused") {
                      resumeToast();
                    } else if (resumeSim?.request) {
                      writeResume(resumeSim.request);
                    }
                  }}
          onRestartGame={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Ended") {
                      restartToast();
                    } else if (restartSim?.request) {
                      writeRestart(restartSim.request);
                    }
                  }}
        />

          {getGameState === "Playing" && _address && (
          <PassPotatoForm
            darkMode={darkMode}
            tokenId={tokenId}
            setTokenId={setTokenId}
            passPending={passPending}
            onPassPotato={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (additionalData?.hasPotatoToken !== "true") {
                      noPotatoToast();
                    } else if (!parsedResults?.isTokenActive) {
                      notActiveToast();
                    } else if (parsedResults?.ownerOf !== _address) {
                      notOwnerToast();
                    } else if (passSim?.request) {
                      writePass(passSim.request);
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
    </>
  )
}
