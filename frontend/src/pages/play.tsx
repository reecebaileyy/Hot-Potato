'use client'
import React from 'react'
import Head from 'next/head'

import { useState, useEffect, useRef } from 'react'
import { Abi, formatUnits, parseEther, parseEventLogs } from 'viem'
import { useAccount, useWatchContractEvent, useReadContract, UseReadContractsReturnType, useReadContracts, useBalance, useSimulateContract, useWriteContract, useEnsName } from 'wagmi'
import ABI from '../abi/Game.json'
import { toast, ToastContainer } from 'react-toastify'
import Image from 'next/image'
import Link from 'next/link'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { HiArrowCircleUp, HiArrowCircleDown } from 'react-icons/hi'
import { ethers, providers } from 'ethers'
import { createDeferredPromise, type DeferredPromise } from './helpers/deferredPromise'
import { safeParseEventLogs } from './helpers/viemUtils'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TokenImage from '../components/TokenImage'
import ActiveTokensImages from '../components/ActiveTokensImages'
import hot from '../../public/assets/images/hot.png'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import Explosion from '../../public/assets/images/Explosion.gif'
import Burning from '../../public/assets/images/Burning.gif'
import blacklogo from '../../public/assets/images/Logo.png'
import { AbiCoder } from 'ethers/lib/utils'
import { parse } from 'path'
import { write } from 'fs'

interface PlayProps {
  initalGameState: string | null
  gen: number
  price: number | bigint
  maxSupply: number
}



