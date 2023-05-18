import Image from 'next/image'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import logo from "public/assets/images/logo.png";



const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hot Potato Hot Potato..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.css" rel="stylesheet" />
      </Head>

      <div className="bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 h-screen">
        <nav className="py-2 pt-4 px-4 flex justify-between items-center">
          <div className='text-white text-2xl font-bold'> Hot Potato </div>
          <ul className='flex space-x-4'>
            <li className='text-white'>Home</li>
            <li className='text-white'>About</li>
            <li className='text-white'>Docs</li>
            <li className='text-white'></li>
          </ul>
          <div className='text-white bg-slate-500 p-2 rounded-lg'>Connect</div>
        </nav>
      </div>
    </>
  )
}
