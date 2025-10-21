import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'
import { http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// --- Wagmi configuration ---
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

// Debug wagmi configuration
console.log('=== WAGMI CONFIG DEBUG ===')
console.log('Chains:', config.chains.map((c: any) => ({ name: c.name, id: c.id })))
console.log('Base Sepolia ID:', baseSepolia.id)
console.log('==========================')

// Debug Privy configuration
console.log('=== PRIVY CONFIG DEBUG ===')
console.log('Base Sepolia chain:', baseSepolia)
console.log('Base Sepolia name:', baseSepolia.name)
console.log('Base Sepolia id:', baseSepolia.id)
console.log('==========================')

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
        // Note: 'apple' login requires configuration in Privy Dashboard
        // To enable Apple login:
        // 1. Go to dashboard.privy.io
        // 2. Select your app
        // 3. Go to Settings > Login methods
        // 4. Enable "Sign in with Apple"
        // 5. Configure Apple OAuth (Service ID, Team ID, Key ID, Private Key)
        // Then add 'apple' back to this array
        loginMethods: ['wallet', 'email', 'google', 'sms'],
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        // Additional configuration to ensure proper network recognition
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
        <WagmiProvider config={config}>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
