// src/pages/_app.js
import '@/styles/globals.css'
import { useEffect, useState } from 'react'

import { createConfig, WagmiConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'

import { w3mConnectors, EthereumClient } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'

import { createPublicClient, http } from 'viem'

// --- Define Polygon Amoy locally (works even if your wagmi doesn't export it) ---
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
// -----------------------------------------------------------------------------

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
const amoyRpc =
  process.env.NEXT_PUBLIC_ALCHEMY_AMOY_HTTPS ||
  polygonAmoy.rpcUrls.default.http[0] // fallback if env var missing

const chains = [polygonAmoy, polygon]

const wagmiConfig = createConfig({
  ssr: true,
  autoConnect: true,
  connectors: w3mConnectors({
    appName: 'Hot Potato',
    projectId,
    chains,
  }),
  publicClient: createPublicClient({
    chain: polygonAmoy,
    transport: http(amoyRpc), // viem.http(...)
    batch: { multicall: true },
  }),
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Component {...pageProps} />
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          '--w3m-font-family': 'DarumadropOne, sans-serif',
          '--w3m-accent-color': '#FFFFFF',
          '--w3m-accent-fill-color': '#000000',
          '--w3m-background-color': '#000000',
          '--w3m-text-big-bold-size': '25px',
          '--w3m-text-small-regular-size': '1rem',
          '--w3m-text-xsmall-bold-size': '.8rem',
          '--w3m-logo-image-url': 'https://onchainhotpotato.vercel.app/assets/images/Burning.gif',
          '--w3m-text-xsmall-regular-size': '.8rem',
          '--w3m-font-weight': '400',
        }}
      />
    </>
  )
}
