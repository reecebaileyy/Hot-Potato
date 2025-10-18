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

const ActiveTokensImages = dynamic(() => import('../components/ActiveTokensImages'), {
  loading: () => <div className="animate-pulse bg-gray-300 h-64 w-full rounded"></div>,
  ssr: false
})

interface PlayProps {
  initalGameState: string | null
  gen: number
  price: number | bigint
  maxSupply: number
}

export default function Play({ initalGameState, gen, price, maxSupply }: PlayProps): React.JSX.Element {
  // --- Provider (WebSocket) ---
  const provider = useMemo(() => new providers.WebSocketProvider(
    process.env.NEXT_PUBLIC_ALCHEMY_URL_WEBSOCKET!
  ), [])

  // --- Custom Hooks ---
  const { getGameState, prevGameState, updateGameState } = useGameState(initalGameState)
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
  } = useContractWrites()
  
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

  // --- Game Events Hook (needs _address) ---
  const { events, setEvents, explosion, remainingTime, setRemainingTime } = useGameEvents(_address, refetchReadResults)
  
  // --- Memoized values ---
  const displayPrice = useMemo(() => ethers.utils.formatEther(BigInt(price || 0)), [price])
  
  // --- Constants ---
  const CONTRACT = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as `0x${string}`
  const CONTRACT_ADDRESS = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as const
  const ADMIN_ADDRESS = "0x41b1e204e9c15fF5894bd47C6Dc3a7Fa98C775C7"

  // -----------------------------Single Reads End---------------------------------

  // Additional contract reads still needed
  const { data: getExplosionTime, isLoading: loadingExplosionTime, error: loadingError, refetch: refetchGetExplosionTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getExplosionTime',
  })
  const explosionTime = useMemo(() => 
    getExplosionTime ? parseInt(getExplosionTime as unknown as string, 10) : 0,
    [getExplosionTime]
  );

  const { data: hallOfFame, isLoading: loadingHGallOfFame, refetch: refetchHallOfFame } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hallOfFame',
    args: [parsedResults?._currentGeneration || 0],
  })
  const roundWinner = useMemo(() => hallOfFame?.toString(), [hallOfFame]);

  const { data: userHasPotatoToken, isLoading: loadingHasPotato, refetch: refetchUserHasPotatoToken } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [_address],
    query: { enabled: !!_address },
  })
  const hasPotatoToken = useMemo(() => userHasPotatoToken?.toString(), [userHasPotatoToken]);

  const { data: getActiveTokenIds = [], isLoading: loadingActiveTokenIds, refetch: refetchGetActiveTokenIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getActiveTokenIds',
  })

  const { data: _successfulPasses, isLoading: loadingSuccessfulPasses, refetch: refetchSuccessfulPasses } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'successfulPasses',
    args: [_address],
    query: { enabled: !!_address },
  })
  const successfulPasses = useMemo(() => 
    _successfulPasses ? parseInt(_successfulPasses as unknown as string, 10) : 0,
    [_successfulPasses]
  );

  const { data: getActiveTokenCount, isLoading: loadingActiveTokenCount, refetch: refetchGetActiveTokenCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'addressActiveTokenCount',
    args: [_address],
    query: { enabled: !!_address },
  })
  const activeTokensCount = useMemo(() => 
    getActiveTokenCount ? parseInt(getActiveTokenCount as unknown as string, 10) : 0,
    [getActiveTokenCount]
  );

  const { data: bal, isLoading: balanceLoading, isError } = useBalance({
    address: _address as `0x${string}`,
    chainId: 84532,
  })

  const value = bal?.value ?? 0n
  const balance = formatUnits(value, bal?.decimals ?? 18)

  const { data: winnerEnsName, isError: errorWinnerEnsName, isLoading: loadingWinnerEnsName } = useEnsName({
    address: roundWinner as `0x${string}`,
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
  const isLoading = loadingReadResults || loadingExplosionTime || loadingHGallOfFame || loadingHasPotato || loadingSuccessfulPasses || loadingActiveTokenCount || loadingActiveTokenIds || balanceLoading
  

  // --- Optimized effects ---
  useEffect(() => {
    if (parsedResults?._potato_token) {
      setPotatoTokenId(parsedResults._potato_token);
    }
    if (explosionTime) {
      setRemainingTime(explosionTime);
    }
  }, [parsedResults?._potato_token, explosionTime]);

  useEffect(() => {
    const ids = (getActiveTokenIds as unknown as (string | number | bigint)[] | undefined) ?? [];
    const activeIds = ids.slice(1).map((tokenId) => Number(tokenId));
    setActiveTokens(activeIds);
    setIsLoadingActiveTokens(false);
  }, [getActiveTokenIds]);

  useEffect(() => {
    setSortedTokens(activeTokens);
  }, [activeTokens]);

  useEffect(() => {
    if (roundWinner === undefined || roundWinner === null) {
      refetchHallOfFame();
    }
  }, [roundWinner, refetchHallOfFame]);

  useEffect(() => {
    console.log("An UNKNOWN X BEDTIME PRODUCTION")
  }, []);

  // Log contract read errors
  useEffect(() => {
    if (readError) {
      console.error('Contract read error:', readError)
      toast.error('Failed to load game data. Please try again.')
    }
  }, [readError]);

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
          {gen === 1 ? "Round 1" : `Round ${gen}`}
        </h1>

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
                          } else if (activeTokensCount >= (parsedResults?.maxPerWallet ?? 0)) {
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
          loadingActiveTokenIds={loadingActiveTokenIds}
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
                    } else if (hasPotatoToken !== "true") {
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
          successfulPasses={successfulPasses}
          activeTokensCount={activeTokensCount}
          rewards={parsedResults?._rewards || '0'}
        />
      </div>
    </>
  )
}
