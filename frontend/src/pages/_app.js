import '@/styles/globals.css'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { useState } from 'react'
import { createWalletClient, createPublicClient, custom, webSocket } from 'viem'
import { createConfig, WagmiConfig, createStorage } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'

export default function App({ Component, pageProps }) {
  const chains = [polygon, polygonMumbai]
  const [address, setAddress] = useState(null);
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

  // Initialize an EthereumClient using the wagmiConfig.
  const ethereumClient = new EthereumClient(wagmiConfig, chains)

  // Create a state for the client.
  const [client, setClient] = useState(null);

  // Handle the connect event.
  const handleConnect = async (provider) => {
    if (provider) {
      // Create a new Viem client using the user's provider.
      const userClient = createWalletClient({
        chain: polygonMumbai,
        transport: custom(provider)
      })
      // Convert the provider returned by Web3Modal to an Ethers.js Web3Provider.
    const web3Provider = new ethers.providers.Web3Provider(provider);

    // Now get the signer from the Web3Provider.
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
      console.log(`address, ${address}`)
      console.log(`userClient, ${userClient}`)
      
      // Set the new client.
      setClient(userClient)
    }
  }

  // Handle the disconnect event.
  const handleDisconnect = () => {
    // Reset the client when the user disconnects their wallet.
    setClient(null)
  }

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Component {...pageProps} client={client} address={address} />
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
        onConnect={() => handleConnect()}
        onDisconnect={() => handleDisconnect()}
      />
    </>
  )
}
