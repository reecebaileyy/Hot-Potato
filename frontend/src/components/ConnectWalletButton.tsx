import React, { useMemo } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useConnect, useConnection, useDisconnect } from 'wagmi'
import { hasPrivy } from '@/config/wallet'
import { formatAddress } from '../utils/formatAddress'
import { Button } from './ui'

interface ConnectWalletButtonProps {
  className?: string
  /** Full width (used in the mobile sheet and empty states). */
  block?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const pillHeight = { sm: 'h-8', md: 'h-10', lg: 'h-12' }

function ConnectedView({
  address,
  onDisconnect,
  className = '',
  block = false,
  size = 'sm',
}: ConnectWalletButtonProps & { address: string | null; onDisconnect: () => void }) {
  return (
    <div className={`flex items-center gap-2 ${block ? 'w-full' : ''} ${className}`}>
      <span
        className={`inline-flex items-center gap-2 ${pillHeight[size]} px-3 rounded-full bg-surface-muted text-[13px] font-medium tnum text-fg ${
          block ? 'flex-1 justify-center' : ''
        }`}
        title={address || undefined}
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
        {address ? formatAddress(address) : 'Connected'}
      </span>
      <Button variant="ghost" size="sm" onClick={onDisconnect}>
        Disconnect
      </Button>
    </div>
  )
}

function PrivyConnectButton({ className = '', block = false, size = 'sm' }: ConnectWalletButtonProps): React.ReactElement {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address } = useConnection()

  // Prefer the wagmi-synced address, fall back to Privy's first wallet.
  const actualAddress = useMemo(() => {
    if (address) return address
    if (wallets.length > 0 && wallets[0].address) return wallets[0].address
    return null
  }, [address, wallets])

  if (!ready) {
    return (
      <Button size={size} block={block} className={className} loading>
        Connect
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button size={size} block={block} className={className} onClick={login}>
        Connect wallet
      </Button>
    )
  }

  return <ConnectedView address={actualAddress} onDisconnect={logout} className={className} block={block} size={size} />
}

/** Plain wagmi flow for injected wallets, used when no Privy app id is configured. */
function InjectedConnectButton({ className = '', block = false, size = 'sm' }: ConnectWalletButtonProps): React.ReactElement {
  const { address, isConnected } = useConnection()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    const connector = connectors[0]
    return (
      <Button
        size={size}
        block={block}
        className={className}
        onClick={() => connector && connect({ connector })}
        disabled={!connector}
        loading={isPending}
        title={connector ? undefined : 'No browser wallet found'}
      >
        Connect wallet
      </Button>
    )
  }

  return (
    <ConnectedView address={address ?? null} onDisconnect={() => disconnect()} className={className} block={block} size={size} />
  )
}

const ConnectWalletButton: (props: ConnectWalletButtonProps) => React.ReactElement = hasPrivy
  ? PrivyConnectButton
  : InjectedConnectButton

export default ConnectWalletButton
