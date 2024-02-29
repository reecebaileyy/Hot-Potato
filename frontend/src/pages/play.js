import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useState, useRef, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract } from 'wagmi'
import Play_Basic from '../../public/assets/images/Play_Basic.png'
import Passing from '../../public/assets/images/Passing.gif'
import Discord_Basic from '../../public/assets/images/Discord_Basic.png'
import Discord_Hover from '../../public/assets/images/Discord_Hover.png'
import Play_Hover from '../../public/assets/images/Play_Hover.png'
import Docs_Basic from '../../public/assets/images/Docs_Basic.png'
import X_Basic from '../../public/assets/images/X_Basic.png'
import X_Hover from '../../public/assets/images/X_Hover.png'
import blacklogo from '../../public/assets/images/Logo.png'


export default function Play({ }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const disableLogout = !ready || (ready && !authenticated);
  const disableLogin = !ready || (ready && authenticated);
  const { address } = useAccount();
  const menuRef = useRef()
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false)




  if (ready) return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className={`${darkMode ? 'darkmode text-white min-h-screen font-darumadrop' : 'normal min-h-screen font-darumadrop'}`}>
        <nav className="pt-10 px-5 md:px-10 flex justify-between items-center relative">

          <Link href='/'>
            <Image src={blacklogo} width={50} alt="Logo" />
          </Link>
          <div className="xl:hidden 2xl:hidden 3xl:hidden z-50">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
              onClick={(e) => {
                if (!menuRef.current.contains(e.target)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`${darkMode ? 'bg-gray-700 text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl' : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'}`}>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} target="_blank" href="https://twitter.com/0xHotPotatoGame"><Image src={X_Basic} width={150}></Image></Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/play"><Image src={Discord_Basic} width={150}></Image></Link></li>
                <li><Link onClick={logout} className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/"><Image src={Docs_Basic} width={150}></Image></Link></li>
                {user ? (
                  <li><button disabled={disableLogout} onClick={logout} className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}>Logout</button></li>
                ) : (
                  <li><button disabled={disableLogin} onClick={login} className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}>Login</button></li>
                )}
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  size={30}
                />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden lg:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
            {user ? (
              <li><button disabled={disableLogout} onClick={logout} className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}>Logout</button></li>
            ) : (
              <li><button disabled={disableLogin} onClick={login} className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`}>Login</button></li>
            )}
          </ul>
          <div className='flex gap-2 items-center sm:hidden lg:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
          </div>
        </nav>

        <div className="flex justify-center items-center text-center min-h-screen">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl sm:text-2xl md:text-2xl font-bold">Account:</h1>
            <ul>
              {user ? (
                <>
                  <li>{user.email ? `User: ${user.email.address}` : ''}</li>
                  <li>{user.phone ? `User: ${user.phone.number}` : ''}</li>
                  <li>{user.google ? `User: ${user.google.email}` : ''}</li>
                  <li>{user.apple ? `User: ${user.apple.email}` : ''}</li>
                  <li>{user.discord ? `User: ${user.discord.username}` : ''}</li>
                  <li>{user.twitter ? `User: ${user.twitter.username}` : ''}</li>
                  <li>{user.github ? `User: ${user.github.username}` : ''}</li>
                  <li>{user.tiktok ? `User: ${user.tiktok.username}` : ''}</li>
                  <li>{user.linkedin ? `User: ${user.linkedin.email}` : ''}</li>
                  <li>{user.farcaster ? `User: ${user.farcaster.email}` : ''}</li>
                  <li>{user.wallet ? `Wallet: ${user.wallet.address}` : ''}</li>
                </>
              ) : (
                <h1 className="text-3xl sm:text-2xl md:text-2xl font-bold text-white"> Not Found</h1>
              )}
            </ul>
            <h1 className="text-3xl sm:text-2xl md:text-2xl font-bold">COMING SOON</h1>
            <p className="text-3xl sm:text-2xl md:text-2xl font-bold">Stay tuned for updates</p>
          </div>
        </div>

      </div>

    </>
  )
}