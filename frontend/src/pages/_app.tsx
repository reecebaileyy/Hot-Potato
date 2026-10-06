import '@/styles/globals.css'
import { useSyncExternalStore, type ReactNode } from 'react'
import type { AppProps } from 'next/app'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { chain } from '@/config/chain'
import { wagmiConfig } from '@/config/wagmi'
import { hasPrivy, privyAppId } from '@/config/wallet'
import { ThemeProvider } from '@/hooks/useTheme'

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

/** Privy login (email, social, embedded wallets) with @privy-io/wagmi syncing the active wallet. */
function PrivyProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId as string}
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
        <PrivyWagmiProvider config={wagmiConfig}>{children}</PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

/** Injected wallets only (no NEXT_PUBLIC_PRIVY_APP_ID), e.g. local development. */
function InjectedProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

const Providers = hasPrivy ? PrivyProviders : InjectedProviders

export default function App({ Component, pageProps }: AppProps) {
  const isClient = useIsClient()
  if (!isClient) return null

  return (
    <ThemeProvider>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </ThemeProvider>
  )
}
