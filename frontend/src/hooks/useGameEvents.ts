import { useCallback, useState, useRef, useEffect } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { safeParseEventLogs } from '../pages/helpers/viemUtils'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0xD89A2aE68A3696D42327D75C02095b632D1B8f53' as const

// Temporary flag to disable event watching during RPC transition
const DISABLE_EVENT_WATCHING = false

export function useGameEvents(address: string, refetchHallOfFame: () => void, refreshImages?: () => void) {
  const [events, setEvents] = useState<string[]>([])
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(false)
  const [explosion, setExplosion] = useState<boolean>(false)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [roundMints, setRoundMints] = useState<number>(0)
  
  // Debounce refs to prevent excessive calls
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefetchTimeRef = useRef<number>(0)
  const lastRefreshTimeRef = useRef<number>(0)

  // Polling mechanism for contract updates
  const [pollingEnabled, setPollingEnabled] = useState(true)
  
  // Debounced helper functions with minimum interval enforcement
  const debouncedRefetch = useCallback((callback: () => void, delay: number = 3000) => {
    const now = Date.now()
    const timeSinceLastRefetch = now - lastRefetchTimeRef.current
    
    if (timeSinceLastRefetch < 2000) {
      // If less than 2 seconds since last refetch, extend the delay
      delay = Math.max(delay, 2000 - timeSinceLastRefetch)
    }
    
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current)
    }
    refetchTimeoutRef.current = setTimeout(() => {
      lastRefetchTimeRef.current = Date.now()
      callback()
    }, delay)
  }, [])

  const debouncedRefresh = useCallback((callback: () => void, delay: number = 2000) => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current
    
    if (timeSinceLastRefresh < 1000) {
      // If less than 1 second since last refresh, extend the delay
      delay = Math.max(delay, 1000 - timeSinceLastRefresh)
    }
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    refreshTimeoutRef.current = setTimeout(() => {
      lastRefreshTimeRef.current = Date.now()
      callback()
    }, delay)
  }, [])
  
  useEffect(() => {
    if (!pollingEnabled) return
    
    const pollInterval = setInterval(() => {
      // Trigger a refresh every 10 seconds to check for contract changes
      debouncedRefresh(() => setShouldRefresh((prev) => !prev), 1000)
    }, 10000) // Poll every 10 seconds
    
    return () => clearInterval(pollInterval)
  }, [pollingEnabled, debouncedRefresh])

  // Optimized event handlers with useCallback
  const handleGameStarted = useCallback(async (logs: any[]) => {
    setRoundMints(0)
    setEvents((prev) => [...prev, 'Heating up'])
    // Trigger immediate refresh for critical game state change
    debouncedRefresh(() => setShouldRefresh((prev) => !prev), 500)
  }, [debouncedRefresh])

  const handleMintingEnded = useCallback(async () => {
    setRemainingTime(remainingTime)
    setEvents((prev) => [...prev, 'No more mints'])
    // Trigger refresh for game state change
    debouncedRefresh(() => setShouldRefresh((prev) => !prev), 500)
  }, [remainingTime, debouncedRefresh])

  const handleGameResumed = useCallback(async () => {
    setEvents((prev) => [...prev, 'Back to it'])
    // Trigger refresh for game state change
    debouncedRefresh(() => setShouldRefresh((prev) => !prev), 500)
  }, [debouncedRefresh])

  const handleGamePaused = useCallback(async () => {
    setEvents((prev) => [...prev, 'Cooling off'])
    // Trigger refresh for game state change
    debouncedRefresh(() => setShouldRefresh((prev) => !prev), 500)
  }, [debouncedRefresh])

  const handleGameRestarted = useCallback(async () => {
    setRoundMints(0)
    setEvents((prev) => [...prev, 'Game Over'])
    // Trigger refresh for game state change
    debouncedRefresh(() => setShouldRefresh((prev) => !prev), 500)
  }, [debouncedRefresh])

  const handleFinalRoundStarted = useCallback(async () => {
    setEvents((prev) => [...prev, '2 PLAYERS LEFT'])
  }, [])

  const handlePlayerWon = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ player: `0x${string}` }>(ABI, 'PlayerWon', logs)
      const player = decoded[0]?.args?.player
      if (!player) return

      console.log('PlayerWon', player)
      // Only refetch if it's the current player and debounce the refetch
      if (player.toLowerCase() === address?.toLowerCase()) {
        debouncedRefetch(() => refetchHallOfFame(), 2000)
      }
      setEvents((prev) => [...prev, `${player} won! 🎉`])
    } catch (error) {
      console.error('Error updating wins:', error)
    }
  }, [refetchHallOfFame, address, debouncedRefetch])

  const handleSuccessfulPass = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ player: `0x${string}` }>(ABI, 'SuccessfulPass', logs)
      const player = decoded[0]?.args?.player
      if (!player) return

      console.log('SuccessfulPass', player)
    } catch (error) {
      console.error('Error updating successful passes', error)
    }
  }, [])

  const handlePotatoMinted = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ player: `0x${string}`; amount: bigint }>(ABI, 'PotatoMinted', logs)
      const player = decoded[0]?.args?.player
      const amount = Number(decoded[0]?.args?.amount ?? 0)
      if (!player) return

      console.log(`address: ${address} player: ${player} amount: ${amount}`)
      // Only trigger refresh if it's the current player and debounce the refresh
      if (player.toLowerCase() === address?.toLowerCase()) {
        debouncedRefresh(() => setShouldRefresh((prev) => !prev), 1000)
        // Also refresh images if the callback is provided
        if (refreshImages) {
          console.log('Triggering image refresh for minted tokens')
          refreshImages()
        }
      }
      setRoundMints(roundMints)
      setEvents((prev) => [...prev, `${player} just minted ${amount} hands`])
    } catch (error) {
      console.error('Error updating mints', error)
    }
  }, [address, roundMints, debouncedRefresh, refreshImages])

  const handleNewRound = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ round: bigint }>(ABI, 'NewRound', logs)
      const round = Number(decoded[0]?.args?.round ?? 0)
      console.log('NewRound', round)
      // Debounce refresh to prevent excessive updates
      debouncedRefresh(() => setShouldRefresh((prev) => !prev), 2000)
    } catch (error) {
      console.error('Error updating new round data', error)
    }
  }, [debouncedRefresh])

  const handleUpdatedTimer = useCallback((logs: any[]) => {
    const decoded = safeParseEventLogs<{ time: bigint }>(ABI, 'UpdatedTimer', logs)
    const time = decoded[0]?.args?.time?.toString()
    console.log('UpdatedTimer', time)

    if (time) {
      setRemainingTime(parseInt(time, 10))
      setEvents((prev) => [...prev, `${time} seconds till explosion`])
    }
  }, [])

  const handlePotatoExploded = useCallback(async (logs: any[]) => {
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
  }, [])

  const handlePotatoPassed = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ tokenIdTo: bigint }>(ABI, 'PotatoPassed', logs)
      const tokenIdTo = decoded[0]?.args?.tokenIdTo?.toString()
      if (!tokenIdTo) return

      console.log('PotatoPassed', tokenIdTo)
      setEvents((prev) => [...prev, `Potato Passed to #${tokenIdTo}`])
      // Debounce refresh to prevent excessive updates
      debouncedRefresh(() => setShouldRefresh((prev) => !prev), 1000)
    } catch (error) {
      console.error('Error handling PotatoPassed event', error)
    }
  }, [debouncedRefresh])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current)
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Event watchers disabled - using polling instead for reliability
  if (false) { // DISABLE_EVENT_WATCHING is now false, but we're using polling instead
    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'GameStarted',
      onLogs: handleGameStarted,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'MintingEnded',
      onLogs: handleMintingEnded,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'GameResumed',
      onLogs: handleGameResumed,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'GamePaused',
      onLogs: handleGamePaused,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'GameRestarted',
      onLogs: handleGameRestarted,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'FinalRoundStarted',
      onLogs: handleFinalRoundStarted,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'PlayerWon',
      onLogs: handlePlayerWon,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'SuccessfulPass',
      onLogs: handleSuccessfulPass,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'PotatoMinted',
      onLogs: handlePotatoMinted,
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'NewRound',
      onLogs: handleNewRound,
      onError(error) {
        console.warn('NewRound event error (non-critical):', error.message || error)
        // Don't log full error to avoid spam
      },
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'UpdatedTimer',
      onLogs: handleUpdatedTimer,
      onError(error) {
        console.warn('UpdatedTimer event error (non-critical):', error.message || error)
        // Don't log full error to avoid spam
      },
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'PotatoExploded',
      onLogs: handlePotatoExploded,
      onError(error) {
        console.warn('PotatoExploded event error (non-critical):', error.message || error)
        // Don't log full error to avoid spam
      },
    })

    useWatchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'PotatoPassed',
      onLogs: handlePotatoPassed,
      onError(error) {
        console.warn('PotatoPassed event error (non-critical):', error.message || error)
        // Don't log full error to avoid spam
      },
    })
  } else {
    console.log('Event watching temporarily disabled during RPC transition')
  }

  // Manual refresh trigger for immediate updates
  const triggerRefresh = useCallback(() => {
    console.log('Manual refresh triggered')
    setShouldRefresh((prev) => !prev)
  }, [])

  return {
    events,
    setEvents,
    shouldRefresh,
    explosion,
    remainingTime,
    setRemainingTime,
    roundMints,
    setRoundMints,
    triggerRefresh,
    pollingEnabled,
    setPollingEnabled
  }
}
