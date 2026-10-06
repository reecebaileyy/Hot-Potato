import { usePrivy, useWallets } from '@privy-io/react-auth'
import { getAddress, isAddress, type Address } from 'viem'
import { useConnection } from 'wagmi'

/**
 * The player's address. wagmi knows it once @privy-io/wagmi has synced the active wallet;
 * until then fall back to Privy's first wallet so reads can start right after login.
 */
export function useWalletAddress(): Address | undefined {
  const { address } = useConnection()
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()

  if (address) return address
  const fallback = authenticated ? wallets[0]?.address : undefined
  return fallback && isAddress(fallback) ? getAddress(fallback) : undefined
}
