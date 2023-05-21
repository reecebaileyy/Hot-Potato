import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Web3Button } from '@web3modal/react'
import { ethers } from 'ethers'
import ABI from '../abi/UNKNOWN.json'
import { fetchBalance } from '@wagmi/core'
import { useAccount, useBalance, useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi'



export default function Home() {


  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState([]);
  const [tokenId, setTokenId] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [value, setValue] = useState('');


  const handleInputChangeToken = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      alert('Only numbers are allowed');
    }
    else if(inputValue === "") {
      setTokenId("");
    }
    else if (inputValue !== "") {
      const _tokenId = parseInt(inputValue);
      setTokenId(_tokenId);
    }
    setValue(numericValue);
  }

  const handleInputChangeMint = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      alert('Only numbers are allowed');
    }
    else if(inputValue === "") {
      setMintAmount("");
      setTotalCost(0);
    }
    else if (inputValue !== "") {
      const newMintAmount = parseInt(inputValue);
      setMintAmount(newMintAmount);
      setTotalCost(newMintAmount * 0.008);
    }
    setValue(numericValue);
  }
  


  const menuRef = useRef()

  // STORING USERS ADDRESS
  const { address } = useAccount()
  const { balance } = useBalance(address)


  // GETTING GAME STATE
  const { data: gameState } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'getGameState',
  })
  console.log(`gameState: ${gameState}`)
  // GETTING NUMBER OF PASSES
  const { data: successfulPasses } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'successfulPasses',
    args: [address],
  })
  const passes = parseInt(successfulPasses, 10);
  // GETTING NUMBER OF FAILS
  const { data: failedPasses } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'failedPasses',
    args: [address],
  })
  const failed = parseInt(failedPasses, 10);
  // GETTING NUMBER OF WINS
  const { data: totalWins } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'totalWins',
    args: [address],
  })
  const wins = parseInt(totalWins, 10);
  // GET MINT PRICE
  const { data: _price } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: '_price',
  })
  const price = parseInt(_price, 10);
  // GET NUMBER OF MINTS DURING THE ROUND
  const { data: getRoundMints } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'getRoundMints',
  })
  const _roundMints = parseInt(getRoundMints, 10);
  // GET NUMBER OF MAX MINTS DURING THE ROUND
  const { data: _maxsupply } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: '_maxsupply',
  })
  const maxSupply = parseInt(_maxsupply, 10);

   // GET TOKENS OWNED BY USER
   const { data: userHasPotatoToken } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [address],
  })

  // GET POTATO TOKEN ID
  const { data: potatoTokenId } = useContractRead({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'potatoTokenId',
  })
  const _potatoTokenId = parseInt(potatoTokenId, 10);


  // MINT HAND
  const { config } = usePrepareContractWrite({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'mintHand',
    args: [mintAmount],
  })
  const { data: mintData, isSuccess, write: mint } = useContractWrite(config)

  const handleMint = () => {
    if (!address) {
      alert("please connect to join the heat!!!");
    } else if (balance < totalCost) {
      alert("YOU NEED MORE FUNDS BOBO!!");
    } else if (mintAmount > (maxSupply - _roundMints)) {
      alert("TOO SLOW BOBOS ALL SOLD OUT.. GO SWEEP FCKIN BOBO");
    } else if (mintAmount == 0) {
      alert("COME ON SER.. AT LEAST GET 1 BOBO :/");
    } else {
      mint?.();
    }
  };

  // PASS POTATO
  const { config: configPass } = usePrepareContractWrite({
    address: '0x9C84a409cb10022d79ef997AB5a7411369391CA1',
    abi: ABI,
    functionName: 'passPotato',
    args: [tokenId],
  })
  const { data: passData, isSuccess: Successful, write: pass } = useContractWrite(configPass)

  const handlePass = () => {
    if (!address) {
      alert("please connect to join the heat!!!");
    } else if (gameState !== "Playing" || gameState == "FinalRound") {
      alert("The game has not started yet!");
    } else if (!userHasPotatoToken) {
      alert("You need to own the potato to make a pass!");
    } else {
      pass?.();
    }
     
  };

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

        <div className=" p-4 sm:flex sm:flex-col md:flex md:flex-col grid grid-cols-8 gap-4 justify-center items-center">
          <div className='w-full col-start-2 col-span-6 justify-start items-start md:w-2/3 lg:w-1/2 rounded-md'>
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-left font-bold mb-4">v1.0.0</h1>
          </div>

          <div className="w-full col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-md">
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4">Hodl, Pass, Survive...</h1>
            <h2 className="text-xl font-bold mb-2 text-center">Game State: {gameState}</h2>
            <p className="text-sm text-center">This is the current game state. It will be updated automatically.</p>
          </div>
          <div className="w-full col-start-1 col-end-3 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4 mb-8">
            <h2 className="text-xl font-bold underline mb-2">Statistics:</h2>
            <p className="text-sm text-center mb-2">Successful Passes: {passes}</p>
            <p className="text-sm text-center mb-2">Failed Passes: {failed}</p>
            <p className="text-sm text-center mb-2">Total Wins: {wins}</p>
          </div>
          <div className="w-full flex flex-col justify-center items-center col-start-3 col-span-4 md:w-2/3 lg:w-1/2 bg-white shadow-lg rounded-md p-6 mb-8 transition-transform duration-500 ease-in-out transform hover:scale-105">
            <h1 className="text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Jump in the Heat</h1>
            <p className="text-lg text-center mb-4 text-black">PRICE: {price} ETH</p>
            <p className="text-lg text-center mb-4 text-black">MAX PER WALLET: XXX</p>
            <input className="mt-4 w-3/4 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
              type="text"
              value={mintAmount}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={handleInputChangeMint}
              placeholder="Enter mint amount" />
            <button className="mt-4 w-1/2 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-3 rounded shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110"
              onClick={handleMint}
            >MINT NOW!</button>
            <p className="text-lg text-center mb-4 text-black">{_roundMints}/{maxSupply} MINTED</p>
            <Link href="https://mumbai.polygonscan.com/" target='_blank'></Link>
          </div>
          <div className="w-full p-4 mb-8 col-end-9 col-span-2  md:w-2/3 lg:w-1/2 bg-white shadow rounded-md">
            <h2 className="text-xl font-bold mb-2">Your active token(s): XXX</h2>
            <p className="text-sm">You can pass the potato if you are currently holding it.</p>
            <div className="grid grid-rows-2 place-items-center justify-center items center">
              <input className="mt-4 w-1/2  bg-white hover:bg-gray-300 text-black px-4 py-2 rounded shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                type="text"
                value={tokenId}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={handleInputChangeToken}
                placeholder="tokenId" />
              <button className="mt-4 w-5/6 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow"
                onClick={handlePass}
              >Pass Potato</button>

            </div>
          </div>
          <div className="w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4">
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
