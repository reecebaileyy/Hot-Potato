import '@/styles/globals.css'
import Head from 'next/head';
import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector';
import { mainnet, goerli } from '@wagmi/chains';
import { configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';


export default function App({ Component, pageProps }) {
  const router = useRouter();
  const configureChainsConfig = configureChains(
    [mainnet, goerli], 
    [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || publicProvider() })],
  )

  return (
    <>
    <Head>
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" crossOrigin="" />

        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        <title>Privy Auth Starter</title>
        <meta name="description" content="Privy Auth Starter" />
      </Head>

      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        onSuccess={() => router.push('/play')}
      >
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <Component {...pageProps} />
        </PrivyWagmiConnector>
      </PrivyProvider>
    </>
  )
}
