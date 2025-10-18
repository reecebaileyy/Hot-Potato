import { useSimulateContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x278Bf0EF8CEED11bcdf201B1eE39d00e94FCA704' as const

export function useContractWrites() {
  // Mint operations
  const { data: mintSim, isError: mintSimError, error: mintError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'mintHand',
    args: [BigInt(0)], // Will be updated dynamically
    value: parseEther('0')
  })
  const { writeContract: writeMint, isPending: mintPending } = useWriteContract()

  // Pass operations
  const { data: passSim, isError: passSimError, error: passError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'passPotato',
    args: [BigInt(0)] // Will be updated dynamically
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
