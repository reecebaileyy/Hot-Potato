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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image className="h-16 w-16" src={logo} alt="Logo" width={600} height={600} />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-800 hover:text-gray-700 text-sm font-medium">
                  Home
                </Link>
                <Link href="/about" className="text-gray-800 hover:text-gray-700 text-sm font-medium">
                  About
                </Link>
                <Link href="/services" className="text-gray-800 hover:text-gray-700 text-sm font-medium">
                  Services
                </Link>
                <Link href="/contact" className="text-gray-800 hover:text-gray-700 text-sm font-medium">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 text-gray-800 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-700 focus:outline-none">
              <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="text-gray-800 hover:text-gray-700 block text-sm font-medium">
            Home
          </Link>
          <Link href="/about" className="text-gray-800 hover:text-gray-700 block text-sm font-medium">
            About
          </Link>
          <Link href="/services" className="text-gray-800 hover:text-gray-700 block text-sm font-medium">
            Services
          </Link>
          <Link href="/contact" className="text-gray-800 hover:text-gray-700 block text-sm font-medium">
            Contact
          </Link>
        </div>
      </div>
    </>
  )
}
