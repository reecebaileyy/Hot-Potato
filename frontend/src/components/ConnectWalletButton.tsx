import React, { useMemo } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useConnect, useConnection, useDisconnect } from 'wagmi'
import { hasPrivy } from '@/config/wallet'
import { formatAddress } from '../utils/formatAddress'

interface ConnectWalletButtonProps {
  className?: string
}

const connectClasses = 'px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold'
const disconnectClasses = 'px-4 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm'

function ConnectedView({
  address,
  onDisconnect,
  className,
}: {
  address: string | null
  onDisconnect: () => void
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="text-sm text-gray-300 truncate max-w-[150px]" title={address || undefined}>
        {address ? formatAddress(address) : 'Connected'}
      </span>
      <button onClick={onDisconnect} className={disconnectClasses}>
        Disconnect
      </button>
    </div>
  )
}

function PrivyConnectButton({ className }: ConnectWalletButtonProps): React.ReactElement {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address } = useConnection()

  // Get actual address (from wagmi or Privy)
  const actualAddress = useMemo(() => {
    if (address) return address
    if (wallets.length > 0 && wallets[0].address) return wallets[0].address
    return null
  }, [address, wallets])

  if (!ready) {
    return (
      <button className={`px-4 py-2 bg-gray-500 rounded text-white ${className ?? ''}`} disabled>
        Loading...
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button onClick={login} className={`${connectClasses} ${className ?? ''}`}>
        Connect Wallet
      </button>
    )
  }

  return <ConnectedView address={actualAddress} onDisconnect={logout} className={className} />
}

/** Plain wagmi flow for injected wallets, used when no Privy app id is configured. */
function InjectedConnectButton({ className }: ConnectWalletButtonProps): React.ReactElement {
  const { address, isConnected } = useConnection()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    const connector = connectors[0]
    return (
      <button
        onClick={() => connector && connect({ connector })}
        disabled={!connector || isPending}
        className={`${connectClasses} disabled:opacity-60 ${className ?? ''}`}
        title={connector ? undefined : 'No browser wallet found'}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }

  return <ConnectedView address={address ?? null} onDisconnect={() => disconnect()} className={className} />
}

const ConnectWalletButton: (props: ConnectWalletButtonProps) => React.ReactElement = hasPrivy
  ? PrivyConnectButton
  : InjectedConnectButton

export default ConnectWalletButton
