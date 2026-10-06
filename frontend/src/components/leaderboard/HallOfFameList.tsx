import React from 'react'
import { Badge, Card, Skeleton } from '../ui'
import type { HallOfFameEntry } from '../../hooks/useLeaderboard'
import { formatEth } from '../../lib/game'
import AddressLink from './AddressLink'

interface HallOfFameListProps {
  entries: HallOfFameEntry[]
  isLoading: boolean
  className?: string
}

function Outcome({ entry }: { entry: HallOfFameEntry }) {
  if (entry.outcome === 'won' && entry.winner) {
    return (
      <>
        <div className="min-w-0 sm:flex-1">
          <span className="hidden lg:inline">
            <AddressLink address={entry.winner} />
          </span>
          <span className="lg:hidden">
            <AddressLink address={entry.winner} short />
          </span>
        </div>
        <p className="text-[15px] tnum sm:text-right">
          <span className="font-semibold text-fg">{formatEth(entry.prize)} ETH</span>{' '}
          <span className="text-fg-secondary">of {formatEth(entry.pot)}</span>
        </p>
      </>
    )
  }
  if (entry.outcome === 'live') {
    return (
      <>
        <div className="sm:flex-1">
          <Badge tone="success" dot pulse>
            In progress
          </Badge>
        </div>
        <p className="text-[15px] text-fg-secondary tnum sm:text-right">
          pot <span className="font-semibold text-fg">{formatEth(entry.pot)} ETH</span>
        </p>
      </>
    )
  }
  return <p className="text-[15px] text-fg-secondary sm:flex-1">Cancelled, pot rolled over</p>
}

/** Every round so far, newest first: who won and how much. */
export default function HallOfFameList({ entries, isLoading, className = '' }: HallOfFameListProps) {
  return (
    <Card variant="plain" className={`overflow-hidden ${className}`}>
      {isLoading ? (
        <ul>
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-4 w-24" />
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li
              key={entry.round}
              className="flex flex-col gap-1.5 border-t border-line px-4 py-4 first:border-t-0 sm:flex-row sm:items-center sm:gap-6 sm:px-5"
            >
              <p className="w-24 shrink-0 text-[15px] font-semibold tnum">Round {entry.round}</p>
              <Outcome entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
