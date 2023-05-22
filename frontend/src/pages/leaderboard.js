import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { Web3Button } from '@web3modal/react'
import { leaderboardData } from '../dummy/dummy' // import dummy data

export default function Home() {

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const [sortKey, setSortKey] = useState('successfulPasses'); // or 'totalWins'
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchAddress, setSearchAddress] = useState("");
  const itemsPerPage = 20; // Number of items per page

  const sortedLeaderboardData = [...leaderboardData].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedLeaderboardData.length / itemsPerPage);
  const paginatedData = sortedLeaderboardData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const searchedData = sortedLeaderboardData.filter(player => player.address.includes(searchAddress));

  const handleClickPage = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchAddress(e.target.value);
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

        <div className="mt-5 sm:mt-10 flex justify-center items-center p-4 sm:p-0 sm:py-5 md:py-5 min-w-screen">
          <div className="bg-white rounded shadow-lg p-5 sm:p-0 mx-2 sm:mx-0">
            <div className='grid lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 sm:grid-rows-2 items-center sm:justify-items-center md:justify-items-center content-center'>
              <h2 className="text-xl sm:text-3xl mb-5">Leaderboard</h2>
              <input type="text" value={searchAddress} onChange={handleSearch} placeholder="Search by Address" className='w-full sm:w-auto p-2 mt-2 sm:mt-0 rounded-lg' />
            </div>
            <div className="flex 3xl:justify-end 2xl:justify-end xl:justify-end lg:justify-end md:justify-center sm:justify-center mb-4 sm:justify-items-center sm:items-center">
              <button onClick={() => setSortKey('successfulPasses')} className="mr-4">Sort by Passes</button>
              <button onClick={() => setSortKey('totalWins')} className="mr-4">Sort by Wins</button>
              <button onClick={() => setSortAsc(!sortAsc)}>Sort {sortAsc ? 'Descending' : 'Ascending'}</button>
            </div>
            <div className='overflow-auto'>
              <table className="table-auto w-full min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 sm:px-0 md:px-0 text-left sm:text-center md:text-center sm:text-xs md:text-xs">Player Address</th>
                    <th className="px-4 py-2 sm:px-0 md:px-0 text-left sm:text-xs md:text-xs">Passes</th>
                    <th className="px-4 py-2 sm:px-0 md:px-0 text-left sm:text-xs md:text-xs">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData
                    .filter((player) => searchAddress ? player.address.includes(searchAddress) : true)
                    .map((player, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                        <td className="px-4 py-2 sm:px-0 border sm:text-xs">{player.address}</td>
                        <td className="px-4 py-2 sm:px-0 border sm:text-xs">{player.successfulPasses}</td>
                        <td className="px-4 py-2 sm:px-0 border sm:text-xs">{player.totalWins}</td>
                      </tr>
                    ))}
                </tbody>


              </table>
            </div>
            <div className="mt-4 flex justify-between">
              {currentPage > 1 && <button onClick={() => setCurrentPage(old => Math.max(old - 1, 1))}>Previous</button>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => handleClickPage(page)}>{page}</button>
              ))}
              {currentPage < totalPages && <button onClick={() => setCurrentPage(old => Math.min(old + 1, totalPages))}>Next</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
