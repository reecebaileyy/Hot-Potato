import '@/styles/globals.css'
import { useSyncExternalStore } from 'react'
import type { AppProps } from 'next/app'
import { WagmiProvider } from '@privy-io/wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { chain } from '@/config/chain'
import { wagmiConfig } from '@/config/wagmi'

const queryClient = new QueryClient()

const subscribeNoop = () => () => {}

/** True only after hydration on the client. Wallet providers need `window`. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const isClient = useIsClient()
  if (!isClient) return null

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        // 'apple' also works once Sign in with Apple is configured in the Privy dashboard.
        loginMethods: ['wallet', 'email', 'google', 'sms'],
        defaultChain: chain,
        supportedChains: [chain],
        appearance: {
          theme: 'dark',
          accentColor: '#ff8a00',
          logo: '/assets/images/Logo.png',
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
