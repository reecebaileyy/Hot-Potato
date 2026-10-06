import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isAddressEqual, type Address } from 'viem'
import AppShell from '../components/AppShell'
import { Button, ButtonLink, Card, SectionHeader, Segmented, Skeleton, Stat, StatRow } from '../components/ui'
import PlayersTable, {
  playerRowAttr,
  type RankedEntry,
  type SortDirection,
  type SortField,
} from '../components/leaderboard/PlayersTable'
import HallOfFameList from '../components/leaderboard/HallOfFameList'
import { useWalletAddress } from '../hooks/useWalletAddress'
import { compareEntries, useHallOfFame, useLeaderboard } from '../hooks/useLeaderboard'
import { chain, isGameConfigured } from '../config/chain'

type View = 'players' | 'rounds'

const VIEWS: { value: View; label: string }[] = [
  { value: 'players', label: 'Players' },
  { value: 'rounds', label: 'Hall of fame' },
]

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'wins', label: 'Wins' },
  { value: 'passes', label: 'Passes' },
  { value: 'fails', label: 'Fails' },
]

/** Rows shown before "Show more". */
const PAGE_SIZE = 50

/** Inset notice for errors (danger) and quiet states (neutral). */
function Notice({
  tone = 'neutral',
  action,
  children,
}: {
  tone?: 'neutral' | 'danger'
  action?: ReactNode
  children: ReactNode
}) {
  const colors = tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-surface-muted text-fg-secondary'
  return (
    <div className={`flex flex-col gap-3 rounded-2xl p-4 text-[15px] leading-6 sm:flex-row sm:items-center sm:justify-between ${colors}`}>
      <p>{children}</p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function scrollToPlayer(address: Address) {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-player="${playerRowAttr(address)}"]`)
  nodes.forEach((node) => node.scrollIntoView({ block: 'center', behavior: 'smooth' }))
}

export default function Leaderboard() {
  const [view, setView] = useState<View>('players')
  const [sortField, setSortField] = useState<SortField>('wins')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const pendingScroll = useRef<Address | null>(null)

  const address = useWalletAddress()
  const leaderboard = useLeaderboard()
  const hallOfFame = useHallOfFame()

  // Rank by wins, then passes (the hook's order); the sort controls only change the display order.
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
      fails: ranked.reduce((sum, entry) => sum + entry.fails, 0),
      rounds: hallOfFame.entries.filter((entry) => entry.outcome === 'won').length,
    }),
    [ranked, hallOfFame.entries],
  )

  const myIndex = useMemo(
    () => (address ? rows.findIndex((entry) => isAddressEqual(entry.address, address)) : -1),
    [rows, address],
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const findMe = () => {
    if (!address || myIndex < 0) return
    const needsMoreRows = myIndex >= visible
    if (view === 'players' && !needsMoreRows) {
      scrollToPlayer(address)
      return
    }
    // Reveal the row first; the effect below scrolls once it has rendered.
    pendingScroll.current = address
    if (view !== 'players') setView('players')
    if (needsMoreRows) setVisible(Math.ceil((myIndex + 1) / PAGE_SIZE) * PAGE_SIZE)
  }

  useEffect(() => {
    const target = pendingScroll.current
    if (!target) return
    pendingScroll.current = null
    scrollToPlayer(target)
  }, [view, visible])

  const isLoading = leaderboard.isLoading
  const error = isGameConfigured && leaderboard.error ? `Couldn't read the leaderboard from ${chain.name}.` : null
  const shown = rows.slice(0, visible)
  const hasMore = rows.length > shown.length

  const findMeTitle = !address
    ? 'Connect a wallet to find your row'
    : myIndex < 0
      ? 'You are not on the board yet'
      : undefined

  return (
    <AppShell
      title="Leaderboard: Hot Potato"
      description={`Hot Potato leaderboard and hall of fame, read live from the ${chain.name} contract.`}
      width="wide"
    >
      <div className="space-y-6 py-10 sm:py-14">
        {/* Title + view switch */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            size="lg"
            title="Leaderboard"
            description={`Lifetime stats for every address that has held a hand, read live from the ${chain.name} contract.`}
          />
          <Segmented options={VIEWS} value={view} onChange={setView} aria-label="Leaderboard view" className="shrink-0" />
        </div>

        {!isGameConfigured && (
          <Notice>
            No game to read on {chain.name}: NEXT_PUBLIC_GAME_ADDRESS is not set.
          </Notice>
        )}

        {/* Totals */}
        {isGameConfigured && (
          <Card>
            {isLoading ? (
              <StatRow>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="mt-2 h-7 w-16" />
                  </div>
                ))}
              </StatRow>
            ) : (
              <StatRow>
                <Stat label="Players" value={leaderboard.playerCount} />
                <Stat label="Passes" value={totals.passes} />
                <Stat label="Explosions" value={totals.fails} />
                <Stat label="Rounds won" value={totals.rounds} />
              </StatRow>
            )}
          </Card>
        )}

        {view === 'players' ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented
                  size="sm"
                  options={SORT_OPTIONS}
                  value={sortField}
                  onChange={(field) => {
                    setSortField(field)
                    setSortDirection('desc')
                  }}
                  aria-label="Sort by"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                  aria-label={sortDirection === 'desc' ? 'Sorted high to low' : 'Sorted low to high'}
                  leading={<span aria-hidden="true">{sortDirection === 'desc' ? '↓' : '↑'}</span>}
                >
                  {sortDirection === 'desc' ? 'High to low' : 'Low to high'}
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="ml-auto"
                onClick={findMe}
                disabled={!address || myIndex < 0 || isLoading}
                title={findMeTitle}
              >
                Find me
              </Button>
            </div>

            {error && (
              <Notice
                tone="danger"
                action={
                  <Button variant="secondary" size="sm" onClick={leaderboard.refetch}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Notice>
            )}

            {!error && isGameConfigured && (isLoading || rows.length > 0) && (
              <>
                <PlayersTable
                  rows={shown}
                  isLoading={isLoading}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  connected={address}
                />
                {!isLoading && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-fg-secondary tnum">
                      Showing {shown.length} of {rows.length} {rows.length === 1 ? 'player' : 'players'}
                      {leaderboard.playerCount !== rows.length && ` · ${leaderboard.playerCount} on the contract`}
                    </p>
                    {hasMore && (
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                          Show more
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setVisible(rows.length)}>
                          Show all
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {!error && isGameConfigured && !isLoading && rows.length === 0 && (
              <Card className="flex flex-col items-center py-12 text-center">
                <SectionHeader
                  size="md"
                  align="center"
                  title="No players yet"
                  description="Be the first to mint a hand and claim a spot on the board."
                />
                <ButtonLink href="/play" className="mt-6">
                  Play now
                </ButtonLink>
              </Card>
            )}
          </>
        ) : (
          <>
            {isGameConfigured && hallOfFame.error && (
              <Notice tone="danger">Couldn&apos;t read past rounds from {chain.name}.</Notice>
            )}

            {isGameConfigured && !hallOfFame.error && (hallOfFame.isLoading || hallOfFame.entries.length > 0) && (
              <>
                <HallOfFameList entries={hallOfFame.entries} isLoading={hallOfFame.isLoading} />
                {!hallOfFame.isLoading && (
                  <p className="text-[13px] text-fg-secondary tnum">
                    {hallOfFame.entries.length} {hallOfFame.entries.length === 1 ? 'round' : 'rounds'} so far · winners take
                    40% of the pot
                  </p>
                )}
              </>
            )}

            {isGameConfigured && !hallOfFame.error && !hallOfFame.isLoading && hallOfFame.entries.length === 0 && (
              <Card className="flex flex-col items-center py-12 text-center">
                <SectionHeader
                  size="md"
                  align="center"
                  title="No rounds yet"
                  description="The first round's winner will show up here the moment it ends."
                />
                <ButtonLink href="/play" className="mt-6">
                  Play now
                </ButtonLink>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
