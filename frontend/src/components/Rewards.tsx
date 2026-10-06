import React from 'react'
import { Badge, Button, Card, CardHeader, Stat } from './ui'
import { explorerTxUrl } from '../config/chain'
import { formatEth } from '../lib/game'
import type { ClaimHistoryItem } from '../hooks/useClaimHistory'

interface RewardsProps {
  /** Claimable wei (`rewards(address)`). */
  rewards: bigint
  /** Whether the connected wallet won the round that just ended. */
  isWinner: boolean
  onClaimRewards: () => void
  busy: boolean
  claimHistory: ClaimHistoryItem[]
}

const formatTxHash = (hash: string) => (hash.length < 10 ? hash : `${hash.slice(0, 6)}…${hash.slice(-4)}`)

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/** Claimable balance, the claim button and the claims made from this browser. */
export default function Rewards({ rewards, isWinner, onClaimRewards, busy, claimHistory }: RewardsProps) {
  const hasRewards = rewards > 0n

  return (
    <Card>
      <CardHeader
        title="Rewards"
        action={
          isWinner ? (
            <Badge tone="success" dot>
              You won
            </Badge>
          ) : undefined
        }
      />

      <Stat
        label="Claimable"
        value={`${formatEth(rewards)} ETH`}
        size="lg"
        tone={hasRewards ? 'success' : 'default'}
        hint={hasRewards ? 'Available to claim' : 'No rewards yet'}
      />

      {hasRewards && (
        <Button size="lg" block className="mt-4" onClick={onClaimRewards} disabled={busy}>
          Claim rewards
        </Button>
      )}

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-[13px] leading-5 font-medium text-fg-secondary">Claim history</h4>
          <span className="text-[13px] leading-5 text-fg-tertiary tnum">{claimHistory.length}</span>
        </div>

        {claimHistory.length === 0 ? (
          <p className="mt-2 text-[13px] leading-5 text-fg-tertiary">No claims yet.</p>
        ) : (
          <ul className="mt-1 max-h-64 divide-y divide-line overflow-y-auto">
            {claimHistory.map((claim) => {
              const txUrl = explorerTxUrl(claim.txHash)
              return (
                <li key={claim.txHash} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="text-[15px] leading-6 font-semibold tnum">{claim.amount} ETH</div>
                    <div className="text-[13px] leading-5 text-fg-secondary">
                      {dateFormat.format(claim.timestamp)}
                      {claim.round !== undefined && ` · Round ${claim.round}`}
                    </div>
                  </div>
                  {txUrl ? (
                    <a
                      href={txUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 py-0.5 text-[13px] leading-5 font-medium text-accent tnum hover:underline"
                      title={claim.txHash}
                    >
                      {formatTxHash(claim.txHash)}
                    </a>
                  ) : (
                    <span className="shrink-0 py-0.5 font-mono text-[13px] leading-5 text-fg-tertiary" title={claim.txHash}>
                      {formatTxHash(claim.txHash)}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
