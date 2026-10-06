import React from 'react'
import { isAddressEqual, type Address } from 'viem'
import { Badge, Card, Skeleton } from '../ui'
import type { LeaderboardEntry } from '../../hooks/useLeaderboard'
import AddressLink from './AddressLink'

export type SortField = 'wins' | 'passes' | 'fails'
export type SortDirection = 'asc' | 'desc'

export interface RankedEntry extends LeaderboardEntry {
  rank: number
}

interface PlayersTableProps {
  rows: RankedEntry[]
  isLoading: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  /** The connected wallet; its row is highlighted. */
  connected?: Address
  className?: string
}

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'wins', label: 'Wins' },
  { field: 'passes', label: 'Passes' },
  { field: 'fails', label: 'Fails' },
]

/** Data attribute used by "Find me" to scroll to the connected player's row. */
export function playerRowAttr(address: string) {
  return address.toLowerCase()
}

function Rank({ rank }: { rank: number }) {
  if (rank === 1) return <Badge tone="accent">#1</Badge>
  if (rank <= 3) return <Badge tone="neutral">#{rank}</Badge>
  return <span className="text-[13px] text-fg-secondary tnum">#{rank}</span>
}

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      <div className="hidden sm:block">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-line px-5 py-4">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="ml-auto h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
      <div className="sm:hidden">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="space-y-2 border-t border-line px-4 py-3 first:border-t-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </>
  )
}

/** Lifetime stats table (desktop) that collapses to a two-line list on phones. */
export default function PlayersTable({
  rows,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  connected,
  className = '',
}: PlayersTableProps) {
  const isYou = (address: Address) => !!connected && isAddressEqual(address, connected)

  const header = (
    <thead>
      <tr className="text-[12px] font-medium uppercase tracking-wide text-fg-secondary">
        <th scope="col" className="px-5 py-3 text-left font-medium">
          Rank
        </th>
        <th scope="col" className="px-5 py-3 text-left font-medium">
          Player
        </th>
        {COLUMNS.map(({ field, label }) => {
          const active = sortField === field
          return (
            <th
              key={field}
              scope="col"
              aria-sort={active ? (sortDirection === 'desc' ? 'descending' : 'ascending') : 'none'}
              className="px-5 py-3 text-right font-medium"
            >
              <button
                type="button"
                onClick={() => onSort(field)}
                className={`inline-flex h-6 items-center gap-1 rounded-md uppercase tracking-wide transition-colors duration-200 ease-apple hover:text-fg ${
                  active ? 'text-fg' : ''
                }`}
              >
                {label}
                <span aria-hidden="true" className={`w-3 text-center ${active ? '' : 'text-fg-tertiary'}`}>
                  {active ? (sortDirection === 'desc' ? '↓' : '↑') : '↕'}
                </span>
              </button>
            </th>
          )
        })}
      </tr>
    </thead>
  )

  return (
    <Card variant="plain" className={`overflow-hidden ${className}`}>
      {isLoading ? (
        <>
          <div className="hidden sm:block">
            <table className="w-full">{header}</table>
          </div>
          <SkeletonRows />
        </>
      ) : (
        <>
          {/* Desktop: a table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              {header}
              <tbody>
                {rows.map((entry) => {
                  const you = isYou(entry.address)
                  return (
                    <tr
                      key={entry.address}
                      data-player={playerRowAttr(entry.address)}
                      className={`border-t border-line transition-colors duration-200 ease-apple ${
                        you ? 'bg-accent-soft' : 'hover:bg-surface-muted'
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Rank rank={entry.rank} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="hidden lg:inline">
                          <AddressLink address={entry.address} />
                        </span>
                        <span className="lg:hidden">
                          <AddressLink address={entry.address} short />
                        </span>
                        {you && <span className="ml-2 text-[12px] font-medium text-accent">You</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right text-[15px] font-semibold tnum">
                        {entry.wins}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right text-[15px] tnum">{entry.passes}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right text-[15px] tnum text-fg-secondary">
                        {entry.fails}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phones: the same rows as a two-line list */}
          <ul className="sm:hidden">
            {rows.map((entry) => {
              const you = isYou(entry.address)
              return (
                <li
                  key={entry.address}
                  data-player={playerRowAttr(entry.address)}
                  className={`border-t border-line px-4 py-3 first:border-t-0 ${you ? 'bg-accent-soft' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Rank rank={entry.rank} />
                    <AddressLink address={entry.address} short className="min-w-0" />
                    {you && <span className="text-[12px] font-medium text-accent">You</span>}
                  </div>
                  <p className="mt-1 text-[13px] text-fg-secondary tnum">
                    <span className="font-semibold text-fg">{entry.wins}</span> {entry.wins === 1 ? 'win' : 'wins'} ·{' '}
                    {entry.passes} {entry.passes === 1 ? 'pass' : 'passes'} · {entry.fails}{' '}
                    {entry.fails === 1 ? 'fail' : 'fails'}
                  </p>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Card>
  )
}
