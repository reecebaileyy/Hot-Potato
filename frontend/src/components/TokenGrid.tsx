import React, { useState } from 'react'
import type { Address } from 'viem'
import HandImage from './HandImage'
import { Badge, Button, Card, CardHeader, Input, Segmented, Skeleton } from './ui'
import { useHandImages } from '../hooks/useHandImages'
import { useTokenManagement } from '../hooks/useTokenManagement'
import type { GameInfo } from '../hooks/useGame'

interface TokenGridProps {
  title: string
  subtitle: string
  tokenIds: number[]
  isLoading: boolean
  info: GameInfo | undefined
  metadataHandler: Address | undefined
}

type Sort = 'none' | 'asc' | 'desc'

const SORT_OPTIONS = [
  { value: 'asc' as const, label: 'Low to high' },
  { value: 'desc' as const, label: 'High to low' },
]

function Tiles({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3 lg:grid-cols-8">{children}</div>
}

/** Paginated, sortable, searchable grid of the hands in the round. */
export default function TokenGrid({ title, subtitle, tokenIds, isLoading, info, metadataHandler }: TokenGridProps) {
  const {
    currentPage,
    setCurrentPage,
    searchId,
    setSearchId,
    paginationData,
    sortTokensAsc,
    sortTokensDesc,
    handleSearch,
  } = useTokenManagement(tokenIds)
  const [sort, setSort] = useState<Sort>('none')
  const images = useHandImages(paginationData.currentTokens, info, metadataHandler)
  const potatoTokenId = Number(info?.potatoTokenId ?? 0n)

  const onSort = (value: Sort) => {
    setSort(value)
    if (value === 'asc') sortTokensAsc()
    if (value === 'desc') sortTokensDesc()
  }

  const { currentTokens, pageCount, pages } = paginationData

  return (
    <Card>
      <CardHeader
        title={
          <>
            {title}
            {!isLoading && <span className="ml-2 font-medium text-fg-tertiary tnum">{tokenIds.length}</span>}
          </>
        }
        subtitle={subtitle}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="min-w-0 flex-1">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Search by hand #"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              aria-label="Search by hand id"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <Segmented size="sm" options={SORT_OPTIONS} value={sort} onChange={onSort} aria-label="Sort hands" className="h-10 self-start sm:self-auto" />
      </div>

      {isLoading ? (
        <Tiles>
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </Tiles>
      ) : tokenIds.length === 0 ? (
        <p className="py-6 text-center text-[15px] leading-6 text-fg-secondary">No hands yet. They appear here once minted.</p>
      ) : currentTokens.length === 0 ? (
        <p className="py-6 text-center text-[15px] leading-6 text-fg-secondary">No hand matches that id. Clear the search to see them all.</p>
      ) : (
        <Tiles>
          {currentTokens.map((tokenId) => {
            const potato = tokenId === potatoTokenId
            return (
              <div
                key={tokenId}
                className={`rounded-2xl bg-surface-muted p-1.5 sm:p-2 ${potato ? 'ring-2 ring-accent' : ''}`}
              >
                <HandImage tokenId={tokenId} image={images.get(tokenId)} isPotato={potato} />
                <div className="mt-1 flex justify-center">
                  {potato ? (
                    <Badge tone="accent" dot pulse>
                      #{tokenId}
                    </Badge>
                  ) : (
                    <span className="text-[12px] leading-6 font-medium text-fg-secondary tnum">#{tokenId}</span>
                  )}
                </div>
              </div>
            )
          })}
        </Tiles>
      )}

      {!isLoading && pageCount > 1 && (
        <nav className="mt-5 flex flex-wrap items-center justify-center gap-1" aria-label="Pages">
          <Button variant="ghost" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'secondary' : 'ghost'}
              onClick={() => setCurrentPage(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className="min-w-10 tnum"
            >
              {page}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === pageCount}>
            Next
          </Button>
          <span className="ml-2 text-[13px] leading-5 text-fg-secondary tnum">
            Page {currentPage} of {pageCount}
          </span>
        </nav>
      )}
    </Card>
  )
}
