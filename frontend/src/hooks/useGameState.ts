import { useState, useCallback } from 'react'

export function useGameState(initialGameState: string | null) {
  const [getGameState, setGetGameState] = useState<string | null>(initialGameState)
  const [prevGameState, setPrevGameState] = useState<string | null>(initialGameState)

  const updateGameState = useCallback((newState: string) => {
    setPrevGameState(getGameState)
    setGetGameState(newState)
  }, [getGameState])

  const handleGameStarted = useCallback(() => {
    setGetGameState('Minting')
    setPrevGameState('Queued')
  }, [])

  const handleMintingEnded = useCallback(() => {
    setGetGameState('Playing')
    setPrevGameState('Minting')
  }, [])

  const handleGameResumed = useCallback(() => {
    const prevState = prevGameState
    setGetGameState(prevState)
    const gameState = getGameState
    setPrevGameState(gameState)
  }, [prevGameState, getGameState])

  const handleGamePaused = useCallback(() => {
    const gameState = getGameState
    setPrevGameState(gameState)
    setGetGameState('Paused')
  }, [getGameState])

  const handleGameRestarted = useCallback(() => {
    setPrevGameState((prev) => prev)
    setGetGameState('Queued')
  }, [])

  return {
    getGameState,
    prevGameState,
    updateGameState,
    handleGameStarted,
    handleMintingEnded,
    handleGameResumed,
    handleGamePaused,
    handleGameRestarted
  }
}
