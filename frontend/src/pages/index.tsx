import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { useState, useRef, useEffect, MutableRefObject } from 'react'
import ConnectWalletButton from '../components/ConnectWalletButton'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import landscape from '../../public/assets/images/landscape.jpg'
import potato from '../../public/assets/images/potato.png'
import blacklogo from '../../public/assets/images/Logo.png'
import potatoFire from '../../public/assets/images/Burning.gif'
import CHAINLINK from '../../public/assets/images/CHAINLINK.png'
import localforage from 'localforage'

export default function Home() {
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLUListElement | null>(null)

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
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${
          darkMode
            ? 'darkmode bg-fixed to-black text-white min-h-screen font-darumadrop'
            : 'normal bg-fixed min-h-screen font-darumadrop'
        }`}
      >
        {/* Navigation */}
        <nav className={`pt-6 px-6 md:px-12 flex justify-between items-center relative z-50 ${darkMode ? 'glass-effect-dark' : 'glass-effect'} backdrop-blur-md`}>
          <Link href='/' className="transform transition-all duration-300 hover:scale-105">
            <Image src={blacklogo} width={150} alt="Logo" className="drop-shadow-lg" />
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
              <ul ref={menuRef} className={`${darkMode ? 'card-dark' : 'card'} p-8 flex flex-col space-y-6 text-xl md:text-2xl animate-fade-in-up`}>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-colors duration-300 font-semibold`} 
                    href="/play"
                    onClick={() => setIsOpen(false)}
                  >
                    Play
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-colors duration-300 font-semibold`} 
                    href="/leaderboard"
                    onClick={() => setIsOpen(false)}
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-colors duration-300 font-semibold`} 
                    href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" 
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-colors duration-300 font-semibold`} 
                    href="https://opensea.io" 
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                  >
                    Opensea
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
                className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-all duration-300 hover:scale-105 relative group`} 
                href="/play"
              >
                Play
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-all duration-300 hover:scale-105 relative group`} 
                href="/leaderboard"
              >
                Leaderboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-all duration-300 hover:scale-105 relative group`} 
                href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" 
                target="_blank"
              >
                Docs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link 
                className={`${darkMode ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-600'} transition-all duration-300 hover:scale-105 relative group`} 
                href="https://opensea.io" 
                target="_blank"
              >
                Opensea
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

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold gradient-text mb-4 sm:mb-6 animate-glow`}>
              HOT POTATO
            </h1>
            <div className="w-24 sm:w-32 h-1 sm:h-2 bg-gradient-to-r from-amber-500 to-red-500 mx-auto rounded-full mb-6 sm:mb-8"></div>
            <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 sm:mb-12 font-light`}>
              Hold, Pass, Survive...
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link href="/play" className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                🎮 Start Playing
              </Link>
              <Link href="/leaderboard" className="btn-outline text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                🏆 Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className={`${darkMode ? 'card-dark' : 'card'} p-6 sm:p-8 text-center animate-fade-in-up`}>
              <div className="text-4xl sm:text-6xl mb-4">🔥</div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 gradient-text`}>Hot Potato Game</h3>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Pass the hot potato before it explodes! The last person holding it wins the round.
              </p>
            </div>
            <div className={`${darkMode ? 'card-dark' : 'card'} p-6 sm:p-8 text-center animate-fade-in-up`}>
              <div className="text-4xl sm:text-6xl mb-4">🎯</div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 gradient-text`}>Strategic Gameplay</h3>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Time your passes perfectly and outsmart your opponents to claim victory.
              </p>
            </div>
            <div className={`${darkMode ? 'card-dark' : 'card'} p-6 sm:p-8 text-center animate-fade-in-up`}>
              <div className="text-4xl sm:text-6xl mb-4">💰</div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 gradient-text`}>Win Rewards</h3>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Earn ETH rewards for successful passes and winning rounds.
              </p>
            </div>
          </div>
        </div>
      </div>

      
    </>
  )
}
