import { createConfig as createPrivyConfig } from '@privy-io/wagmi'
import { createConfig, http, injected } from 'wagmi'
import { chain, rpcUrl } from './chain'
import { hasPrivy } from './wallet'

const transports = {
  [chain.id]: http(rpcUrl),
}

/**
 * With Privy, @privy-io/wagmi manages connectors from the Privy session. Without it, wagmi talks
 * to injected browser wallets directly.
 */
export const wagmiConfig = hasPrivy
  ? createPrivyConfig({ chains: [chain], transports })
  : createConfig({ chains: [chain], transports, connectors: [injected()] })

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
