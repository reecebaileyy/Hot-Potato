import React, { useMemo } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useEnsName } from 'wagmi'
import { formatAddress } from '../utils/formatAddress'

interface ConnectWalletButtonProps {
  className?: string
}

export default function ConnectWalletButton({ className }: ConnectWalletButtonProps): React.ReactElement {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address } = useAccount()

  // Get actual address (from wagmi or Privy)
  const actualAddress = useMemo(() => {
    if (address) return address
    if (wallets.length > 0 && wallets[0].address) return wallets[0].address
    return null
  }, [address, wallets])

  // Fetch ENS name for the address
  const { data: ensName, isLoading: ensLoading } = useEnsName({
    address: actualAddress as `0x${string}` | undefined,
    chainId: 1, // Mainnet for ENS
    query: {
      enabled: !!actualAddress,
      staleTime: 300000, // Cache for 5 minutes
      retry: 1,
    }
  })

  if (!ready) {
    return (
      <button className={`px-4 py-2 bg-gray-500 rounded text-white ${className ?? ''}`} disabled>
        Loading...
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className={`px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold ${className ?? ''}`}
      >
        Connect Wallet
      </button>
    )
  }

  // Display priority: ENS name > formatted address > 'Connected'
  const displayAddress = ensName || (actualAddress ? formatAddress(actualAddress) : 'Connected')

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="text-sm text-gray-300 truncate max-w-[150px]" title={actualAddress || undefined}>
        {displayAddress}
      </span>
      <button
        onClick={logout}
        className="px-4 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
      >
        Disconnect
      </button>
    </div>
  )
}
