import React from 'react'
import { useConnection, useSwitchChain } from 'wagmi'
import { Button } from './ui'
import { chain, isGameConfigured } from '../config/chain'

type Tone = 'danger' | 'warning'

function AlertIcon({ tone }: { tone: Tone }) {
  return tone === 'danger' ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  )
}

function Banner({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl p-4 ${tone === 'danger' ? 'bg-danger-soft' : 'bg-warning-soft'}`}
    >
      <span className={`mt-0.5 shrink-0 ${tone === 'danger' ? 'text-danger' : 'text-warning'}`}>
        <AlertIcon tone={tone} />
      </span>
      <div className="min-w-0 flex-1 text-[15px] leading-6 text-fg">{children}</div>
    </div>
  )
}

/** Setup and network problems that block play, shown above the game. */
export default function StatusBanners({ readError }: { readError: Error | null }) {
  const { isConnected, chainId } = useConnection()
  const { switchChain, isPending } = useSwitchChain()
  const wrongNetwork = isConnected && chainId !== undefined && chainId !== chain.id

  const showConfig = !isGameConfigured
  const showReadError = isGameConfigured && !!readError
  if (!showConfig && !showReadError && !wrongNetwork) return null

  return (
    <div className="space-y-3">
      {showConfig && (
        <Banner tone="danger">
          NEXT_PUBLIC_GAME_ADDRESS is not set. Add the deployed Game address to .env.local and restart.
        </Banner>
      )}
      {showReadError && (
        <Banner tone="warning">Can&apos;t read the game from {chain.name}. Check the RPC and contract address.</Banner>
      )}
      {wrongNetwork && (
        <Banner tone="warning">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Your wallet is on another network. Hot Potato runs on {chain.name}.</p>
            <Button
              variant="secondary"
              onClick={() => switchChain({ chainId: chain.id })}
              disabled={isPending}
              className="shrink-0"
            >
              Switch to {chain.name}
            </Button>
          </div>
        </Banner>
      )}
    </div>
  )
}
