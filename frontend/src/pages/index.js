import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth';
import { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Play_Basic from '../../public/assets/images/Play_Basic.png'
import Discord_Basic from '../../public/assets/images/Discord_Basic.png'
import Discord_Hover from '../../public/assets/images/Discord_Hover.png'
import Play_Hover from '../../public/assets/images/Play_Hover.png'
import Docs_Basic from '../../public/assets/images/Docs_Basic.png'
import Docs_Hover from '../../public/assets/images/Docs_Hover.png'
import X_Basic from '../../public/assets/images/X_Basic.png'
import X_Hover from '../../public/assets/images/X_Hover.png'
import blacklogo from '../../public/assets/images/Logo.png'

export default function Home() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const disableLogout = !ready || (ready && !authenticated);
  const disableLogin = !ready || (ready && authenticated);
  const { address } = useAccount();
  const [playSrc, setPlaySrc] = useState(Play_Basic);
  const [discordSrc, setDiscordSrc] = useState(Discord_Basic); // Default image
  const [docsSrc, setDocsSrc] = useState(Docs_Basic); // Default image
  const [xSrc, setXSrc] = useState(X_Basic); // Default image
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef()



  if (ready) return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${darkMode ? 'grid darkmode bg-fixed to-black text-white min-h-screen font-darumadrop' : 'grid normal bg-fixed min-h-screen font-darumadrop'}`}>
      <video className="absolute top-0 left-0 w-full h-full object-cover z-[-1]" src={require('../../public/assets/images/HPBackgroundVideo.mp4')} autoPlay muted loop />

        <div className='grid place-content-center min-h-screen'>
          <div className="px-5 md:px-0 flex flex-col gap-0.5 items-center justify-center text-center space-y-5">
            <Link href='/'>
              <Image src={blacklogo} width={300} alt="Logo" />
            </Link>
            <div className='flex sm:flex-col md:flex-col gap-4'>
              {user ? (
                <button disabled={disableLogout} onClick={logout} ><Image src={Play_Hover} width={200} alt="Logo"/></button>) : (
                <button disabled={disableLogin} onClick={login} ><Image
                  width={200}
                  src={playSrc}
                  alt="Logo"
                  onMouseEnter={() => setPlaySrc(Play_Hover)} // Image on hover
                  onMouseLeave={() => setPlaySrc(Play_Basic)} // Image when not hovered
                /></button>
              )}
              <Link href='/play'>
                <Image
                  width={200}
                  src={discordSrc}
                  alt="Logo"
                  onMouseEnter={() => setDiscordSrc(Discord_Hover)} // Image on hover
                  onMouseLeave={() => setDiscordSrc(Discord_Basic)} // Image when not hovered
                />
              </Link>
              <Link href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">
                <Image
                  width={200}
                  src={docsSrc}
                  alt="Logo"
                  onMouseEnter={() => setDocsSrc(Docs_Hover)} // Image on hover
                  onMouseLeave={() => setDocsSrc(Docs_Basic)} // Image when not hovered
                />
              </Link>
              <Link href="https://twitter.com/0xHotPotatoGame">
                <Image
                  width={200}
                  src={xSrc}
                  alt="Logo"
                  onMouseEnter={() => setXSrc(X_Hover)} // Image on hover
                  onMouseLeave={() => setXSrc(X_Basic)} // Image when not hovered
                />
              </Link>
            </div>
          </div>
        </div>




        {/* 
        <div className="py-2 pt-10 px-5 md:px-10 flex flex-row justify-between items-center relative z-20">
          
          <div className="lg:hidden xl:hidden 2xl:hidden 3xl:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
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
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='flex items-center sm:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
          </div>
        </div> */}


      </div>


    </>
  )
}
