import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import blacklogo from '../../public/assets/images/Logo.png'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import potatoFire from '../../public/assets/images/Burning.gif'
import explosion from '../../public/assets/images/Explosion.gif'
import hot from '../../public/assets/images/hot.png'

export default function Leaderboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
        <Navigation 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
        />

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
