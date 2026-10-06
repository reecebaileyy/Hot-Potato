import React from 'react'
import { Badge, Card, CardHeader, Skeleton, Stat, StatRow } from '../ui'
import { useGameInfo } from '../../hooks/useGame'
import { useCountdown } from '../../hooks/useCountdown'
import { chain, isGameConfigured } from '../../config/chain'
import { GameState, formatEth, gameStateLabel, isLiveState } from '../../lib/game'

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

function stateTone(state: number | undefined): Tone {
  if (isLiveState(state)) return 'success'
  if (state === GameState.Minting) return 'accent'
  if (state === GameState.Paused) return 'warning'
  return 'neutral'
}

function formatFuse(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Four muted placeholders shaped like the stat row. */
function StatSkeletons() {
  return (
    <StatRow className="mt-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="mt-2 h-7 w-20" />
        </div>
      ))}
    </StatRow>
  )
}

/** The current round, read live from the Game contract and polled every few seconds. */
export default function LiveRoundCard({ className = '' }: { className?: string }) {
  const { info, isLoading, error, updatedAt } = useGameInfo()
  const fuse = useCountdown(info, updatedAt)

  const unavailable = !isGameConfigured || !!error

  if (unavailable) {
    return (
      <Card className={`mx-auto w-full max-w-2xl ${className}`}>
        <CardHeader
          title="Live round"
          subtitle={`Game not deployed yet on ${chain.name}.`}
          action={<Badge>Offline</Badge>}
        />
        <StatRow>
          {['Pot', 'Hands', 'Wallets', 'Mint price'].map((label) => (
            <Stat key={label} label={label} value={<span className="text-fg-tertiary">—</span>} />
          ))}
        </StatRow>
      </Card>
    )
  }

  if (isLoading || !info) {
    return (
      <Card className={`mx-auto w-full max-w-2xl ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <StatSkeletons />
      </Card>
    )
  }

  const live = isLiveState(info.state)
  const round = info.round > 0n ? `Round ${info.round.toString()}` : 'Waiting for the first round'
  const subtitle =
    live && fuse !== null ? (
      <>
        {round} · fuse <span className="tnum">{formatFuse(fuse)}</span>
      </>
    ) : (
      `${round} · updates every few seconds`
    )

  return (
    <Card className={`mx-auto w-full max-w-2xl ${className}`}>
      <CardHeader
        title="Live round"
        subtitle={subtitle}
        action={
          <Badge tone={stateTone(info.state)} dot pulse={live}>
            {gameStateLabel(info.state)}
          </Badge>
        }
      />
      <StatRow>
        <Stat label="Pot" value={`${formatEth(info.pot)} ETH`} />
        <Stat label="Hands" value={info.activeHands.toString()} hint={live ? 'still in play' : undefined} />
        <Stat label="Wallets" value={info.activeWallets.toString()} hint={live ? 'still in play' : undefined} />
        <Stat label="Mint price" value={`${formatEth(info.mintPrice, 6)} ETH`} />
      </StatRow>
    </Card>
  )
}
