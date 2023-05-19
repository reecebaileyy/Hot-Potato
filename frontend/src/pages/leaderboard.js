import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { Web3Button } from '@web3modal/react'

export default function Home() {

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef()

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hodl, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 h-screen font-darumadrop">
        <nav className="py-2 pt-10 px-5 md:px-10 flex justify-between items-center relative">
          <Link href='/' className='text-4xl sm:text-5xl md:text-6xl text-white'>HotPotato</Link>
          <div className="lg:hidden xl:hidden 2xl:hidden 3xl:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
              onClick={(e) => {
                // If the click target is not the menu and not inside the menu, close the menu
                if (!menuRef.current.contains(e.target)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black`}>
                <li><Link className='text-black hover:text-gray-700 justify-center' href="/play">Play</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="/leaderboard">Leaderboard</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://app.gitbook.com">Docs</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://opensea.io">Opensea</Link></li>
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg'/>
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className='text-white hover:text-black' href="/play">Play</Link></li>
            <li><Link className='text-white hover:text-black' href="/leaderboard">Leaderboard</Link></li>
            <li><Link className='text-white hover:text-black' href="https://app.gitbook.com">Docs</Link></li>
            <li><Link className='text-white hover:text-black' href="https://opensea.io">Opensea</Link></li>
          </ul>
          <div className='sm:hidden md:hidden'>
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg'/>
          </div>
        </nav>
      </div>
    </>
  )
}
