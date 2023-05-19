import '@/styles/globals.css'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import {polygon, polygonMumbai } from 'wagmi/chains'



const chains = [polygon, polygonMumbai]
const projectId = '2cfdc63c5f7f086289800e2f12c0bed8'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export default function App({ Component, pageProps }) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
      <Component {...pageProps} />
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
            '--w3m-font-family': 'DarumadropOne, sans-serif', //LEFT OFF
            '--w3m-accent-color': '#FFFFFF',
            '--w3m-accent-fill-color': '#000000',
            '--w3m-background-color': '#000000',
            '--w3m-text-big-bold-size': '25px',
            '--w3m-text-small-regular-size': '1rem',
            '--w3m-text-xsmall-bold-size': '.8rem',
            '--w3m-text-xsmall-regular-size': '.8rem',
            '--w3m-font-weight': '400',
          }}
      />
    </>
  )
}
