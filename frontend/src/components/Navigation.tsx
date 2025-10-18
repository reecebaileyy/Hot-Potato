import React, { useRef } from 'react'
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

  return (
    <nav className="pt-10 px-5 md:px-10 flex justify-between items-center relative">
      <Link href='/'>
        <Image src={blacklogo} width={150} alt="Logo" />
      </Link>
      <div className="xl:hidden 2xl:hidden 3xl:hidden z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
        </button>
        <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
          onClick={(e) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
              setIsOpen(false)
            }
          }}>
          <ul ref={menuRef} className={`${darkMode ? 'bg-gray-700 text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl' : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'}`}>
            <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <ConnectWalletButton className='text-white bg-slate-800 p-2 rounded-lg' />
          </ul>
        </div>
      </div>
      <ul className='flex md:hidden sm:hidden lg:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
        <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
        <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
        <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
        <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
      </ul>
      <div className='flex gap-2 items-center sm:hidden lg:hidden md:hidden'>
        <DarkModeSwitch
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          size={30}
        />
        <ConnectWalletButton className='text-white bg-slate-800 p-2 rounded-lg' />
      </div>
    </nav>
  )
}
