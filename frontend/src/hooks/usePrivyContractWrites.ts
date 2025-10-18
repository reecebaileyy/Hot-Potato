import { useSimulateContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0xD89A2aE68A3696D42327D75C02095b632D1B8f53' as const

export function usePrivyContractWrites(mintAmount?: string, price?: string, tokenId?: string) {
  console.log('=== USE PRIVY CONTRACT WRITES ===')
  console.log('Using wagmi hooks for all wallet types (including Privy embedded wallets)')

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

  // Simple wrapper functions that just use wagmi directly
  // wagmi automatically handles Privy embedded wallets when properly configured
  const enhancedWriteMint = async (request: any) => {
    console.log('=== WRITE MINT ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    console.log('request:', request)
    return writeMint(request)
  }

  const enhancedWritePass = async (request: any) => {
    console.log('=== WRITE PASS ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writePass(request)
  }

  const enhancedWriteClaim = async (request: any) => {
    console.log('=== WRITE CLAIM ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writeClaim(request)
  }

  const enhancedWriteStartGame = async (request: any) => {
    console.log('=== WRITE START GAME ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writeStartGame(request)
  }

  const enhancedWriteEndMint = async (request: any) => {
    console.log('=== WRITE END MINT ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writeEndMint(request)
  }

  const enhancedWritePause = async (request: any) => {
    console.log('=== WRITE PAUSE ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writePause(request)
  }

  const enhancedWriteResume = async (request: any) => {
    console.log('=== WRITE RESUME ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writeResume(request)
  }

  const enhancedWriteRestart = async (request: any) => {
    console.log('=== WRITE RESTART ===')
    console.log('Using wagmi writeContract (works with all wallet types)')
    return writeRestart(request)
  }

  return {
    // Mint
    mintSim,
    mintSimError,
    mintError,
    writeMint: enhancedWriteMint,
    mintPending,
    
    // Pass
    passSim,
    passSimError,
    passError,
    writePass: enhancedWritePass,
    passPending,
    
    // Claim
    claimSim,
    claimError,
    writeClaim: enhancedWriteClaim,
    
    // Owner operations
    startSim,
    startError,
    writeStartGame: enhancedWriteStartGame,
    starting,
    
    endMintSim,
    endMintError,
    writeEndMint: enhancedWriteEndMint,
    ending,
    
    pauseSim,
    pauseError,
    writePause: enhancedWritePause,
    pausing,
    
    resumeSim,
    resumeError,
    writeResume: enhancedWriteResume,
    resuming,
    
    restartSim,
    restartError,
    writeRestart: enhancedWriteRestart,
    restarting,

    // Wallet info (simplified)
    isPrivyWallet: true, // Always true since we're using wagmi
    walletType: 'wagmi' // Always wagmi since we're using wagmi hooks
  }
}