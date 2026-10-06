import { getAddress, isAddress, zeroAddress, type Address, type Chain } from 'viem'
import { hardhat, robinhood, robinhoodTestnet } from 'viem/chains'

/**
 * Single source of truth for which chain and Game contract the app talks to.
 * Everything is driven by NEXT_PUBLIC_* env vars, which Next inlines at build time.
 */

const CHAINS = {
  robinhood,
  robinhoodTestnet,
  hardhat,
} as const satisfies Record<string, Chain>

export type ChainKey = keyof typeof CHAINS

const DEFAULT_CHAIN: ChainKey = 'robinhoodTestnet'

function resolveChainKey(value: string | undefined): ChainKey {
  if (!value) return DEFAULT_CHAIN
  if (value in CHAINS) return value as ChainKey
  throw new Error(
    `NEXT_PUBLIC_CHAIN must be one of ${Object.keys(CHAINS).join(', ')} (got "${value}")`,
  )
}

export const chainKey: ChainKey = resolveChainKey(process.env.NEXT_PUBLIC_CHAIN)

const baseChain: Chain = CHAINS[chainKey]

/** RPC used by wagmi, Privy and the API routes. NEXT_PUBLIC_RPC_URL overrides the chain default. */
export const rpcUrl: string = process.env.NEXT_PUBLIC_RPC_URL || baseChain.rpcUrls.default.http[0]

/** The configured chain, with the RPC override applied so wallets use the same endpoint. */
export const chain: Chain = {
  ...baseChain,
  rpcUrls: { ...baseChain.rpcUrls, default: { http: [rpcUrl] } },
}

const rawGameAddress = process.env.NEXT_PUBLIC_GAME_ADDRESS

/** False when NEXT_PUBLIC_GAME_ADDRESS is missing or not an address. */
export const isGameConfigured: boolean = !!rawGameAddress && isAddress(rawGameAddress)

/** The Game contract. Zero address when unconfigured; check `isGameConfigured` before relying on it. */
export const GAME_ADDRESS: Address = isGameConfigured ? getAddress(rawGameAddress!) : zeroAddress

export const explorerUrl: string | undefined = chain.blockExplorers?.default.url

/** Block explorer link for a transaction, or undefined on chains without an explorer (hardhat). */
export function explorerTxUrl(hash: string): string | undefined {
  return explorerUrl ? `${explorerUrl}/tx/${hash}` : undefined
}

/** Block explorer link for an address, or undefined on chains without an explorer (hardhat). */
export function explorerAddressUrl(address: string): string | undefined {
  return explorerUrl ? `${explorerUrl}/address/${address}` : undefined
}
