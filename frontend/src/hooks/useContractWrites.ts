import { useSimulateContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x1fB69dDc3C0CA3af33400294893b7e99b8f224dF' as const

export function useContractWrites(mintAmount?: string, price?: string, tokenId?: string) {
  // Mint operations
  const { data: mintSim, isError: mintSimError, error: mintError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'mintHand',
    args: mintAmount ? [BigInt(mintAmount)] : [BigInt(0)],
    value: mintAmount && price ? parseEther((Number(mintAmount) * Number(price)).toString()) : parseEther('0'),
    query: {
      enabled: !!mintAmount && !!price
    }
  })
  const { writeContract: writeMint, isPending: mintPending } = useWriteContract()

  // Pass operations
  const { data: passSim, isError: passSimError, error: passError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'passPotato',
    args: tokenId ? [BigInt(tokenId)] : [BigInt(0)],
    query: {
      enabled: !!tokenId
    }
  })
  const { writeContract: writePass, isPending: passPending } = useWriteContract()

  // Claim operations
  const { data: claimSim, error: claimError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'withdrawWinnersFunds'
  })
  const { writeContract: writeClaim } = useWriteContract()

  // Explosion operations
  const { data: explosionSim, error: explosionError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'checkExplosion'
  })
  const { writeContract: writeCheck } = useWriteContract()

  // Owner operations
  const { data: startSim, error: startError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'startGame'
  })
  const { writeContract: writeStartGame, isPending: starting } = useWriteContract()

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

  return {
    // Mint
    mintSim,
    mintSimError,
    mintError,
    writeMint,
    mintPending,
    
    // Pass
    passSim,
    passSimError,
    passError,
    writePass,
    passPending,
    
    // Claim
    claimSim,
    claimError,
    writeClaim,
    
    // Explosion
    explosionSim,
    explosionError,
    writeCheck,
    
    // Owner operations
    startSim,
    startError,
    writeStartGame,
    starting,
    
    endMintSim,
    endMintError,
    writeEndMint,
    ending,
    
    pauseSim,
    pauseError,
    writePause,
    pausing,
    
    resumeSim,
    resumeError,
    writeResume,
    resuming,
    
    restartSim,
    restartError,
    writeRestart,
    restarting
  }
}
