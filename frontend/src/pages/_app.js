// src/pages/_app.js
import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import { WagmiProvider, http, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// --- Define Polygon Amoy manually ---
const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology'] },
    public: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: { name: 'Polygonscan', url: 'https://amoy.polygonscan.com' },
  },
  testnet: true,
}
// -------------------------------------------------

const amoyRpc =
  process.env.NEXT_PUBLIC_ALCHEMY_AMOY_HTTPS ||
  polygonAmoy.rpcUrls.default.http[0]

const chains = [polygonAmoy, polygon]

// ✅ wagmi v2 config
const config = createConfig({
  chains,
  transports: {
    [polygonAmoy.id]: http(amoyRpc),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
})

// React Query is now required by Wagmi v2
const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#ff8a00',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
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
