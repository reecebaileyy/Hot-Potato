import { usePrivy, useWallets } from '@privy-io/react-auth'
import { getAddress, isAddress, type Address } from 'viem'
import { useConnection } from 'wagmi'
import { hasPrivy } from '@/config/wallet'

/**
 * The player's address. With Privy, wagmi knows it once @privy-io/wagmi has synced the active
 * wallet; until then fall back to Privy's first wallet so reads can start right after login.
 */
function usePrivyWalletAddress(): Address | undefined {
  const { address } = useConnection()
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()

  if (address) return address
  const fallback = authenticated ? wallets[0]?.address : undefined
  return fallback && isAddress(fallback) ? getAddress(fallback) : undefined
}

function useInjectedWalletAddress(): Address | undefined {
  return useConnection().address
}

// Chosen once at module load: the provider tree never changes shape, so hook order is stable.
export const useWalletAddress: () => Address | undefined = hasPrivy
  ? usePrivyWalletAddress
  : useInjectedWalletAddress
