import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useState, useRef, useEffect } from 'react'
import { Web3Button } from '@web3modal/react'
import blacklogo from '../../public/assets/images/BlackLogo.png'
import redlogo from '../../public/assets/images/RedLogo.png'



export default function Home() {

  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const [sortKey, setSortKey] = useState('successfulPasses');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchAddress, setSearchAddress] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch('/api/get-leaderboard')
      .then(response => response.json())
      .then(data => {
        console.log('Data from API:', data);
        const sortedData = data.Leaderboard.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
          return 0;
        });
        console.log('Sorted data:', sortedData);
        setLeaderboardData(sortedData);
      })
      .catch(console.error);
  }, [sortKey, sortAsc]);
  

  const sortedLeaderboardData = [...leaderboardData].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
    return 0;
  });

  console.log('Sorted data:', sortedLeaderboardData);

  const totalPages = Math.ceil(sortedLeaderboardData.length / itemsPerPage);
  const paginatedData = leaderboardData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClickPage = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchAddress(e.target.value);
  };

  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode');
    if (localDarkMode) {
      setDarkMode(JSON.parse(localDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);


  return (

    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hodl, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${darkMode ? 'bg-gradient-to-br from-amber-800 via-red-800 to-black text-white min-h-screen font-darumadrop' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 min-h-screen font-darumadrop'}`}>
        <nav className="py-2 pt-10 px-5 md:px-10 flex justify-between items-center relative z-20">
          <Link href='/'>
            <Image src={blacklogo} width={150} alt="Logo" />
          </Link>
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
              <ul ref={menuRef} className={`${darkMode ? 'bg-gray-700 to-black text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl' : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'}`}>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/play">Play</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/leaderboard">Leaderboard</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://app.gitbook.com" target="_blank">Docs</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  size={30}
                />
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://app.gitbook.com" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='flex gap-2 items-center sm:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>

        <div className={`mt-5 sm:mt-10 flex justify-center items-center p-4 sm:p-0 sm:py-5 md:py-5 min-w-screen`}>
          <div className={`${darkMode ? 'bg-black' : 'bg-white'} rounded-xl shadow-lg p-5 sm:p-0 mx-2 sm:mx-0`}>
            <div className='grid lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 sm:grid-rows-2 items-center sm:justify-items-center md:justify-items-center content-center'>
              <h2 className={`text-xl sm:text-3xl mb-5 ${darkMode ? 'text-white' : 'text-black'}`}>Leaderboard</h2>
              <input type="text" value={searchAddress} onChange={handleSearch} placeholder="Search by Address" className={`w-full sm:w-auto p-2 mt-2 sm:mt-0 rounded-lg ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-white'}`} />
            </div>
            <div className="flex 3xl:justify-end 2xl:justify-end xl:justify-end lg:justify-end md:justify-center sm:justify-center mb-4 sm:justify-items-center sm:items-center">
              <button onClick={() => { setSortKey('passes'); console.log('Sorting by passes...') }} className={`mr-4 ${darkMode ? 'text-white' : 'text-black'}`}>Sort by Passes</button>
              <button onClick={() => { setSortKey('wins'); console.log('Sorting by wins...') }} className={`mr-4 ${darkMode ? 'text-white' : 'text-black'}`}>Sort by Wins</button>
              <button onClick={() => { setSortAsc(!sortAsc); console.log('Toggling sort direction...') }} className={`mr-4 ${darkMode ? 'text-white' : 'text-black'}`}>Sort {sortAsc ? 'Descending' : 'Ascending'}</button>
            </div>
            <div className='overflow-auto'>
              <table className="table-auto w-full min-w-full">
                <thead>
                  <tr>
                    <th className={`px-4 py-2 sm:px-0 md:px-0 text-center sm:text-center md:text-center sm:text-xs md:text-xs ${darkMode ? 'text-white' : 'text-black'}`}>Rank</th>
                    <th className={`px-4 py-2 sm:px-0 md:px-0 text-center sm:text-center md:text-center sm:text-xs md:text-xs ${darkMode ? 'text-white' : 'text-black'}`}>Player Address</th>
                    <th className={`px-4 py-2 sm:px-0 md:px-0 text-center sm:text-xs md:text-xs ${darkMode ? 'text-white' : 'text-black'}`}>Passes</th>
                    <th className={`px-4 py-2 sm:px-0 md:px-0 text-center sm:text-xs md:text-xs ${darkMode ? 'text-white' : 'text-black'}`}>Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData
                    .filter((player) => searchAddress ? player.address.includes(searchAddress) : true)
                    .map((player, index) => (
                      <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}>
                        <td className={`px-4 py-2 sm:px-0 border sm:text-xs text-center ${darkMode ? 'text-white' : 'text-black'}`}>{index + 1}</td>
                        <td className={`px-4 py-2 sm:px-0 border sm:text-xs text-center ${darkMode ? 'text-white' : 'text-black'}`}>{player.address}</td>
                        <td className={`px-4 py-2 sm:px-0 border sm:text-xs text-center ${darkMode ? 'text-white' : 'text-black'}`}>{player.passes}</td>
                        <td className={`px-4 py-2 sm:px-0 border sm:text-xs text-center ${darkMode ? 'text-white' : 'text-black'}`}>{player.wins}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between">
              {currentPage > 1 && <button onClick={() => setCurrentPage(old => Math.max(old - 1, 1))} className={`mr-4 ${darkMode ? 'text-white' : 'text-black'}`}>Previous</button>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => handleClickPage(page)} className={`mr-4 ${darkMode ? 'text-white' : 'text-black'}`}>{page}</button>
              ))}
              {currentPage < totalPages && <button onClick={() => setCurrentPage(old => Math.min(old + 1, totalPages))} className={`mr-4 ${darkMode ? 'text-white' : 'text-black'}`}>Next</button>}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
