import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Web3Button } from '@web3modal/react'
import logo from "public/assets/images/logo.png";

export default function Home() {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hodl, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 h-screen font-darumadrop">
        <nav className="py-2 pt-4 px-4 flex justify-between items-center">
          <div className='text-white text-2xl'> Hot Potato </div>
          <ul className='flex space-x-12'>
            <Link href="/play" className='text-white text-bold'>Play</Link>
            <Link href="/leaderboard" className='text-white text-bold'>Leaderboard</Link>
            <Link href="https://app.gitbook.com" className='text-white text-bold'>Docs</Link>
            <Link href="https://opensea.io" className='text-white text-bold'>Opensea</Link>
          </ul>
          <Web3Button className='text-white bg-slate-800 p-2 rounded-lg'/>
        </nav>
      </div>
    </>
  )
}