export default function Play({ initalGameState, gen, price, maxSupply }: PlayProps): React.JSX.Element {
  // --- Provider (WebSocket) ---
  const provider = new providers.WebSocketProvider(
    process.env.NEXT_PUBLIC_ALCHEMY_URL_WEBSOCKET!
  )

  // --- Wallet / Account ---
  const displayPrice = ethers.utils.formatEther(BigInt(price || 0))
  const [_address, setAddress] = useState<string>('')
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      setAddress(address)
      console.log(`${_address} address`)
    }
  }, [address])


  // --- State Hooks ---
  const CONTRACT = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as `0x${string}`
  const ADMIN_ADDRESS = "0x41b1e204e9c15fF5894bd47C6Dc3a7Fa98C775C7"
  const CONTRACT_ADDRESS = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as const
  const [mintAmount, setMintAmount] = useState<string>('')
  const [getGameState, setGetGameState] = useState<string | null>(initalGameState)
  const [prevGameState, setPrevGameState] = useState<string | null>(initalGameState)
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [events, setEvents] = useState<string[]>([])
  const [tokenId, setTokenId] = useState<string>('')
  const [totalCost, setTotalCost] = useState<number>(0)
  const [passPromise, setPassPromise] = useState<DeferredPromise<void> | null>(null)
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(false)
  const [activeTokens, setActiveTokens] = useState<number[]>([])
  const [explodedTokens, setExplodedTokens] = useState<number[]>([])
  const [explosion, setExplosion] = useState<boolean>(false)
  const [isLoadingActiveTokens, setIsLoadingActiveTokens] = useState<boolean>(true)
  const [_potatoTokenId, setPotatoTokenId] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [_roundMints, setRoundMints] = useState<number>(0)
  const [passArgs, setPassArgs] = useState<unknown[] | null>(null)
  const [mintArgs, setMintArgs] = useState<unknown[] | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(64)
  const [sortedTokens, setSortedTokens] = useState<number[]>([])
  const menuRef = useRef<HTMLUListElement | null>(null)
  const divRef = useRef<HTMLDivElement | null>(null)
  const endOfDiv = useRef<HTMLDivElement | null>(null)
  const [searchId, setSearchId] = useState<string>('')


  // --- Pagination logic ---
  const indexOfLastToken = currentPage * itemsPerPage
  const indexOfFirstToken = indexOfLastToken - itemsPerPage
  const currentTokens = sortedTokens?.slice(indexOfFirstToken, indexOfLastToken)
  const pageCount = Math.ceil(sortedTokens.length / itemsPerPage)
  const maxPageNumbersToShow = 3

  let startPage = Math.max(currentPage - Math.floor(maxPageNumbersToShow / 2), 1)
  let endPage = Math.min(startPage + maxPageNumbersToShow - 1, pageCount)

  if (endPage - startPage < maxPageNumbersToShow && startPage > 1) {
    startPage = endPage - maxPageNumbersToShow + 1
  }

  const pages = [...Array(endPage + 1 - startPage).keys()].map((i) => startPage + i)


  // Game State Events

  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'GameStarted',
    onLogs: async (logs) => {
      setRoundMints(0)
      setGetGameState('Minting')
      setPrevGameState('Queued')
      setEvents((prev) => [...prev, 'Heating up'])
    },
  })

  // MintingEnded
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'MintingEnded',
    onLogs: async () => {
      setRemainingTime(explosionTime)
      setGetGameState('Playing')
      setPrevGameState('Minting')
      setEvents((prev) => [...prev, 'No more mints'])
    },
  })

  // GameResumed
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'GameResumed',
    onLogs: async () => {
      const prevState = prevGameState
      setGetGameState(prevState)
      const gameState = getGameState
      setPrevGameState(gameState)
      setEvents((prev) => [...prev, 'Back to it'])
    },
  })

  // GamePaused
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'GamePaused',
    onLogs: async () => {
      const gameState = getGameState
      setPrevGameState(gameState)
      setGetGameState('Paused')
      setEvents((prev) => [...prev, 'Cooling off'])
    },
  })

  // GameRestarted
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'GameRestarted',
    onLogs: async () => {
      setPrevGameState((prev) => prev)
      setGetGameState('Queued')
      setRoundMints(0)
      setEvents((prev) => [...prev, 'Game Over'])
    },
  })

  // FinalRoundStarted
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'FinalRoundStarted',
    onLogs: async () => {
      setEvents((prev) => [...prev, '2 PLAYERS LEFT'])
    },
  })


  // Player Stats

  // PlayerWon
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'PlayerWon',
    onLogs: async (logs) => {
      try {
        // 👇 Decode the logs safely
        const decoded = safeParseEventLogs<{ player: `0x${string}` }>(ABI, 'PlayerWon', logs)
        const player = decoded[0]?.args?.player
        if (!player) return

        console.log('PlayerWon', player)

        // Update leaderboard or UI
        await refetchHallOfFame()
        setEvents((prev) => [...prev, `${player} won! 🎉`])

        // Show special logic if the winner is the connected user
        if (player === _address) {
          toast.success("You won! 🎉 Don't forget to claim your rewards!")
        }
      } catch (error) {
        console.error('Error updating wins:', error)
      }
    },
  })


  // SuccessfulPass
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'SuccessfulPass',
    onLogs: async (logs) => {
      try {
        const decoded = safeParseEventLogs<{ player: `0x${string}` }>(ABI, 'SuccessfulPass', logs)
        const player = decoded[0]?.args?.player
        if (!player) return

        console.log('SuccessfulPass', player)
        const myPromise = new Promise<void>((resolve) => {
          resolve();
        });

        const deferred = createDeferredPromise<void>()
        if (_address === player) {
          setPassPromise(deferred)
          passPromise?.resolve?.()
        } else {
          passPromise?.reject?.(new Error('Passing failed'))
        }
      } catch (error) {
        console.error('Error updating successful passes', error)
      }
    },
  })


  // PotatoMinted
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'PotatoMinted',
    onLogs: async (logs) => {
      try {
        const decoded = safeParseEventLogs<{ player: `0x${string}`; amount: bigint }>(ABI, 'PotatoMinted', logs)
        const player = decoded[0]?.args?.player
        const amount = Number(decoded[0]?.args?.amount ?? 0)
        if (!player) return

        console.log(`_address: ${_address} player: ${player} amount: ${amount}`)

        if (_address === player) {
          console.log(`Player ${player} minted ${amount} tokens`)
        }
        setShouldRefresh((prev) => !prev)
        setRoundMints(totalMints)
        setEvents((prev) => [...prev, `${player} just minted ${amount} hands`])
      } catch (error) {
        console.error('Error updating mints', error)
      }
    },
  })


  // --- NewRound ---
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'NewRound',
    onLogs: async (logs) => {
      try {
        const decoded = safeParseEventLogs<{ round: bigint }>(ABI, 'NewRound', logs)
        const round = Number(decoded[0]?.args?.round ?? 0)
        console.log('NewRound', round)
        setShouldRefresh((prev) => !prev)
      } catch (error) {
        console.error('Error updating new round data', error)
      }
    },
    onError(error) {
      console.error('NewRound event error:', error)
    },
  })


  // --- UpdatedTimer ---
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'UpdatedTimer',
    onLogs: (logs) => {
      const decoded = safeParseEventLogs<{ time: bigint }>(ABI, 'UpdatedTimer', logs)
      const time = decoded[0]?.args?.time?.toString()
      console.log('UpdatedTimer', time)

      if (time) {
        setRemainingTime(parseInt(time, 10))
        setEvents((prev) => [...prev, `${time} seconds till explosion`])
      }
    },
    onError(error) {
      console.error('UpdatedTimer event error:', error)
    },
  })


  // --- PotatoExploded ---
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'PotatoExploded',
    onLogs: async (logs) => {
      try {
        const decoded = safeParseEventLogs<{ player: `0x${string}`; tokenId: bigint }>(ABI, 'PotatoExploded', logs)
        const player = decoded[0]?.args?.player
        const tokenId_ = decoded[0]?.args?.tokenId?.toString()
        console.log('PotatoExploded', player, tokenId_)
        setExplosion(true)
        setTimeout(() => setExplosion(false), 3050)
        console.log('Refetched all data after explosion.')
        setEvents((prev) => [...prev, `Token #${tokenId_} just exploded`])
      } catch (error) {
        console.error('Error handling PotatoExploded event', error)
      }
    },
    onError(error) {
      console.error('PotatoExploded event error:', error)
    },
  })


  // --- PotatoPassed ---
  useWatchContractEvent({
    address: CONTRACT,
    abi: ABI,
    eventName: 'PotatoPassed',
    onLogs: async (logs) => {
      try {
        const decoded = safeParseEventLogs<{ tokenIdTo: bigint }>(ABI, 'PotatoPassed', logs)
        const tokenIdTo = decoded[0]?.args?.tokenIdTo?.toString()
        if (!tokenIdTo) return

        console.log('PotatoPassed', tokenIdTo)

        setEvents((prev) => [...prev, `Potato Passed to #${tokenIdTo}`])
        setShouldRefresh((prev) => !prev)
      } catch (error) {
        console.error('Error handling PotatoPassed event', error)
      }
    },
    onError(error) {
      console.error('PotatoPassed event error:', error)
    },
  })



  //Read Hooks
  // // GET MINT PRICE
  // const { data: getGameState, refetch: refetchGameState, isLoading: loadingGetGameState } = useReadContract({
  //   address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
  //   abi: ABI,
  //   functionName: 'getGameState',
  //   enabled: true,
  // })
  // GET NUMBER OF MAX MINTS DURING THE ROUND
  // const { data: _maxsupply, isLoading: loadingMaxSupply, refetch: refetchMaxSupply } = useReadContract({
  //   address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
  //   abi: ABI,
  //   functionName: '_maxsupplyPerRound',
  // })
  // const maxSupply = parseInt(_maxsupply, 10);
  // const { data: userHasPotatoToken, isLoading: loadingHasPotato, refetch: refetchUserHasPotatoToken } = useReadContract({
  //   address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
  //   abi: ABI,
  //   functionName: 'userHasPotatoToken',
  //   args: [_address],
  // })


  const gameContract = {
    address: CONTRACT_ADDRESS,
    abi: ABI,
  } as const

  const { data: readResults, isLoading: loadingReadResults, refetch: refetchReadResults } = useReadContracts({
    contracts: [
      {
        ...gameContract,
        abi: ABI,
        functionName: '_price',
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: 'potatoTokenId',
      },
      {
        ...gameContract,
        address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
        abi: ABI,
        functionName: 'currentGeneration',
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: 'roundMints',
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: '_owner',
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: 'getAllWinners',
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: 'rewards',
        args: [_address]
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: 'totalWins',
        args: [_address]
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: '_maxperwallet',
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: '_isTokenActive',
        args: [tokenId]
      },
      {
        ...gameContract,
        abi: ABI,
        functionName: 'ownerOf',
        args: [tokenId]
      }
    ]
  })

  const _price = readResults?.[0] ? formatUnits(readResults?.[0] as unknown as bigint, 18) : '0';
  const _potato_token = readResults?.[1] ? parseInt(readResults?.[1] as unknown as string, 10) : 0;
  const _currentGeneration = readResults?.[2] ? parseInt(readResults?.[2] as unknown as string, 10) : 0;
  const totalMints = readResults?.[3] ? parseInt(readResults?.[3] as unknown as string, 10) : 0;
  const _ownerAddress = readResults?.[4]?.toString();
  const allWinners = readResults?.[5] as `0x${string}`[] | undefined
  const isWinner = allWinners?.includes(_address as `0x${string}`)
  const _rewards = readResults?.[6] ? formatUnits(readResults?.[6] as unknown as bigint, 18) : '0';
  const totalWins = readResults?.[7] ? parseInt(readResults?.[7] as unknown as string, 10) : 0;
  const maxPerWallet = readResults?.[8] ? parseInt(readResults?.[8] as unknown as string, 10) : 0;
  const isTokenActive = readResults?.[9] as unknown as boolean;
  const ownerOf = readResults?.[10]?.toString();

  // -----------------------------Single Reads Start--------------------------------
  const { data: getExplosionTime, isLoading: loadingExplosionTime, error: loadingError, refetch: refetchGetExplosionTime } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'getExplosionTime',
  })
  const explosionTime = getExplosionTime ? parseInt(getExplosionTime as unknown as string, 10) : 0;

  const { data: hallOfFame, isLoading: loadingHGallOfFame, refetch: refetchHallOfFame } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'hallOfFame',
    args: [_currentGeneration],
  })
  const roundWinner = hallOfFame?.toString();

  const { data: userHasPotatoToken, isLoading: loadingHasPotato, refetch: refetchUserHasPotatoToken } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [_address],
  })
  const hasPotatoToken = userHasPotatoToken?.toString();

  const { data: getPotatoOwner, isLoading: loadingPotatoOwner, refetch: refetchGetPotatoOwner } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'getPotatoOwner',
  })
  const _potatoOwner = getPotatoOwner?.toString();

  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'getActiveTokens',
  })
  const _activeTokens = getActiveTokens as unknown as number[];

  const { data: _activeAddresses, isLoading: loadingActiveAddresses, refetch: refetchActiveAddresses } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'activeAddresses',
  })
  const activeAddresses = _activeAddresses as unknown as `0x${string}`[];

  const { data: _successfulPasses, isLoading: loadingSuccessfulPasses, refetch: refetchSuccessfulPasses } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'successfulPasses',
    args: [_address],
  })
  const successfulPasses = _successfulPasses ? parseInt(_successfulPasses as unknown as string, 10) : 0;

    const { data: getActiveTokenCount, isLoading: loadingActiveTokenCount, refetch: refetchGetActiveTokenCount } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'addressActiveTokenCount',
    args: [_address],
  })
  const activeTokensCount = getActiveTokenCount ? parseInt(getActiveTokenCount as unknown as string, 10) : 0;

    const { data: getActiveTokenIds = [], isLoading: loadingActiveTokenIds, refetch: refetchGetActiveTokenIds } = useReadContract({
    address: '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704',
    abi: ABI,
    functionName: 'getActiveTokenIds',
  })

  // -----------------------------Single Reads End---------------------------------


  const { data: bal, isLoading, isError } = useBalance({
    address: _address as `0x${string}`,
    chainId: 84532,
  })

  const value = bal?.value ?? 0n
  const balance = formatUnits(value, bal?.decimals ?? 18)


  const { data: winnerEnsName, isError: errorWinnerEnsName, isLoading: loadingWinnerEnsName } = useEnsName({
    address: roundWinner as `0x${string}`,
  })


  // Write Hooks

  // MINT HAND
  const {
    data: mintSim,
    isError: mintSimError,
    error: mintError,
  } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'mintHand',
    args: [BigInt(mintAmount)], // ensure numeric args
    value: parseEther(totalCost.toString())
  })

  // Write mutation for mint
  const { writeContract: writeMint, isPending: mintPending } = useWriteContract()



  // Simulate passPotato
  const {
    data: passSim,
    isError: passSimError,
    error: passError,
  } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'passPotato',
    args: [BigInt(tokenId)]
  })

  // Write mutation for passPotato
  const { writeContract: writePass, isPending: passPending } = useWriteContract()

  const { data: claimSim, error: claimError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'withdrawWinnersFunds'
  })

  const { writeContract: writeClaim } = useWriteContract()

  const { data: explosionSim, error: explosionError } = useSimulateContract({
    abi: ABI,
    address: "0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704",
    functionName: 'checkExplosion'
  })

  const { writeContract: writeCheck } = useWriteContract()


  // OWNER HOOKS

  // Simulate startGame
  const { data: startSim, error: startError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'startGame'
  })

  // Write
  const { writeContract: writeStartGame, isPending: starting } = useWriteContract()

  /// Simulate endMinting
  const { data: endMintSim, error: endMintError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'endMinting'
  })

  const { writeContract: writeEndMint, isPending: ending } = useWriteContract()

  const { data: pauseSim, error: pauseError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'pauseGame'
  })

  const { writeContract: writePause, isPending: pausing } = useWriteContract()

  const { data: resumeSim, error: resumeError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'resumeGame'
  })

  const { writeContract: writeResume, isPending: resuming } = useWriteContract()

  const { data: restartSim, error: restartError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'restartGame'
  })

  const { writeContract: writeRestart, isPending: restarting } = useWriteContract()

  // Toast

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

  function onlyNumbersToast() {
    toast.info("Only Numbers Allowed")
  }

  function cannotPassToast() {
    toast.error("The Game Has not started yet")
  }

  function ownThePotatoToast() {
    toast.error("You have to own the Potato to pass it")
  }

  function noEnoughFundsToast() {
    toast.error("You do not have enough funds to mint")
  }

  function cannotPassToSelfToast() {
    toast.error("You cannot pass the Potato to yourself")
  }

  function gameFullToast() {
    toast.error("The Round is already Full")
  }

  function tokenInactiveToast() {
    toast.error("The token you tried to pass to is inactive")
  }

  function maxPerWalletToast() {
    toast.error(`You can only mint xxx Hands per round`);
  }

  function mintOneToast() {
    toast.info("Mint at least 1 to play");
  }

  function hasMoreTimeToast() {
    toast.warn("There is still time left to pass the Potato");
  }

  function noRewardsToast() {
    toast.warn("You have no rewards to claim");
  }

  function invalidTokenIdToast() {
    toast.error("Inactive Token ID");
  }


  // --- Handlers (TypeScript version) ---

  const refreshAllImages = (): void => {
    setShouldRefresh((prevState) => !prevState)
  }

  const handleInputChangeToken = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/[^0-9]/g, '')

    if (numericValue !== inputValue) {
      onlyNumbersToast()
    } else if (inputValue === '') {
      setTokenId('')
    } else {
      const _tokenId = parseInt(inputValue)
      if (!isNaN(_tokenId)) setTokenId(_tokenId.toString())
    }
  }

  const handleInputChangeMint = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/[^0-9]/g, '')

    if (numericValue !== inputValue) {
      onlyNumbersToast()
    } else if (inputValue === '') {
      setMintAmount('')
      setTotalCost(0)
    } else {
      const newMintAmount = numericValue // keep as string for UI
      setMintAmount(newMintAmount)

      try {
        const totalCostBigInt =
          BigInt((_price) ?? 0n) * BigInt(newMintAmount || '0') * BigInt(newMintAmount || '0')
        setTotalCost(Number(totalCostBigInt))
      } catch {
        setTotalCost(0)
      }
    }
  }

  const handleTokenExploded = (tokenId: number): void => {
    setExplodedTokens((prevTokens) => [...prevTokens, tokenId])
  }

  const sortTokensAsc = (): void => {
    const sorted = [...activeTokens].sort((a, b) => a - b)
    setSortedTokens(sorted)
  }

  const sortTokensDesc = (): void => {
    const sorted = [...activeTokens].sort((a, b) => b - a)
    setSortedTokens(sorted)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const idNum = Number(searchId)
    const tokenIdIndex = sortedTokens.indexOf(idNum)
    if (tokenIdIndex !== -1) {
      setCurrentPage(Math.floor(tokenIdIndex / itemsPerPage) + 1)
    } else {
      invalidTokenIdToast()
    }
  }



  // Refresh

  //On Mount
  useEffect(() => {
    const fetchData = async () => {
      setPotatoTokenId(_potato_token);
    }
    fetchData();
    // refetchGetExplosionTime();
    setRemainingTime(explosionTime);
  }, []);


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
    if (roundWinner === undefined) {
      refetchHallOfFame();
    }
    if (roundWinner === null) {
      refetchHallOfFame();
    }
  }, [roundWinner, refetchHallOfFame]);

  useEffect(() => {

  }, [_address]);



  useEffect(() => {
    console.log("An UNKNOWN X BEDTIME PRODUCTION")
  }, []);

  // useEffect(() => {
  //   try {
  //     if (refetchGetExplosionTime) {
  //       refetchGetExplosionTime();
  //       setRemainingTime(explosionTime);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching explosion time:", error);
  //   }
  // }, [getExplosionTime]);


  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (remainingTime && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime && prevTime > 0) {
            const newTime = prevTime - 1;
            return newTime;
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


  useEffect(() => {
    if (endOfDiv.current) {
      endOfDiv.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, [events]);

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
        <nav className="pt-10 px-5 md:px-10 flex justify-between items-center relative">
          <Link href='/'>
            <Image src={blacklogo} width={150} alt="Logo" />
          </Link>
          <div className="xl:hidden 2xl:hidden 3xl:hidden z-50">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
              onClick={(e) => {
                if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`${darkMode ? 'bg-gray-700 text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl' : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'}`}>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/play">Play</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/leaderboard">Leaderboard</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  size={30}
                />
                <ConnectWalletButton className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden lg:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='flex gap-2 items-center sm:hidden lg:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <ConnectWalletButton className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>

        <h1 className={`${darkMode ? 'text-4xl md:w-2/3 lg:w-1/2 col-start-2 col-span-6 w-full text-center mx-auto' : 'text-4xl md:w-2/3 lg:w-1/2 col-start-2 col-span-6 w-full text-center mx-auto'}`}>
          {gen === 1 ? "Round 1" : `Round ${gen}`}
        </h1>

        <div className="p-4 sm:flex sm:flex-col md:flex md:flex-col lg:flex lg:flex-col grid grid-cols-8 gap-4 justify-center items-center">
          <div className={`w-full flex flex-col items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 overflow-y-auto hide-scrollbar ${getGameState !== "Paused" && getGameState !== "Queued" && address ? "max-h-96" : ""} ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {!_address ?
              <>
                <>
                  <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Connect First</h1>
                  <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Connect your wallet to view this page! Hope you join the fun soon...</h3>
                  <Image alt='Image' src={hot} width={200} height={200} />
                </>
              </> :
              getGameState == "Playing" || getGameState == "Final Stage" ?
                <>
                  {isWinner && Number(_rewards) != 0 &&
                    <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                      onClick={() => {
                        if (!_address) {
                          noAddressToast();
                        } else if (Number(_rewards) == 0) {
                          noRewardsToast();
                        } else if (claimSim?.request) {
                          writeClaim(claimSim.request);
                        }
                      }}
                    >Claim Rewards</button>
                  }
                  <h2 className={`text-2xl font-bold underline mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>My Heat Handlers:</h2>
                  <ActiveTokensImages
                    ownerAddress={_address as `0x${string}`}
                    ABI={ABI}
                    tokenId={Number(tokenId)}
                    shouldRefresh={shouldRefresh}
                  />

                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={hot} width={200} height={200} className='self-center' />
                    {isWinner && Number(_rewards) != 0 &&
                      <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                        onClick={() => {
                          if (!_address) {
                            noAddressToast();
                          } else if (Number(_rewards) == 0) {
                            noRewardsToast();
                          } else if (claimSim?.request) {
                            writeClaim(claimSim.request);
                          }
                        }}
                      >Claim Rewards</button>
                    }
                  </>
                  : getGameState == "Paused" ?
                    <>
                      <Image alt='Image' src={hot} width={200} height={200} />
                      {isWinner && Number(_rewards) != 0 &&
                        <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                          onClick={() => {
                            if (!_address) {
                              noAddressToast();
                            } else if (Number(_rewards) == 0) {
                              noRewardsToast();
                            } else if (claimSim?.request) {
                              writeClaim(claimSim.request);
                            }
                          }}
                        >Claim Rewards</button>
                      }
                    </>
                    : getGameState == "Minting" ?
                      <>
                        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>My Heat Handlers:</h1>
                        <ActiveTokensImages
                          ownerAddress={_address as `0x${string}`}
                          ABI={ABI}
                          tokenId={Number(tokenId)}
                          shouldRefresh={shouldRefresh}
                        />

                        {isWinner && Number(_rewards) != 0 &&
                          <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                            onClick={() => {
                              if (!_address) {
                                noAddressToast();
                              } else if (Number(_rewards) == 0) {
                                noRewardsToast();
                              } else if (claimSim?.request) {
                                writeClaim(claimSim.request);
                              }
                            }}
                          >Claim Rewards</button>
                        }
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={Burning} width={200} height={200} />
                        {isWinner && Number(_rewards) != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                            onClick={() => {
                              if (!_address) {
                                noAddressToast();
                              } else if (Number(_rewards) == 0) {
                                noRewardsToast();
                              } else if (claimSim?.request) {
                                console.log('claiming rewards', _rewards, Number(_rewards));
                                writeClaim(claimSim.request);
                              }
                            }}
                          >Claim Rewards</button>
                        }
                      </>
            }
          </div>

          <div className={`w-full flex flex-col justify-center items-center col-start-3 col-span-4 md:w-2/3 lg:w-1/2 shadow-lg rounded-xl p-6 mb-8 transition-transform duration-500 ease-in-out transform hover:scale-105 z-30 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {!getGameState ? <h1 className="text-4xl font-extrabold underline text-center mb-4">Loading...</h1> : null}
            {getGameState == "Playing" || getGameState == "Final Stage" ?
              <>
                <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>
                  {!_potato_token ? `Loading...` : `Token #${_potato_token} has the potato`}
                </h1>
                {loadingHasPotato ? (
                  <h2 className="text-center font-bold mb-2">Loading Has Potato...</h2>
                ) : (
                  <h2 className={`text-3xl sm:text-xl md:text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {hasPotatoToken ? <p className='animate-crazy text-center'>YOU HAVE THE POTATO</p> : <p className='text-center'>YOU DON&apos;T HAVE THE POTATO</p>}
                  </h2>
                )}
                {explosion ?
                  <Image className='rounded-full' alt='Explosion' src={Explosion} width={200} height={200} /> :
                  <Image alt='Image' src={potatoBlink} width={200} height={200} />
                }
                {remainingTime == 0 ? <p className='text-2xl'>TIME REMAINING: 0</p> : !remainingTime ? <p className='text-2xl'>Loading...</p> : <p className='text-2xl'>TIME REMAINING: {remainingTime}</p>}
                <button className={`mt-4 w-1/2 mb-2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500'} text-white px-4 py-3 rounded-lg shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110`}
                  onClick={() => {
                    refetchGetExplosionTime();
                    if (!_address) {
                      noAddressToast();
                    } else if (explosionSim?.request) {
                      writeCheck(explosionSim.request);
                      console.log("CHECKED EXPLOSION");
                    }
                  }}>
                  CHECK EXPLOSION
                </button>
                <div className='sm:hidden md:hidden flex flex-col-2 gap-6'>
                  {loadingActiveAddresses ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{activeAddresses} Players Remaining</p>)
                  }{loadingActiveTokens ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Hands Remaining</p>)
                  }
                </div>
                <div className='lg:hidden xl:hidden 2xl:hidden 3xl:hidden'>
                  {loadingActiveAddresses ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{activeAddresses} Players Remaining</p>)
                  }{loadingActiveTokens ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Hands Remaining</p>)
                  }
                </div>

                <Link href="https://mumbai.polygonscan.com/address/0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704" target='_blank' className="underline">
                  Smart Contract
                </Link>
              </>
              : getGameState == "Queued" ? (
                <>
                  <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game starting soon</h1>
                  <h3 className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>The game is currently Queued, Come back soon for some sizzlin fun!</h3>
                  <Image alt='Image' src={potatoBlink} width={200} height={200} />
                  <div className='grid grid-cols-3 justify-center gap-4'>
                    <Link href="https://discord.com/" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>
                      Discord
                    </Link>
                    <Link href="https://mumbai.polygonscan.com/address/0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>Smart Contract</Link>
                    <Link className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`} target='_blank' href="https://Twitter.com/ocHotPotato">Twitter</Link>
                  </div>
                </>
              ) :
                getGameState == "Paused" ? (
                  <>
                    <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Paused</h1>
                    <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>The game is currently paused. Please wait for further updates.</h3>
                    <Image alt='Image' src={potatoBlink} width={200} height={200} />
                    {loadingActiveTokens ? (
                      <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                    ) : (
                      <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Active Tokens Remaing</p>)
                    }
                    <div className='grid grid-cols-3 justify-center gap-4'>
                      <Link href="https://discord.com/" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>
                        Discord
                      </Link>
                      <Link href="https://mumbai.polygonscan.com/address/0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>Smart Contract</Link>
                      <Link className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`} target='_blank' href="https://Twitter.com/ocHotPotato">Twitter</Link>
                    </div>
                  </>
                ) :
                  getGameState == "Ended" ? (
                    <>
                      <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Ended</h1>
                      <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Thank you for participating. See you in the next game!</h3>
                      <Image alt='Image' src={potatoBlink} width={200} height={200} />
                      <h2 className={`text-xl text-center ${darkMode ? 'text-white' : 'text-black'}`}>And congratulations to our Winner:</h2>
                      {loadingHGallOfFame ? (
                        <h1
                          className={`text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text animate-pulse ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}
                        >
                          Loading...
                        </h1>) : (
                        <Link
                          href={`https://mumbai.polygonscan.com/address/${roundWinner}`}
                          target='_blank'
                          className={`text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text animate-pulse ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}
                        >
                          {loadingWinnerEnsName ? (
                            <span>Loading...</span>
                          ) : errorWinnerEnsName ? (
                            <span>{roundWinner}</span>
                          ) : (
                            <span>{winnerEnsName}</span>
                          )
                          }
                        </Link>
                      )
                      }
                    </>
                  ) :
                    getGameState == "Minting" && (
                      <>

                        <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>PRICE: <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>{displayPrice}</span> ETH</p>
                        <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>MAX PER WALLET: <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>{maxPerWallet}</span></p>

                        {_address ?
                          <>
                            <input className="mt-4 w-3/4 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                              type="text"
                              value={mintAmount}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={handleInputChangeMint}
                              placeholder="Enter mint amount" />
                            <button className={`mt-4 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110`}
                              onClick={() => {
                                if (!_address) {
                                  noAddressToast();
                                  // } else if (balance < totalCost) {
                                  //   noEnoughFundsToast();
                                  // } else if (mintAmount > (maxSupply - _roundMints)) {
                                  //   gameFullToast();
                                  // } else if (mintAmount === 0) {
                                  //   mintOneToast();
                                  // }
                                  // else if (activeTokensCount + parseInt(mintAmount) > maxPerWallet) {
                                  //   maxPerWalletToast();
                                }
                                else if (mintSim?.request) {
                                  writeMint(mintSim.request);
                                }
                              }}
                            >Join Round!</button>
                            <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{totalMints}/{maxSupply} MINTED</p>
                          </>
                          :
                          <>
                            <p className={`text-3xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{totalMints}/{maxSupply} MINTED</p>
                            <p className={`text-2xl md:text-xl lg:text-3xl text-center font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                              Connect first to join the fun!
                            </p>
                          </>
                        }
                        <div className='grid grid-cols-3 justify-center gap-4'>
                          <Link href="https://discord.com/" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>
                            Discord
                          </Link>
                          <Link href="https://mumbai.polygonscan.com/address/0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>Smart Contract</Link>
                          <Link className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`} target='_blank' href="https://Twitter.com/ocHotPotato">Twitter</Link>
                        </div>
                      </>

                    )}
            {/* Content when address does not exist */}
          </div>

          <div className={`w-full flex flex-col justify-center items-center p-4 mb-8 col-end-9 col-span-2  md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-xl`}>
            {!_address ?
              <>
                <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Connect First</h1>
                <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>You must connect your wallet to view this page! Hope you join the fun soon...</h3>
                <Image alt='Image' src={hot} width={200} height={200} />
              </> :
              getGameState == "Playing" || getGameState == "Final Stage" ?
                <>
                  <h1 className={`text-xl font-bold mb-2 underline ${darkMode ? 'text-white' : 'text-black'}`}>Game Stats:</h1>
                  <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Successful Passes: {loadingSuccessfulPasses ? "Loading..." : successfulPasses}
                  </p>
                  <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Total Wins: {totalWins}
                  </p>
                  {loadingActiveTokenCount ? (
                    <h2 className="text-center font-bold mb-2">Loading Active Token(s)...</h2>
                  ) : isNaN(activeTokensCount) || activeTokensCount === 0 ? (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Active Token(s): 0</h2>
                  ) : (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Active Token(s): {activeTokensCount}</h2>
                  )}
                  <div className="grid grid-rows-2 place-items-center justify-center items center">
                    <input className="mt-4 w-1/2  bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                      type="text"
                      value={tokenId}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={handleInputChangeToken}
                      placeholder="tokenId" />
                    <button className={`mt-4 w-full ${darkMode ? 'bg-gray-800 hover:hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
                      onClick={() => {
                        setPassArgs([tokenId]); // Set the args when the button is pressed
                        console.log("passing")
                        console.log("passing from", _address)
                        console.log("Potato Owner is ", getPotatoOwner)
                        refetchGetPotatoOwner();
                        if (!_address) {
                          noAddressToast();
                        } else if (getGameState !== "Playing" && getGameState !== "Final Stage") {
                          cannotPassToast();
                        } else if (!hasPotatoToken) {
                          ownThePotatoToast();
                        } else if (!isTokenActive) {
                          tokenInactiveToast();
                        } else if (_address == ownerOf) {
                          cannotPassToSelfToast();
                        } else if (passSim?.request) {
                          writePass(passSim.request);
                        }
                      }}
                    >Pass Potato</button>
                  </div>
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={hot} width={200} height={200} className='self-center' />
                    {isWinner && Number(_rewards) != 0 &&
                      <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                        onClick={() => {
                          if (!_address) {
                            noAddressToast();
                          } else if (Number(_rewards) == 0) {
                            noRewardsToast();
                          } else if (claimSim?.request) {
                            writeClaim(claimSim.request);
                          }
                        }}>Claim Rewards</button>
                    }
                  </>
                  : getGameState == "Minting" ?
                    <>
                      <h1 className={`text-3xl text-center font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Welcome to the Backburner!</h1>
                      <Image alt='Image' src={potatoBlink} width={200} height={200} />
                      <h3 className={`text-xl text-center ${darkMode ? 'text-white' : 'text-black'}`}>
                        I have
                        <span className='font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-red-500'>
                          {loadingActiveTokenCount ? ' Loading...' : ` ${activeTokensCount} `}
                        </span>
                        {isNaN(activeTokensCount) || activeTokensCount === 1 ? ' pair' : ' pairs'} of hands to handle the heat this round
                      </h3>
                      <div className="place-items-center justify-center items center">
                        <button
                          className={`mt-4 w-full ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
                          onClick={() => {
                            const tweetText = `I have ${activeTokensCount} ${activeTokensCount === 1 ? 'pair' : 'pairs'} of hands to handle the heat this round!!\nAre you ready to pass the heat? Check out @ocHotPotato for more information on the project! #OnChainHotPotato`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                          }}
                        >
                          Tweet it!
                        </button>
                      </div>
                    </>
                    : getGameState == "Paused" ?
                      <>
                        <Image alt='Image' src={hot} width={200} height={200} />
                        {isWinner && Number(_rewards) != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                            onClick={() => {
                              if (!_address) {
                                noAddressToast();
                              } else if (Number(_rewards) == 0) {
                                noRewardsToast();
                              } else if (claimSim?.request) {
                                writeClaim(claimSim.request);
                              }
                            }}
                          >Claim Rewards</button>
                        }
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={Burning} width={200} height={200} />
                        {isWinner && Number(_rewards) != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`}
                            onClick={() => {
                              if (!_address) {
                                noAddressToast();
                              } else if (Number(_rewards) == 0) {
                                noRewardsToast();
                              } else if (claimSim?.request) {
                                writeClaim(claimSim.request);
                              }
                            }}
                          >Claim Rewards</button>
                        }
                      </>
            }
          </div>

          <div
            ref={divRef}
            className={`hide-scrollbar w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md overflow-x-auto`}
          >

            <div className="scrollable-div whitespace-nowrap h-full flex items-center space-x-4 pl-4 overflow-auto">
              {events.map((event, index) => (
                <div key={index} className={darkMode ? 'text-white' : 'text-black'}>
                  {event}
                </div>
              ))}
              <div ref={endOfDiv}></div>
            </div>
          </div>


          {getGameState !== 'Minting' && getGameState !== 'Queued' && loadingActiveTokenIds ? (
            <div className="text-center">
              <h1>Loading...</h1>
            </div>
          ) : (
            getGameState === 'Playing' || getGameState === 'Minting' || getGameState === 'Final Stage' || getGameState === 'Paused' ? (
              <div className={`p-4 col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-xl`}>
                <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Active Tokens:</h1>
                <div className="flex justify-center">
                  <button
                    onClick={refreshAllImages}
                    className={`mb-6 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
                  >
                    Refresh Images
                  </button>
                </div>

                <div className='text-3xl sm:text-xl md:text-xl lg:text-xl text-center'>
                  <h1 className='underline'>Sort By:</h1>
                  <button className='mr-5' onClick={sortTokensAsc}><HiArrowCircleUp /></button>
                  <button onClick={sortTokensDesc}><HiArrowCircleDown /></button>
                </div>
                <div className='grid grid-cols-8'>
                  <form onSubmit={handleSearch} className="col-start-3 col-span-4 flex flex-row justify-center items-center space-x-2 mt-4 mb-4">
                    <input
                      type="number"
                      value={searchId}
                      onChange={e => setSearchId(e.target.value)}
                      placeholder="Search by token ID"
                      className='basis-2/3 border-2 rounded-lg border-gray-200 focus:border-blue-500 focus:outline-none p-1 w-1/2'
                    />
                    <button
                      type="submit"
                      className={`basis-1/3 px-4 py-2 rounded-lg shadow ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white`}
                    >
                      Search
                    </button>
                  </form>
                </div>
                <div className={`grid grid-cols-8 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-center items-center`}>
                  {currentTokens.filter(tokenId => !explodedTokens.includes(tokenId)).map((tokenId, index) => (
                    <div key={index} className="border rounded-lg p-2 text-center justify-center items-center flex flex-col">
                      <TokenImage
                        tokenId={tokenId}
                        ABI={ABI}
                        potatoTokenId={_potatoTokenId}
                        shouldRefresh={shouldRefresh}
                        onTokenExploded={handleTokenExploded}
                        delay={index * 300}
                        className="z-20"
                      />
                    </div>
                  ))}
                </div>

                <div className='text-3xl lg:text-2xl md:text-2xl sm:text-xl text-center'>
                  {currentPage !== 1 &&
                    <button className='justify-items-center mx-8 sm:mx-4 mt-4' onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
                  }
                  {pages.map((page, index) => (
                    <button
                      className={`justify-items-center mx-8 sm:mx-4 mt- bg-clip-text ${page === currentPage ? (darkMode ? 'text-transparent bg-gradient-to-br from-amber-800 to-red-800' : 'text-transparent bg-gradient-to-b from-yellow-400 to-red-500') : 'text-black'}`}
                      key={index}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage !== pageCount &&
                    <button className='justify-items-center mx-8 sm:mx-4 mt-4' onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
                  }
                </div>
              </div>
            ) : null
          )}

          {_address === _ownerAddress &&
            <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-xl overflow-x-auto`}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 sm:grid-cols-3 gap-4">
                <button
                  className={`bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-3 md:col-span-3 sm:col-span-3`}
                  onClick={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Queued") {
                      startToast();
                    } else if (startSim?.request) {
                      writeStartGame(startSim.request);
                    }
                  }}
                >
                  Start Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2 md:col-span-3 sm:col-span-3"
                  onClick={() => {
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
                >
                  End Minting
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
                  onClick={() => {
                    if (!_address) {
                      noAddressToast();
                    } else if (getGameState !== "Playing" && getGameState !== "Final Stage" && getGameState !== "Minting") {
                      pauseToast();
                    } else if (pauseSim?.request) {
                      writePause(pauseSim.request);
                    }
                  }}
                >
                  Pause Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
                  onClick={() => {
                    if (!_address) {
                      resumeToast()
                    } else if (getGameState !== "Paused") {
                      resumeToast()
                    } else if (resumeSim?.request) {
                      console.log("resume")
                      writeResume(resumeSim.request);
                    }
                  }}
                >
                  Resume Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
                  onClick={() => {
                    try {
                      if (!_address) {
                        noAddressToast();
                      } else if (getGameState !== "Ended" && getGameState !== "Paused" && getGameState !== "Queued") {
                        restartToast();
                      } else if (restartSim?.request) {
                        writeRestart(restartSim.request);
                      }
                    } catch (error) {
                      console.log(error)
                    }
                  }}
                >
                  Restart Game
                </button>
              </div>
            </div>
          }



        </div>
      </div>

    </>
  )

}
