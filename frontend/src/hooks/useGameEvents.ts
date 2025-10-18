import { useCallback, useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { safeParseEventLogs } from '../pages/helpers/viemUtils'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as const

export function useGameEvents(address: string, refetchHallOfFame: () => void) {
  const [events, setEvents] = useState<string[]>([])
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(false)
  const [explosion, setExplosion] = useState<boolean>(false)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [roundMints, setRoundMints] = useState<number>(0)

  // Optimized event handlers with useCallback
  const handleGameStarted = useCallback(async (logs: any[]) => {
    setRoundMints(0)
    setEvents((prev) => [...prev, 'Heating up'])
  }, [])

  const handleMintingEnded = useCallback(async () => {
    setRemainingTime(remainingTime)
    setEvents((prev) => [...prev, 'No more mints'])
  }, [remainingTime])

  const handleGameResumed = useCallback(async () => {
    setEvents((prev) => [...prev, 'Back to it'])
  }, [])

  const handleGamePaused = useCallback(async () => {
    setEvents((prev) => [...prev, 'Cooling off'])
  }, [])

  const handleGameRestarted = useCallback(async () => {
    setRoundMints(0)
    setEvents((prev) => [...prev, 'Game Over'])
  }, [])

  const handleFinalRoundStarted = useCallback(async () => {
    setEvents((prev) => [...prev, '2 PLAYERS LEFT'])
  }, [])

  const handlePlayerWon = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ player: `0x${string}` }>(ABI, 'PlayerWon', logs)
      const player = decoded[0]?.args?.player
      if (!player) return

      console.log('PlayerWon', player)
      // Only refetch if it's the current player
      if (player.toLowerCase() === address?.toLowerCase()) {
        await refetchHallOfFame()
      }
      setEvents((prev) => [...prev, `${player} won! 🎉`])
    } catch (error) {
      console.error('Error updating wins:', error)
    }
  }, [refetchHallOfFame, address])

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
      // Only trigger refresh if it's the current player
      if (player.toLowerCase() === address?.toLowerCase()) {
        setShouldRefresh((prev) => !prev)
      }
      setRoundMints(roundMints)
      setEvents((prev) => [...prev, `${player} just minted ${amount} hands`])
    } catch (error) {
      console.error('Error updating mints', error)
    }
  }, [address, roundMints])

  const handleNewRound = useCallback(async (logs: any[]) => {
    try {
      const decoded = safeParseEventLogs<{ round: bigint }>(ABI, 'NewRound', logs)
      const round = Number(decoded[0]?.args?.round ?? 0)
      console.log('NewRound', round)
      setShouldRefresh((prev) => !prev)
    } catch (error) {
      console.error('Error updating new round data', error)
    }
  }, [])

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
      setShouldRefresh((prev) => !prev)
    } catch (error) {
      console.error('Error handling PotatoPassed event', error)
    }
  }, [])

  // Event watchers with optimized handlers
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
      console.error('NewRound event error:', error)
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    eventName: 'UpdatedTimer',
    onLogs: handleUpdatedTimer,
    onError(error) {
      console.error('UpdatedTimer event error:', error)
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    eventName: 'PotatoExploded',
    onLogs: handlePotatoExploded,
    onError(error) {
      console.error('PotatoExploded event error:', error)
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    eventName: 'PotatoPassed',
    onLogs: handlePotatoPassed,
    onError(error) {
      console.error('PotatoPassed event error:', error)
    },
  })

  return {
    events,
    setEvents,
    shouldRefresh,
    explosion,
    remainingTime,
    setRemainingTime,
    roundMints,
    setRoundMints
  }
}
