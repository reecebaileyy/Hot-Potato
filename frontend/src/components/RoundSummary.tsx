import React from 'react'
import { Badge, SectionHeader, Skeleton, Stat, StatRow } from './ui'
import { GameState, formatEth, gameStateLabel, isLiveState } from '../lib/game'
import type { GameInfo } from '../hooks/useGame'

interface RoundSummaryProps {
  info: GameInfo | undefined
}

/** Headline copy and the status badge for each game state. */
function describeState(state: number | undefined): { title: string; badge: React.ReactNode } {
  switch (state) {
    case GameState.Minting:
      return {
        title: 'Minting is open',
        badge: (
          <Badge tone="success" dot>
            Minting
          </Badge>
        ),
      }
    case GameState.Playing:
      return {
        title: 'Potato in play',
        badge: (
          <Badge tone="accent" dot pulse>
            Live
          </Badge>
        ),
      }
    case GameState.FinalRound:
      return {
        title: 'Final round',
        badge: (
          <Badge tone="danger" dot pulse>
            Live
          </Badge>
        ),
      }
    case GameState.Paused:
      return { title: 'Paused', badge: <Badge tone="warning">Paused</Badge> }
    case GameState.Ended:
      return { title: 'Round ended', badge: <Badge tone="neutral">Ended</Badge> }
    case GameState.Queued:
      return { title: 'Waiting for the next round', badge: <Badge tone="neutral">Queued</Badge> }
    default:
      return { title: gameStateLabel(state), badge: null }
  }
}

/** "Round N" header row: eyebrow, state headline with a badge, and the round's key numbers. */
export default function RoundSummary({ info }: RoundSummaryProps) {
  const round = info && info.round > 0n ? info.round.toString() : null
  const { title, badge } = describeState(info?.state)
  const live = isLiveState(info?.state)

  const stats = info
    ? [
        { label: 'Pot', value: `${formatEth(info.pot)} ETH` },
        live || info.activeHands > 0n
          ? { label: 'Hands in play', value: info.activeHands.toString() }
          : { label: 'Minted this round', value: info.mintedThisRound.toString() },
        live
          ? { label: 'Wallets', value: info.activeWallets.toString() }
          : { label: 'Total hands', value: info.totalMinted.toString() },
        { label: 'Passes', value: info.roundPasses.toString() },
      ]
    : null

  return (
    <div className="flex flex-col gap-6 animate-fade-up lg:flex-row lg:items-end lg:justify-between">
      <SectionHeader
        size="md"
        eyebrow={round ? `Round ${round}` : 'Hot Potato'}
        title={
          info ? (
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-2">
              {title}
              {badge}
            </span>
          ) : (
            <Skeleton className="h-8 w-56" />
          )
        }
      />
      <StatRow className="lg:shrink-0">
        {stats
          ? stats.map((stat) => <Stat key={stat.label} label={stat.label} value={stat.value} />)
          : ['Pot', 'Hands', 'Wallets', 'Passes'].map((label) => (
              <Stat key={label} label={label} value={<Skeleton className="h-6 w-16" />} />
            ))}
      </StatRow>
    </div>
  )
}
