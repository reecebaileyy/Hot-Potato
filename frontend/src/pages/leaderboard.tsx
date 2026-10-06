import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { isAddressEqual } from 'viem'
import Navigation from '../components/Navigation'
import { formatAddress } from '../utils/formatAddress'
import { useDarkMode } from '../hooks/useDarkMode'
import { useWalletAddress } from '../hooks/useWalletAddress'
import {
  compareEntries,
  useHallOfFame,
  useLeaderboard,
  type HallOfFameEntry,
  type LeaderboardEntry,
} from '../hooks/useLeaderboard'
import { chain, explorerAddressUrl, isGameConfigured } from '../config/chain'
import { formatEth } from '../lib/game'

type SortField = 'wins' | 'passes' | 'fails'
type SortDirection = 'asc' | 'desc'

interface RankedEntry extends LeaderboardEntry {
  rank: number
}

function AddressLink({ address, short = false }: { address: string; short?: boolean }) {
  const href = explorerAddressUrl(address)
  const label = short ? formatAddress(address) : address
  if (!href) return <span title={address}>{label}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={address} className="hover:underline">
      {label}
    </a>
  )
}

function rankBadge(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function HallOfFame({ darkMode, entries }: { darkMode: boolean; entries: HallOfFameEntry[] }) {
  const muted = darkMode ? 'text-gray-400' : 'text-gray-600'
  return (
    <div className={`${darkMode ? 'card-dark' : 'card'} p-6 sm:p-8 shadow-2xl`}>
      <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-6">👑 Hall of Fame</h2>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.round}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl px-4 py-3 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}
          >
            <span className="font-bold text-lg">Round {entry.round}</span>
            {entry.outcome === 'won' && entry.winner ? (
              <>
                <span className="font-mono text-sm sm:text-base">
                  <span className="hidden md:inline">
                    <AddressLink address={entry.winner} />
                  </span>
                  <span className="md:hidden">
                    <AddressLink address={entry.winner} short />
                  </span>
                </span>
                <span className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
                  {formatEth(entry.prize)} ETH <span className={`font-normal ${muted}`}>of {formatEth(entry.pot)}</span>
                </span>
              </>
            ) : entry.outcome === 'live' ? (
              <span className="text-amber-500 font-semibold">In progress · pot {formatEth(entry.pot)} ETH</span>
            ) : (
              <span className={muted}>Cancelled, pot rolled over</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Leaderboard() {
  const [darkMode, setDarkMode] = useDarkMode()
  const [isOpen, setIsOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('wins')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const address = useWalletAddress()

  const leaderboard = useLeaderboard()
  const hallOfFame = useHallOfFame()

  // Rank by wins, then passes (the hook's order); the column sort only changes the display order.
  const ranked = useMemo<RankedEntry[]>(
    () => leaderboard.entries.map((entry, i) => ({ ...entry, rank: i + 1 })),
    [leaderboard.entries],
  )

  const rows = useMemo(() => {
    const sign = sortDirection === 'desc' ? -1 : 1
    return [...ranked].sort((a, b) => sign * (a[sortField] - b[sortField]) || compareEntries(a, b))
  }, [ranked, sortField, sortDirection])

  const totals = useMemo(
    () => ({
      passes: ranked.reduce((sum, entry) => sum + entry.passes, 0),
      rounds: hallOfFame.entries.filter((entry) => entry.outcome === 'won').length,
    }),
    [ranked, hallOfFame.entries],
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>
    return sortDirection === 'desc' ? <span>↓</span> : <span>↑</span>
  }

  const isLoading = leaderboard.isLoading
  const error = !isGameConfigured
    ? 'NEXT_PUBLIC_GAME_ADDRESS is not set, so there is no game to read.'
    : leaderboard.error
      ? `Couldn't read the leaderboard from ${chain.name}.`
      : null

  const sortableHeader = (field: SortField, label: string) => (
    <th
      className="px-4 py-4 text-center text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => handleSort(field)}
      aria-sort={sortField === field ? (sortDirection === 'desc' ? 'descending' : 'ascending') : 'none'}
    >
      <div className="flex items-center justify-center space-x-2">
        <span>{label}</span>
        {sortIcon(field)}
      </div>
    </th>
  )

  return (
    <>
      <Head>
        <title>Leaderboard - Onchain Hot Potato</title>
        <meta name="description" content="Hot Potato leaderboard and hall of fame, read live from the chain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${darkMode ? 'darkmode text-white' : 'normal'} bg-fixed min-h-screen font-darumadropone`}>
        <Navigation darkMode={darkMode} setDarkMode={setDarkMode} isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">🏆 LEADERBOARD 🏆</h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
                Lifetime stats from the {chain.name} contract. Click a column to sort.
              </p>
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500" />
                <p className="mt-4 text-xl">Loading leaderboard...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className={`${darkMode ? 'card-dark' : 'card'} p-8 text-center`}>
                <p className="text-red-500 text-xl mb-4">⚠️ {error}</p>
                {isGameConfigured && (
                  <button onClick={leaderboard.refetch} className="btn-primary px-6 py-3">
                    Retry
                  </button>
                )}
              </div>
            )}

            {!isLoading && !error && rows.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${darkMode ? 'card-dark' : 'card'} p-6 text-center`}>
                    <p className="text-3xl font-bold gradient-text">{leaderboard.playerCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Players</p>
                  </div>
                  <div className={`${darkMode ? 'card-dark' : 'card'} p-6 text-center`}>
                    <p className="text-3xl font-bold gradient-text">{totals.passes}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Successful Passes</p>
                  </div>
                  <div className={`${darkMode ? 'card-dark' : 'card'} p-6 text-center`}>
                    <p className="text-3xl font-bold gradient-text">{totals.rounds}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Rounds Won</p>
                  </div>
                </div>

                <div className={`${darkMode ? 'card-dark' : 'card'} overflow-hidden shadow-2xl`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                        <tr>
                          <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                            Player
                          </th>
                          {sortableHeader('wins', 'Wins')}
                          {sortableHeader('passes', 'Passes')}
                          {sortableHeader('fails', 'Fails')}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {rows.map((entry, index) => {
                          const isYou = !!address && isAddressEqual(entry.address, address)
                          const stripe =
                            index % 2 === 0
                              ? darkMode
                                ? 'bg-gray-900'
                                : 'bg-white'
                              : darkMode
                                ? 'bg-gray-800'
                                : 'bg-gray-50'
                          return (
                            <tr
                              key={entry.address}
                              className={`${stripe} ${isYou ? 'ring-2 ring-inset ring-amber-500' : ''} hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors`}
                            >
                              <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base font-bold">
                                {rankBadge(entry.rank)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base font-mono">
                                <span className="hidden sm:inline">
                                  <AddressLink address={entry.address} />
                                </span>
                                <span className="sm:hidden">
                                  <AddressLink address={entry.address} short />
                                </span>
                                {isYou && <span className="ml-2 text-amber-500 font-sans font-bold">(you)</span>}
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
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!isLoading && !error && rows.length === 0 && (
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

            {hallOfFame.entries.length > 0 && <HallOfFame darkMode={darkMode} entries={hallOfFame.entries} />}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/play"
                className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-xl"
              >
                🎮 Play Game
              </Link>
              <Link
                href="/"
                className="btn-outline text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto border-2"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
