import React from 'react'
import { Card } from '../ui'

/** Mirrors the basis points in Game._finishRound (and lib/game.ts winnerPrize). */
const SPLIT = [
  { label: 'Winner', percent: 40, swatch: 'bg-accent' },
  { label: 'Project', percent: 10, swatch: 'bg-fg' },
  { label: 'Team', percent: 30, swatch: 'bg-fg-secondary' },
  { label: 'Charity', percent: 20, swatch: 'bg-fg-tertiary' },
] as const

/** A stacked bar of where each round's pot goes, with a legend. */
export default function PrizeSplit({ className = '' }: { className?: string }) {
  return (
    <Card className={`mx-auto w-full max-w-3xl ${className}`}>
      <div
        role="img"
        aria-label="Pot split: winner 40%, project 10%, team 30%, charity 20%"
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
      >
        {SPLIT.map((segment) => (
          <div
            key={segment.label}
            className={`${segment.swatch} h-full rounded-full`}
            style={{ width: `${segment.percent}%` }}
          />
        ))}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {SPLIT.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2.5">
            <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment.swatch}`} />
            <span className="text-[15px] text-fg">{segment.label}</span>
            <span className="ml-auto text-[15px] font-semibold tracking-tight tnum">{segment.percent}%</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-line pt-5 text-[13px] leading-5 text-fg-secondary">
        Payouts are pull-based: every share sits in the contract until its owner claims it from the play page.
      </p>
    </Card>
  )
}
