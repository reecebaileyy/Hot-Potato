import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { formatAddress } from '../utils/formatAddress'

interface LeaderboardEntry {
  id: string
  address: string
  wins: number
  passes: number
  fails: number
}

type SortField = 'wins' | 'passes' | 'fails'
type SortDirection = 'asc' | 'desc'

export default function Leaderboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [sortedData, setSortedData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('wins')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode')
    if (localDarkMode) setDarkMode(JSON.parse(localDarkMode))
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    window.localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/get-leaderboard')
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }
        
        const data = await response.json()
        setLeaderboardData(data.Leaderboard || [])
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Sort data whenever sortField, sortDirection, or leaderboardData changes
  useEffect(() => {
    const sorted = [...leaderboardData].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (sortDirection === 'desc') {
        return bValue - aValue
      } else {
        return aValue - bValue
      }
    })
    
    setSortedData(sorted)
  }, [leaderboardData, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      // New field, default to descending
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>
    }
    return sortDirection === 'desc' ? <span>↓</span> : <span>↑</span>
  }

  return (
    <>
      <Head>
        <title>Leaderboard - Onchain Hot Potato</title>
        <meta name="description" content="Hot Potato Game Leaderboard - See the top players" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${
          darkMode
            ? 'darkmode bg-fixed to-black text-white min-h-screen font-darumadropone'
            : 'normal bg-fixed min-h-screen font-darumadropone'
        }`}
      >
        <Navigation 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
        />

        {/* Main Content */}
        <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">
                🏆 LEADERBOARD 🏆
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
                Top Hot Potato Players - Click column headers to sort
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
                <p className="mt-4 text-xl">Loading leaderboard...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center`}>
                <p className="text-red-500 text-xl mb-4">⚠️ {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-primary px-6 py-3"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Leaderboard Table */}
            {!isLoading && !error && sortedData.length > 0 && (
              <div className={`${darkMode ? 'card-dark' : 'card'} overflow-hidden shadow-2xl`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                      <tr>
                        <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                          Address
                        </th>
                        <th 
                          className="px-4 py-4 text-center text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => handleSort('wins')}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>Wins</span>
                            {getSortIcon('wins')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-4 text-center text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => handleSort('passes')}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>Passes</span>
                            {getSortIcon('passes')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-4 text-center text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => handleSort('fails')}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>Fails</span>
                            {getSortIcon('fails')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {sortedData.map((entry, index) => (
                        <tr 
                          key={entry.id}
                          className={`${
                            index % 2 === 0 
                              ? darkMode ? 'bg-gray-900' : 'bg-white'
                              : darkMode ? 'bg-gray-800' : 'bg-gray-50'
                          } hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base font-bold">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `#${index + 1}`}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base font-mono">
                            <span className="hidden sm:inline">{entry.address}</span>
                            <span className="sm:hidden">{formatAddress(entry.address)}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
                            {entry.wins}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                            {entry.passes}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm sm:text-base font-bold text-red-600 dark:text-red-400">
                            {entry.fails}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && sortedData.length === 0 && (
              <div className={`${darkMode ? 'card-dark' : 'card'} p-12 text-center`}>
                <p className="text-2xl mb-4">🎮 No players yet!</p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to play and claim your spot on the leaderboard!
                </p>
                <Link href="/play" className="btn-primary text-xl px-8 py-4 inline-block">
                  Start Playing
                </Link>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link href="/play" className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-xl">
                🎮 Play Game
              </Link>
              <Link href="/" className="btn-outline text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto border-2">
                🏠 Back to Home
              </Link>
            </div>

            {/* Stats Summary */}
            {!isLoading && !error && sortedData.length > 0 && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${darkMode ? 'card-dark' : 'card'} p-6 text-center`}>
                  <p className="text-3xl font-bold gradient-text">{sortedData.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Players</p>
                </div>
                <div className={`${darkMode ? 'card-dark' : 'card'} p-6 text-center`}>
                  <p className="text-3xl font-bold gradient-text">
                    {sortedData.reduce((sum, entry) => sum + entry.passes, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Passes</p>
                </div>
                <div className={`${darkMode ? 'card-dark' : 'card'} p-6 text-center`}>
                  <p className="text-3xl font-bold gradient-text">
                    {sortedData.reduce((sum, entry) => sum + entry.wins, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Wins</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
