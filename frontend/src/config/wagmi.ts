import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { chain, rpcUrl } from './chain'

export const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpcUrl),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
