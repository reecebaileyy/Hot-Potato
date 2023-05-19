import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Web3Button } from '@web3modal/react'

export default function Home() {

  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState([]);

  const [value, setValue] = useState('');

  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Remove non-numeric characters from the input value
    const numericValue = inputValue.replace(/[^0-9]/g, '');

    // Check if the input value contains non-numeric characters
    if (numericValue !== inputValue) {
      // Show an alert message when non-numeric characters are entered
      alert('Only numbers are allowed');
    }

    // Update the input value with only numeric characters
    setValue(numericValue);
  }

  const fetchEvent = async () => {
    // const events = await contractInstance.getPastEvents('allEvents');
    setEvents(events);
  }

  useEffect(() => {
    //TODO: Fetch the events when component mounts and whenever they change
    fetchEvent();
  }, []);

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
          <Link href='/' className='text-4xl sm:text-5xl md:text-6xl text-white hover:text-black'>LogoHere</Link>
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
                <li><Link className='text-black hover:text-gray-700' href="https://app.gitbook.com">Docs</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://opensea.io">Opensea</Link></li>
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

        <div className="sm:flex sm:flex-col md:flex md:flex-col grid grid-cols-6 gap-4 justify-center items-center p-4 mt-10">
          <div className="w-full col-start-2 col-span-4 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4 mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4">Hodl, Pass, Survive...</h1>
            <h2 className="text-xl font-bold mb-2 text-center">Game State: XXX</h2>
            <p className="text-sm text-center">This is the current game state. It will be updated automatically.</p>
          </div>
          <div className="w-full col-start-1 col-end-3 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4 mb-8">
            <h2 className="text-xl font-bold underline mb-2">Statistics:</h2>
            <p className="text-sm text-center mb-2">Successful Passes: XXX</p>
            <p className="text-sm text-center mb-2">Failed Passes: XXX</p>
            <p className="text-sm text-center mb-2">Total Wins: XXX</p>
          </div>
          <div className="w-full flex flex-col justify-center items-center col-start-3 col-span-2 md:w-2/3 lg:w-1/2 bg-white shadow-lg rounded-md p-6 mb-8 transition-transform duration-500 ease-in-out transform hover:scale-105">
            <h1 class="text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Jump in the Heat</h1>
            <p className="text-lg text-center mb-4 text-black">PRICE: XXX</p>
            <p className="text-lg text-center mb-4 text-black">MAX PER WALLET: XXX</p>
            <input className="mt-4 w-3/4 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder="Enter mint amount" />
            <button className="mt-4 w-1/2 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-3 rounded shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110">MINT NOW!</button>
            <p className="text-lg text-center mb-4 text-white">XXX/XXX MINTED</p>
            <Link href="https://mumbai.polygonscan.com/" target='_blank'></Link>
          </div>
          <div className="w-full col-end-7 col-span-2 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4 mb-8">
            <h2 className="text-xl font-bold mb-2">Your active token: XXX</h2>
            <p className="text-sm">You can pass the potato if you are currently holding it.</p>
            <button className="mt-4 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow">Pass Potato</button>
          </div>
          <div className="w-full col-start-1 col-end-7 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4">
            <div className="whitespace-nowrap h-full flex items-center space-x-4 pl-4">
              {events.map((event, index) => (
                <span className="inline-block text-white" key={index}>{event}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
