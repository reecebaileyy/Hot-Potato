import { useCallback, useMemo, useState } from 'react'

const ITEMS_PER_PAGE = 64
const MAX_PAGE_BUTTONS = 3

type SortOrder = 'none' | 'asc' | 'desc'

/** Sorting, search and pagination over a list of token ids. */
export function useTokenManagement(tokenIds: number[]) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')
  const [searchId, setSearchId] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [requestedPage, setCurrentPage] = useState(1)

  const visibleTokens = useMemo(() => {
    const filtered = appliedSearch
      ? tokenIds.filter((id) => id.toString().includes(appliedSearch))
      : tokenIds
    if (sortOrder === 'none') return filtered
    return [...filtered].sort((a, b) => (sortOrder === 'asc' ? a - b : b - a))
  }, [tokenIds, appliedSearch, sortOrder])

  const pageCount = Math.max(1, Math.ceil(visibleTokens.length / ITEMS_PER_PAGE))
  // Clamp instead of resetting state when the list shrinks (e.g. hands exploding).
  const currentPage = Math.min(requestedPage, pageCount)

  const paginationData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const currentTokens = visibleTokens.slice(start, start + ITEMS_PER_PAGE)
    let startPage = Math.max(currentPage - Math.floor(MAX_PAGE_BUTTONS / 2), 1)
    const endPage = Math.min(startPage + MAX_PAGE_BUTTONS - 1, pageCount)
    startPage = Math.max(1, Math.min(startPage, endPage - MAX_PAGE_BUTTONS + 1))
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
    return { currentTokens, pageCount, pages }
  }, [currentPage, pageCount, visibleTokens])

  const sortTokensAsc = useCallback(() => setSortOrder('asc'), [])
  const sortTokensDesc = useCallback(() => setSortOrder('desc'), [])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setCurrentPage(1)
      setAppliedSearch(searchId.trim())
    },
    [searchId],
  )

  return {
    currentPage,
    setCurrentPage,
    searchId,
    setSearchId,
    paginationData,
    sortTokensAsc,
    sortTokensDesc,
    handleSearch,
  }
}

export type TokenManagement = ReturnType<typeof useTokenManagement>
