import '@/styles/globals.css'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { createPublicClient, webSocket } from 'viem'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import {polygon, polygonMumbai } from 'wagmi/chains'



export default function App({ Component, pageProps }) {

  const chains = [polygon, polygonMumbai]
  const projectId = process.env.PROJECT_ID
  console.log(process.env.test)
  console.log(process.env.PROJECT_ID)
  console.log(process.env.ALCHEMY_URL)
  const transport = webSocket("wss://polygon-mumbai.g.alchemy.com/v2/noxviX1N3qoV1kqQ7frOiaPt0IqoQj--");
  
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({
      appName:"Hot Potato",
      projectId,
      version: 1,
      chains 
    }),
    publicClient: createPublicClient({chain: polygonMumbai, transport})
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
            '--w3m-font-family': 'DarumadropOne, sans-serif', //LEFT OFF
            '--w3m-accent-color': '#FFFFFF',
            '--w3m-accent-fill-color': '#000000',
            '--w3m-background-color': '#000000',
            '--w3m-text-big-bold-size': '25px',
            '--w3m-text-small-regular-size': '1rem',
            '--w3m-text-xsmall-bold-size': '.8rem',
            '--w3m-logo-image-url': 'https://0xhotpotato.vercel.app/assets/images/FullRedLogo.png',
            '--w3m-text-xsmall-regular-size': '.8rem',
            '--w3m-font-weight': '400',
          }}
      />
    </>
  )
}
