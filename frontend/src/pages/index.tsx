import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import ConnectWalletButton from '../components/ConnectWalletButton'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import landscape from '../../public/assets/images/landscape.jpg'
import potato from '../../public/assets/images/potato.png'
import blacklogo from '../../public/assets/images/Logo.png'
import potatoFire from '../../public/assets/images/Burning.gif'
import CHAINLINK from '../../public/assets/images/CHAINLINK.png'
import explosion from '../../public/assets/images/Explosion.gif'
import hot from '../../public/assets/images/hot.png'
import localforage from 'localforage'

export default function Home() {
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    console.log('An UNKNOWN X BEDTIME PRODUCTION')
  }, [])

  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode')
    if (localDarkMode) {
      setDarkMode(JSON.parse(localDarkMode))
    }
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')

    localforage
      .setItem('darkMode', darkMode)
      .then(() => console.log('Item saved to local storage'))
      .catch((error) => console.error('Error saving item:', error))
  }, [darkMode])

  return (
    <>
      <Head>
        <title>Onchain Hot Potato - Hold, Pass, Survive</title>
        <meta name="description" content="Experience the ultimate blockchain-based Hot Potato game. Mint NFTs, pass the hot potato, and win ETH rewards using Chainlink VRF for verifiable randomness." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="blockchain game, NFT, Hot Potato, Chainlink VRF, Ethereum, gaming" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${
          darkMode
            ? 'darkmode bg-fixed to-black text-white min-h-screen font-darumadropone'
            : 'normal bg-fixed min-h-screen font-darumadropone'
        }`}
      >
        <Navigation 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
        />

        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-5"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 animate-float">
              <Image src={potatoBlink} width={80} height={80} alt="Potato" className="opacity-40" />
            </div>
            <div className="absolute top-40 right-20 animate-bounce-slow">
              <Image src={hot} width={60} height={60} alt="Hot" className="opacity-50" />
            </div>
            <div className="absolute bottom-40 left-20 animate-pulse-slow">
              <Image src={potatoFire} width={100} height={100} alt="Burning Potato" className="opacity-30" />
            </div>
            <div className="absolute bottom-20 right-10 animate-float">
              <Image src={explosion} width={70} height={70} alt="Explosion" className="opacity-25" />
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold gradient-text animate-glow drop-shadow-lg">
                  HOT POTATO
                </h1>
                <div className="w-32 sm:w-48 h-2 sm:h-3 bg-gradient-to-r from-amber-400 via-red-400 to-pink-400 mx-auto rounded-full shadow-lg"></div>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white drop-shadow-md font-bold">
                  Hold, Pass, Survive...
                </p>
                <p className="text-lg sm:text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed drop-shadow-sm font-semibold">
                  The ultimate blockchain-based Hot Potato game featuring NFT minting, Chainlink VRF randomness, and ETH rewards
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <Link href="/play" className="btn-primary text-xl sm:text-2xl px-12 sm:px-16 py-6 sm:py-8 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-2xl">
                  🎮 Start Playing Now
                </Link>
                <Link href="/leaderboard" className="btn-outline text-xl sm:text-2xl px-12 sm:px-16 py-6 sm:py-8 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto border-2">
                  🏆 View Leaderboard
                </Link>
              </div>

              {/* Chainlink Integration Badge */}
              <div className="pt-8">
                <div className={`${darkMode ? 'card-dark' : 'card'} inline-flex items-center space-x-4 px-8 py-4 shadow-xl`}>
                  <Image src={CHAINLINK} width={40} height={40} alt="Chainlink" />
                  <span className="text-lg font-semibold">Powered by Chainlink VRF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Information Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-6 drop-shadow-md">
                How It Works
              </h2>
              <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto drop-shadow-sm font-semibold">
                Experience the thrill of blockchain gaming with verifiable randomness and real rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">🎫</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">1. Mint NFT</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  Start by minting your unique NFT potato character in each round
                </p>
              </div>

              {/* Step 2 */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">🔥</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">2. Hot Potato</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  One potato becomes &quot;hot&quot; - pass it quickly before it explodes!
                </p>
              </div>

              {/* Step 3 */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">3. Strategy</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  Time your passes perfectly and outsmart your opponents
                </p>
              </div>

              {/* Step 4 */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">💰</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">4. Win ETH</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  Last player standing wins ETH rewards and bragging rights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-6 drop-shadow-md">
                Game Features
              </h2>
              <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto drop-shadow-sm font-semibold">
                Cutting-edge blockchain technology meets classic gaming fun
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Blockchain Integration */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">⛓️</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">Blockchain Integration</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-medium">
                  Built on Ethereum with smart contracts ensuring fair play and transparent transactions
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                  <li>• Smart contract automation</li>
                  <li>• Transparent game mechanics</li>
                  <li>• Decentralized rewards</li>
                </ul>
              </div>

              {/* Chainlink VRF */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">🎲</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">Verifiable Randomness</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-medium">
                  Powered by Chainlink VRF for provably fair random number generation
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                  <li>• Cryptographically secure</li>
                  <li>• Tamper-proof randomness</li>
                  <li>• Auditable results</li>
                </ul>
              </div>

              {/* NFT Collection */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl hover:scale-105 transition-all duration-300`}>
                <div className="text-6xl mb-6">🎨</div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">Unique NFTs</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-medium">
                  Collect unique potato NFTs with different traits, backgrounds, and hands
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                  <li>• Randomized traits</li>
                  <li>• Rare combinations</li>
                  <li>• Tradeable assets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-6 drop-shadow-md">
                Game Statistics
              </h2>
              <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto drop-shadow-sm font-semibold">
                Track your progress and compete with players worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl`}>
                <div className="text-4xl font-bold gradient-text mb-2">1,000+</div>
                <div className="text-lg text-gray-800 dark:text-gray-200 font-semibold">Active Players</div>
              </div>
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl`}>
                <div className="text-4xl font-bold gradient-text mb-2">50+</div>
                <div className="text-lg text-gray-800 dark:text-gray-200 font-semibold">ETH Rewarded</div>
              </div>
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl`}>
                <div className="text-4xl font-bold gradient-text mb-2">10,000+</div>
                <div className="text-lg text-gray-800 dark:text-gray-200 font-semibold">NFTs Minted</div>
              </div>
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center animate-fade-in-up shadow-xl`}>
                <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
                <div className="text-lg text-gray-800 dark:text-gray-200 font-semibold">Always Online</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Footer */}
        <footer className={`${darkMode ? 'bg-gray-900/50' : 'bg-white/10'} backdrop-blur-md border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and Description */}
              <div className="md:col-span-2">
                <Image src={blacklogo} width={200} alt="Hot Potato Logo" className="mb-4" />
                <p className="text-gray-800 dark:text-gray-200 mb-4 max-w-md font-medium">
                  The ultimate blockchain-based Hot Potato game featuring NFT minting, Chainlink VRF randomness, and ETH rewards.
                </p>
                <div className="flex space-x-4">
                  <ConnectWalletButton className='btn-primary text-sm px-6 py-3' />
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-bold gradient-text mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/play" className="text-gray-800 dark:text-gray-200 hover:text-amber-400 transition-colors font-medium">🎮 Play Game</Link></li>
                  <li><Link href="/leaderboard" className="text-gray-800 dark:text-gray-200 hover:text-amber-400 transition-colors font-medium">🏆 Leaderboard</Link></li>
                  <li><Link href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank" className="text-gray-800 dark:text-gray-200 hover:text-amber-400 transition-colors font-medium">📚 Documentation</Link></li>
                  <li><Link href="https://opensea.io" target="_blank" className="text-gray-800 dark:text-gray-200 hover:text-amber-400 transition-colors font-medium">🛒 OpenSea</Link></li>
                </ul>
              </div>

              {/* Game Info */}
              <div>
                <h3 className="text-xl font-bold gradient-text mb-4">Game Info</h3>
                <ul className="space-y-2 text-gray-800 dark:text-gray-200 font-medium">
                  <li>⛓️ Built on Ethereum</li>
                  <li>🎲 Chainlink VRF</li>
                  <li>🎨 Unique NFTs</li>
                  <li>💰 ETH Rewards</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                © 2024 Onchain Hot Potato. An UNKNOWN X BEDTIME PRODUCTION.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
