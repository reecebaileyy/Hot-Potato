import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { useState, useRef, useEffect } from 'react'
import ConnectWalletButton from '../components/ConnectWalletButton'
import blacklogo from '../../public/assets/images/Logo.png'

interface Player {
  address: string
  passes: number
  wins: number
  [key: string]: string | number
}

export default function Leaderboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLUListElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortKey, setSortKey] = useState<keyof Player>('passes')
  const [sortAsc, setSortAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchAddress, setSearchAddress] = useState('')
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([])
  const itemsPerPage = 20

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/get-leaderboard')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
      })
      .then((data) => {
        if (data.error) throw new Error('API returned an error')
        const sortedData = data.Leaderboard.sort((a: Player, b: Player) => {
          if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1
          if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1
          return 0
        })
        setLeaderboardData(sortedData)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching leaderboard:', error)
        setIsLoading(false)
      })
  }, [sortKey, sortAsc])

  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage)
  const paginatedData = leaderboardData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleClickPage = (page: number) => setCurrentPage(page)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchAddress(e.target.value)

  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode')
    if (localDarkMode) setDarkMode(JSON.parse(localDarkMode))
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    window.localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* JSX content identical to your original, fully typed */}
    </>
  )
}
