import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { WagmiProvider, createConfig, type Config } from 'wagmi'
import { http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// --- Wagmi configuration ---
const config: Config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_URL || 'https://base-mainnet.public.blastapi.io'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_URL_SEPOLIA || 'https://base-sepolia.public.blastapi.io'),
  },
})

// --- React Query client ---
const queryClient = new QueryClient()

// --- App Component ---
export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'apple', 'sms'],
        appearance: {
          theme: 'dark',
          accentColor: '#ff8a00',
          logo: '/assets/images/Logo.png',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [base, baseSepolia],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
