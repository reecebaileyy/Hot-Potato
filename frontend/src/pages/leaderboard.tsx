import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { useState, useRef, useEffect } from 'react'
import ConnectWalletButton from '../components/ConnectWalletButton'
import blacklogo from '../../public/assets/images/Logo.png'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import potatoFire from '../../public/assets/images/Burning.gif'
import explosion from '../../public/assets/images/Explosion.gif'
import hot from '../../public/assets/images/hot.png'

export default function Leaderboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode')
    if (localDarkMode) setDarkMode(JSON.parse(localDarkMode))
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    window.localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <>
      <Head>
        <title>Leaderboard - Onchain Hot Potato</title>
        <meta name="description" content="Hot Potato Game Leaderboard - Coming Soon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${
          darkMode
            ? 'darkmode bg-fixed to-black text-white min-h-screen font-darumadropone'
            : 'normal bg-fixed min-h-screen font-darumadropone'
        }`}
      >
        {/* Navigation */}
        <nav className={`pt-6 px-6 md:px-12 flex justify-between items-center relative z-50 ${darkMode ? 'glass-effect-dark' : 'glass-effect'} backdrop-blur-md border-b border-white/10`}>
          <Link href='/' className="transform transition-all duration-300 hover:scale-105">
            <Image src={blacklogo} width={150} alt="Hot Potato Logo" className="drop-shadow-lg" />
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="xl:hidden 2xl:hidden 3xl:hidden z-50">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'border-white/30 text-white hover:border-white hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <title>Menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" />
              </svg>
            </button>
            
            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
              onClick={(e) => {
                if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`${darkMode ? 'card-dark' : 'card'} p-8 flex flex-col space-y-6 text-xl md:text-2xl animate-fade-in-up shadow-2xl`}>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-colors duration-300 font-semibold`} 
                    href="/play"
                    onClick={() => setIsOpen(false)}
                  >
                    Play Game
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-colors duration-300 font-semibold`} 
                    href="/leaderboard"
                    onClick={() => setIsOpen(false)}
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-colors duration-300 font-semibold`} 
                    href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" 
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-colors duration-300 font-semibold`} 
                    href="https://opensea.io" 
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                  >
                    OpenSea
                  </Link>
                </li>
                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-300/20">
                  <DarkModeSwitch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    size={30}
                  />
                  <ConnectWalletButton className='btn-primary text-sm px-4 py-2' />
                </div>
              </ul>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <ul className='hidden xl:flex space-x-8 text-lg font-semibold'>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-all duration-300 hover:scale-105 relative group font-medium`} 
                href="/play"
              >
                Play
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-all duration-300 hover:scale-105 relative group font-medium`} 
                href="/leaderboard"
              >
                Leaderboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-all duration-300 hover:scale-105 relative group font-medium`} 
                href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" 
                target="_blank"
              >
                Docs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400 drop-shadow-lg' : 'text-gray-800 hover:text-amber-600 drop-shadow-md'} transition-all duration-300 hover:scale-105 relative group font-medium`} 
                href="https://opensea.io" 
                target="_blank"
              >
                OpenSea
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          </ul>
          
          {/* Desktop Controls */}
          <div className='hidden xl:flex gap-4 items-center'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <ConnectWalletButton className='btn-primary text-sm px-6 py-3' />
          </div>
        </nav>

        {/* Under Construction Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Overlay */}
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

          {/* Main Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              {/* Construction Icon */}
              <div className="text-8xl sm:text-9xl mb-8 animate-bounce-slow">
                🏗️
              </div>

              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text animate-glow drop-shadow-lg">
                  LEADERBOARD
                </h1>
                <div className="w-32 sm:w-48 h-2 sm:h-3 bg-gradient-to-r from-amber-400 via-red-400 to-pink-400 mx-auto rounded-full shadow-lg"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                  Coming Soon
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-sm font-semibold">
                  We&apos;re building an amazing leaderboard to track the top Hot Potato players. 
                  Stay tuned for rankings, statistics, and competitive features!
                </p>
              </div>

              {/* Features Preview */}
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 max-w-2xl mx-auto shadow-xl`}>
                <h3 className="text-2xl font-bold gradient-text mb-6">What to Expect</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏆</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Top Players Ranking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📊</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Detailed Statistics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎯</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Win/Loss Records</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⚡</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Real-time Updates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🔍</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Player Search</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏅</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Achievement Badges</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <Link href="/play" className="btn-primary text-xl sm:text-2xl px-12 sm:px-16 py-6 sm:py-8 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-2xl">
                  Start Playing Now
                </Link>
                <Link href="/" className="btn-outline text-xl sm:text-2xl px-12 sm:px-16 py-6 sm:py-8 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto border-2">
                  Back to Home
                </Link>
              </div>

              {/* Progress Indicator */}
              <div className="pt-8">
                <div className={`${darkMode ? 'card-dark' : 'card'} inline-flex items-center space-x-4 px-8 py-4 shadow-xl`}>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-lg font-semibold">Development in Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
