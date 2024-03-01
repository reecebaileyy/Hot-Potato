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
        <Link href='/'>
          <Image className='fixed top-5 left-5' src={blacklogo} width={50} alt="Logo" />
        </Link>

        <DarkModeSwitch
          className='fixed top-5 right-5'
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          size={30}
        />

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