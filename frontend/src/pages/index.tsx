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
        <nav className="py-2 pt-10 px-5 md:px-10 flex justify-between items-center relative z-20">
          <Link href="/">
            <Image src={blacklogo} width={150} alt="Logo" />
          </Link>
          <div className="lg:hidden xl:hidden 2xl:hidden 3xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white"
            >
              <svg
                className="fill-current h-3 w-3"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" />
              </svg>
            </button>

            <div
              className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 ${
                isOpen ? '' : 'hidden'
              }`}
              onClick={(e) => {
                if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                  setIsOpen(false)
                }
              }}
            >
              <ul
                ref={menuRef}
                className={`${
                  darkMode
                    ? 'bg-gray-700 to-black text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl'
                    : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'
                }`}
              >
                <li>
                  <Link
                    className={`${
                      darkMode
                        ? 'text-white hover:text-black justify-center'
                        : 'text-black hover:text-gray-700 justify-center'
                    }`}
                    href="/play"
                  >
                    Play
                  </Link>
                </li>
                <li>
                  <Link
                    className={`${
                      darkMode
                        ? 'text-white hover:text-black justify-center'
                        : 'text-black hover:text-gray-700 justify-center'
                    }`}
                    href="/leaderboard"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    className={`${
                      darkMode
                        ? 'text-white hover:text-black justify-center'
                        : 'text-black hover:text-gray-700 justify-center'
                    }`}
                    href="https://0xhotpotato.gitbook.io/onchain-hot-potato/"
                    target="_blank"
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    className={`${
                      darkMode
                        ? 'text-white hover:text-black justify-center'
                        : 'text-black hover:text-gray-700 justify-center'
                    }`}
                    href="https://opensea.io/"
                    target="_blank"
                  >
                    Opensea
                  </Link>
                </li>
                <DarkModeSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} size={30} />
                <ConnectWalletButton className="text-white bg-slate-800 p-2 rounded-lg" />
              </ul>
            </div>
          </div>
          <ul className="flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl">
            <li>
              <Link
                className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}
                href="/play"
              >
                Play
              </Link>
            </li>
            <li>
              <Link
                className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}
                href="/leaderboard"
              >
                Leaderboard
              </Link>
            </li>
            <li>
              <Link
                className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}
                href="https://0xhotpotato.gitbook.io/onchain-hot-potato/"
                target="_blank"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}
                href="https://opensea.io"
                target="_blank"
              >
                Opensea
              </Link>
            </li>
          </ul>
          <div className="flex gap-2 items-center sm:hidden md:hidden">
            <DarkModeSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} size={30} />
            <ConnectWalletButton className="text-white bg-slate-800 p-2 rounded-lg" />
          </div>
        </nav>

        {/* Rest of your content stays identical */}
        {/* No logic changes required for typing */}
      </div>

      
    </>
  )
}
