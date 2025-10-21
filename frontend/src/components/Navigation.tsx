import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import ConnectWalletButton from './ConnectWalletButton'
import blacklogo from '../../public/assets/images/Logo.png'

interface NavigationProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function Navigation({ darkMode, setDarkMode, isOpen, setIsOpen }: NavigationProps) {
  const menuRef = useRef<HTMLUListElement | null>(null)

  // Close menu on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, setIsOpen])

  // Close menu when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 pt-3 pb-2 sm:pt-6 sm:pb-3 px-4 sm:px-6 md:px-12 flex justify-between items-center z-50 ${darkMode ? 'glass-effect-dark' : 'glass-effect'} backdrop-blur-md`}>
      <Link href='/' className="transform transition-all duration-300 hover:scale-105 relative z-50">
        <Image src={blacklogo} width={150} alt="Logo" className="w-[50px] sm:w-[100px] md:w-[150px] h-auto drop-shadow-lg" />
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
        <div className={`fixed inset-0 flex justify-center items-start pt-20 bg-black/60 backdrop-blur-sm transition-all duration-300 z-[60] ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          onClick={handleOverlayClick}>
          <ul ref={menuRef} className={`${darkMode ? 'card-dark' : 'card'} p-6 flex flex-col space-y-4 text-lg animate-fade-in-up w-11/12 max-w-sm`}>
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
            <div className="flex items-center justify-between pt-4 border-t border-gray-300/20">
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
      <ul className='hidden xl:flex space-x-8 text-lg font-semibold relative z-50'>
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
      <div className='hidden xl:flex gap-4 items-center relative z-50'>
        <DarkModeSwitch
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          size={30}
        />
        <ConnectWalletButton className='btn-primary text-sm px-6 py-3' />
      </div>
    </nav>
  )
}
