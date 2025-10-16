import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import { WagmiProvider, createConfig } from 'wagmi'
import { http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'apple', 'sms'],
        appearance: {
          theme: 'dark',
          accentColor: '#ff8a00',
          logo: '/assets/images/Logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
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
