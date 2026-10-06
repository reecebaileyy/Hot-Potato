import React from 'react'
import { useConnection, useSwitchChain } from 'wagmi'
import { chain, isGameConfigured } from '../config/chain'

/** Setup and network problems that block play, shown above the game. */
export default function StatusBanners({ readError }: { readError: Error | null }) {
  const { isConnected, chainId } = useConnection()
  const { switchChain, isPending } = useSwitchChain()
  const wrongNetwork = isConnected && chainId !== undefined && chainId !== chain.id

  const banner = 'w-full max-w-4xl mx-auto mb-6 rounded-xl border-2 p-4 text-center font-semibold'

  return (
    <>
      {!isGameConfigured && (
        <div className={`${banner} border-red-400 bg-red-100 text-red-800`}>
          NEXT_PUBLIC_GAME_ADDRESS is not set. Add the deployed Game address to .env.local and restart.
        </div>
      )}
      {isGameConfigured && readError && (
        <div className={`${banner} border-amber-400 bg-amber-100 text-amber-900`}>
          Can&apos;t read the game from {chain.name}. Check the RPC and contract address.
        </div>
      )}
      {wrongNetwork && (
        <div className={`${banner} border-amber-400 bg-amber-100 text-amber-900 space-y-2`}>
          <p>Your wallet is on another network. Hot Potato runs on {chain.name}.</p>
          <button
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => switchChain({ chainId: chain.id })}
            disabled={isPending}
          >
            Switch to {chain.name}
          </button>
        </div>
      )}
    </>
  )
}
