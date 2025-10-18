import { useSimulateContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import ABI from '../abi/Game.json'

const CONTRACT_ADDRESS = '0x1fB69dDc3C0CA3af33400294893b7e99b8f224dF' as const

export function usePrivyContractWrites(mintAmount?: string, price?: string, tokenId?: string, gameState?: string) {
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

  // Owner operations - conditional based on game state
  const { data: startSim, error: startError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'startGame',
    query: {
      enabled: false, // Disabled due to unknown error signatures in contract
      retry: 1, // Reduced retries since we're being more selective
      retryDelay: 1000,
      staleTime: 30000, // Cache for 30 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  })
  const { writeContract: writeStartGame, isPending: starting } = useWriteContract()
  
  // Debug logging for admin operations
  console.log('=== ADMIN SIMULATIONS DEBUG ===');
  console.log('gameState:', gameState);
  console.log('startSim:', startSim);
  console.log('startError:', startError);

  const { data: endMintSim, error: endMintError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'endMinting',
    query: {
      enabled: false, // Disabled due to unknown error signatures in contract
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  })
  const { writeContract: writeEndMint, isPending: ending } = useWriteContract()

  const { data: pauseSim, error: pauseError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'pauseGame',
    query: {
      enabled: false, // Disabled due to unknown error signatures in contract
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  })
  const { writeContract: writePause, isPending: pausing } = useWriteContract()

  const { data: resumeSim, error: resumeError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'resumeGame',
    query: {
      enabled: false, // Disabled due to unknown error signatures in contract
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  })
  const { writeContract: writeResume, isPending: resuming } = useWriteContract()

  const { data: restartSim, error: restartError } = useSimulateContract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'restartGame',
    query: {
      enabled: false, // Disabled due to unknown error signatures in contract
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  })
  const { writeContract: writeRestart, isPending: restarting } = useWriteContract()
  
  // Debug logging for all admin operations
  console.log('endMintSim:', endMintSim, 'endMintError:', endMintError);
  console.log('pauseSim:', pauseSim, 'pauseError:', pauseError);
  console.log('resumeSim:', resumeSim, 'resumeError:', resumeError);
  console.log('restartSim:', restartSim, 'restartError:', restartError);
  
  // Log any simulation errors only when simulations are enabled and handle unknown signatures gracefully
  // Note: All admin simulations are disabled due to unknown error signatures in contract
  if (startError) {
    console.warn('Start game simulation disabled due to contract error signature issues');
  }
  if (endMintError) {
    console.warn('End minting simulation disabled due to contract error signature issues');
  }
  if (pauseError) {
    console.warn('Pause game simulation disabled due to contract error signature issues');
  }
  if (resumeError) {
    console.warn('Resume game simulation disabled due to contract error signature issues');
  }
  if (restartError) {
    console.warn('Restart game simulation disabled due to contract error signature issues');
  }

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
    console.log('Using wagmi writeContract with higher gas limit for VRF request')
    // Add higher gas limit for VRF request
    const requestWithGas = {
      ...request,
      gas: 5000000n // Higher gas limit for VRF request
    }
    return writeEndMint(requestWithGas)
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