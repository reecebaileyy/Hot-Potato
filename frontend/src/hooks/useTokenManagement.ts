import { useState, useCallback, useMemo } from 'react'

export function useTokenManagement() {
  const [activeTokens, setActiveTokens] = useState<number[]>([])
  const [explodedTokens, setExplodedTokens] = useState<number[]>([])
  const [sortedTokens, setSortedTokens] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(64)
  const [searchId, setSearchId] = useState<string>('')
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(false)

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const indexOfLastToken = currentPage * itemsPerPage
    const indexOfFirstToken = indexOfLastToken - itemsPerPage
    const currentTokens = sortedTokens?.slice(indexOfFirstToken, indexOfLastToken)
    const pageCount = Math.ceil(sortedTokens.length / itemsPerPage)
    const maxPageNumbersToShow = 3

    let startPage = Math.max(currentPage - Math.floor(maxPageNumbersToShow / 2), 1)
    let endPage = Math.min(startPage + maxPageNumbersToShow - 1, pageCount)

    if (endPage - startPage < maxPageNumbersToShow && startPage > 1) {
      startPage = endPage - maxPageNumbersToShow + 1
    }

    const pages = [...Array(endPage + 1 - startPage).keys()].map((i) => startPage + i)
    
    return {
      currentTokens,
      pageCount,
      pages,
      startPage,
      endPage
    }
  }, [currentPage, itemsPerPage, sortedTokens])

  const sortTokensAsc = useCallback(() => {
    const sorted = [...activeTokens].sort((a, b) => a - b)
    setSortedTokens(sorted)
  }, [activeTokens])

  const sortTokensDesc = useCallback(() => {
    const sorted = [...activeTokens].sort((a, b) => b - a)
    setSortedTokens(sorted)
  }, [activeTokens])

  const handleTokenExploded = useCallback((tokenId: number) => {
    setExplodedTokens((prev) => [...prev, tokenId])
  }, [])

  const refreshAllImages = useCallback(() => {
    setShouldRefresh((prev) => !prev)
  }, [])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchId) {
      setCurrentPage(1)
      const filtered = activeTokens.filter(token => token.toString().includes(searchId))
      setSortedTokens(filtered)
    }
  }, [searchId, activeTokens])

  return {
    activeTokens,
    setActiveTokens,
    explodedTokens,
    sortedTokens,
    setSortedTokens,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    searchId,
    setSearchId,
    shouldRefresh,
    setShouldRefresh,
    paginationData,
    sortTokensAsc,
    sortTokensDesc,
    handleTokenExploded,
    refreshAllImages,
    handleSearch
  }
}
