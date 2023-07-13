import '@/styles/globals.css'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { useState } from 'react'
import { createWalletClient, createPublicClient, custom, webSocket } from 'viem'
import { createConfig, WagmiConfig, createStorage } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'

export default function App({ Component, pageProps }) {
  const chains = [polygon, polygonMumbai]
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  const transport = webSocket(process.env.NEXT_PUBLIC_ALCHEMY_URL_WEBSOCKET);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({
      appName: "Hot Potato",
      projectId,
      version: 1,
      chains
    }),
    publicClient: createPublicClient({
      batch: {
        multicall: true,
      }, 
      chain: polygonMumbai, 
      transport
    })
  })

  const ethereumClient = new EthereumClient(wagmiConfig, chains)

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
