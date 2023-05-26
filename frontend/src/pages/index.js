import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { Web3Button } from '@web3modal/react'
import hot from 'public/assets/images/hot.png'
import landscape from 'public/assets/images/landscape.jpg'
import potato from 'public/assets/images/potato.png'
import blacklogo from 'public/assets/images/blacklogo.png'

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

      <div className="bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 min-h-screen font-darumadrop">
      <nav className="py-2 pt-10 px-5 md:px-10 flex justify-between items-center relative z-20">
          <Link href='/' className='text-4xl sm:text-5xl md:text-6xl text-white hover:text-black'><Image src={blacklogo} width={150}/></Link>
          <div className="lg:hidden xl:hidden 2xl:hidden 3xl:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
              onClick={(e) => {
                if (!menuRef.current.contains(e.target)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black`}>
                <li><Link className='text-black hover:text-gray-700 justify-center' href="/play">Play</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="/leaderboard">Leaderboard</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://app.gitbook.com" target="_blank">Docs</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://opensea.io" target="_blank">Opensea</Link></li>
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className='text-white hover:text-black' href="/play">Play</Link></li>
            <li><Link className='text-white hover:text-black' href="/leaderboard">Leaderboard</Link></li>
            <li><Link className='text-white hover:text-black' href="https://app.gitbook.com" target="_blank">Docs</Link></li>
            <li><Link className='text-white hover:text-black' href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='sm:hidden md:hidden'>
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>

        <header className="px-5 md:px-0 flex flex-col gap-0.5 items-center justify-center text-center p-10 space-y-5">
          <h1 className='text-4xl sm:text-5xl md:text-6xl text-white'>Onchain Hot Potato</h1>
          <h3 className='text-xl sm:text-2xl md:text-3xl text-white'>V1.0.0</h3>
          <p className='text-lg sm:text-xl md:text-2xl text-white'>Hodl, Pass, Survive...</p>
          <Link className='text-lg sm:text-xl md:text-2xl text-white bg-red-500 px-5 py-3 rounded-lg hover:bg-gradient-to-br from-gray-700 via-gray-800 to-black' href="/play">Play Now</Link>
        </header>

        <div className='flex flex-row sm:flex-col md:flex-col justify-between items-center gap-28 mx-12 mb-20'>
          <Image alt="Add alt Here" src={hot} width={400} height={400} />
          <h1 className='text-2xl text-center text-white'>Feel the intense heat as you compete in thrilling, fast-paced, adrenaline-fueled rounds, passing the sizzling potato to your friends or opponents before the timer runs out. With our user-friendly interface and intuitive gameplay, OnChain Hot Potato offers an immersive experience that&apos;s incredibly easy to pick up and play, making it a game you won&apos;t be able to resist. Whether you&apos;re a seasoned gamer or a beginner looking for a captivating challenge, our button-based gameplay will keep you hooked for hours on end, ensuring endless excitement and intense competition.</h1>
        </div>

        <div className="w-full flex justify-center items-center relative">
          <Image alt="Add alt Here" src={landscape} className="h-96 w-full object-cover" />
          <div className="absolute z-10 mx-10 text-center flex flex-col gap-4 justify-center h-full items-center">
            <h1 className="text-4xl md:text-2xl sm:text-2xl text-white">Onchain Hot Potato: Where Every Pass Can Make a Difference!</h1>
            <h3 className="text-2xl md:text-base sm:text-base text-white">Join the web3 revolution and immerse yourself in a fast-paced, exhilarating game of skill and strategy.</h3>
          </div>
        </div>

        <div className='grid grid-cols-6 gap-4 sm:flex sm:flex-col sm:gap-3 md:flex md:flex-col md:gap-3 mt-10 mx-10'>
          <h1 className='col-span-6 text-4xl md:text-2xl sm:text-2xl text-white text-center'>Getting Started with OnChain Hot Potato</h1>
          <h3 className='col-span-6 text-2xl md:text-base sm:text-base text-white text-center mb-10'>It&apos;s simple, fun, and rewarding! Here&apos;s how you can join in on the excitement...</h3>
          <p className="col-start-1 col-end-3 text-center text-white">This is a great place to explain the mechanics of the game in simple terms. Use clear, concise language and possibly some supporting infographics or images. You could also have a short video here demonstrating the gameplay. The goal is to make sure anyone visiting the page understands how the game is played and what makes it exciting.This is a great place to explain the mechanics of the game in simple terms. Use clear, concise language and possibly some supporting infographics or images. You could also have a short video here demonstrating the gameplay. The goal is to make sure anyone visiting the page understands how the game is played and what makes it exciting.This is a great place to explain the mechanics of the game in simple terms. Use clear, concise language and possibly some supporting infographics or images. You could also have a short video here demonstrating the gameplay. The goal is to make sure anyone visiting the page understands how the game is played and what makes it exciting.</p>
          <Image alt="Add alt Here" src={potato} width={700} height={750} className='col-start-3 col-end-5' />
          <p className="col-end-7 col-span-2 text-center text-white">This is a great place to explain the mechanics of the game in simple terms. Use clear, concise language and possibly some supporting infographics or images. You could also have a short video here demonstrating the gameplay. The goal is to make sure anyone visiting the page understands how the game is played and what makes it exciting.This is a great place to explain the mechanics of the game in simple terms. Use clear, concise language and possibly some supporting infographics or images. You could also have a short video here demonstrating the gameplay. The goal is to make sure anyone visiting the page understands how the game is played and what makes it exciting.This is a great place to explain the mechanics of the game in simple terms. Use clear, concise language and possibly some supporting infographics or images. You could also have a short video here demonstrating the gameplay. The goal is to make sure anyone visiting the page understands how the game is played and what makes it exciting.</p>
          <h1 className='text-4xl sm:text-2xl md:text-2xl col-start-1 col-end-7 text-center text-white'>That&apos;s all it takes to dive into the thrilling world of OnChain Hot Potato! Fun, quick, and rewarding - a game experience like no other.</h1>
        </div>

        <div className="flex items-center my-10 mx-10">
          <div className="flex-grow border-t border-white"></div>
          <span className="px-4 text-white">Hodl, Pass, Survive...</span>
          <div className="flex-grow border-t border-white"></div>
        </div>


        <div className='flex flex-row sm:flex-col md:flex-col justify-between items-center gap-28 mx-12'>
          <h1 className='text-2xl text-center text-white'>Experience OnChain Hot Potato, where thrilling gameplay meets community spirit! After each round, a portion of minting funds goes to a charity chosen by our players, ensuring our game impacts real-world good. As the tension rises and the potato gets tossed, the ultimate victor receives 40% of the minting pool. Leveraging Chainlink VRF, our game guarantees transparent, unbiased gameplay where the outcome is genuinely unpredictable. Track your successes, strategize, and compete with others using our detailed statistics. Enjoy endless rounds of adrenaline-pumping excitement with game resets after each round. Play OnChain Hot Potato today and experience gaming that combines strategy, low gas fees, and community spirit.</h1>
          <Image alt="Add alt Here" src={hot} width={400} height={400} />
        </div>

        <div className="flex items-center my-10 mx-10">
          <div className="flex-grow border-t border-white"></div>
          <span className="px-4 text-white">Mint, Trade, Collect..</span>
          <div className="flex-grow border-t border-white"></div>
        </div>

        <div className='grid grid-cols-6 gap-4 sm:flex sm:flex-col sm:gap-3 md:flex md:flex-col sm:items-center md:items-center md:gap-3 mt-10 mx-10'>
          <Image alt="Add alt Here" src={hot} width={200} className='col-start-1 col-end-3' />
          <h1 className="col-start-3 col-end-5 text-center text-white text-3xl sm:text-2xl md:text-2xl">Don&apos;t miss out on the most exciting onchain game of the year.
            <span className='text-black'><Link href="/play"> Get started </Link></span>
            with OnChain Hot Potato now!</h1>
          <Image alt="Add alt Here" src={hot} width={200} className='col-end-7 col-span-1' />
        </div>

        <div className="flex flex-col items-center py-12 bg-black mt-12">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:2xl md:2xl text-white font-semibold tracking-wide uppercase">Frequently Asked Questions</h1>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-500 sm:text-4xl">
                Got questions? We&apos;ve got answers.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div>
                  <dt className="text-xl leading-6 font-medium text-white">
                    How do I start playing OnChain Hot Potato?
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500">
                    It&apos;s easy to get started! First, you need to [describe steps here]. If you have any problems, our support team is always here to help.
                  </dd>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-medium text-white">
                    What do I need to play?
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500">
                    All you need to play is a stable internet connection, a MetaMask wallet, and some Matic to get started. You can download MetaMask [here](https://metamask.io/download.html). Please, refer to our documentation for more information on how to get started.
                  </dd>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-medium text-white">
                   Is it safe to play OnChain Hot Potato?
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500">
                  Safety is our top priority. OnChain Hot Potato operates on the Ethereum blockchain, which is secure by design. However, like all online activities involving value, we recommend taking precautions such as using secure and unique passwords for your wallet, keeping your private keys private, and being aware of potential phishing scams.
                  </dd>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-medium text-white">
                  Can I play OnChain Hot Potato from anywhere?
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500">
                  Yes, as long as you have a device with internet access and a Web3 wallet, you can play OnChain Hot Potato from anywhere in the world.
                  </dd>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-medium text-white">
                  Do I need to pay to play OnChain Hot Potato?
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500">
                  Yes, OnChain Hot Potato requires game tokens to play. These tokens can be purchased on our website using Ethereum or other supported cryptocurrencies.
                  </dd>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-medium text-white">
                    My question isn&apos;t listed here. What do I do?
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500">
                   If you have a question that isn&apos;t listed here, please reach out to our team on our socials listed below. We&apos;ll get back to you as soon as possible!
                  </dd>
                </div>
                {/* Repeat the above div for each FAQ. Remember to replace the placeholder text */}
              </dl>
            </div>
          </div>
          <footer className="">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
              <nav className="flex flex-wrap justify-center">
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <Link href="#"className="text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Twitter</span>
                      {/* Replace with your Twitter icon */}
                  </Link>
                </div>
                {/* Add more social media icons similar to the above div */}
              </nav>
              <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-center">
                <div className="flex space-x-6 items-center justify-center">
                  <Link href="#" className="text-gray-500 hover:text-gray-900">Privacy</Link>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">Terms</Link>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">Support</Link>
                </div>
                <p className="mt-8 text-center text-base text-gray-400">
                  &copy; 2023 OnChain Hot Potato. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
