import React from 'react'
import type { Address } from 'viem'
import HandImage from './HandImage'
import { Badge, Card, CardHeader } from './ui'
import { useHandImages } from '../hooks/useHandImages'
import type { GameInfo } from '../hooks/useGame'

interface UserTokensProps {
  ownedTokenIds: number[]
  activeTokenIds: number[]
  /** Whether play has started, i.e. hands can be eliminated. */
  inPlay: boolean
  info: GameInfo | undefined
  metadataHandler: Address | undefined
}

/** The connected player's hands, marking the potato and eliminated hands. */
export default function UserTokens({ ownedTokenIds, activeTokenIds, inPlay, info, metadataHandler }: UserTokensProps) {
  const images = useHandImages(ownedTokenIds, info, metadataHandler)
  const potatoTokenId = Number(info?.potatoTokenId ?? 0n)
  const active = new Set(activeTokenIds)

  const subtitle =
    ownedTokenIds.length === 0
      ? undefined
      : inPlay
        ? `${ownedTokenIds.length} owned, ${activeTokenIds.length} still in play`
        : `${ownedTokenIds.length} owned, all in the next round`

  return (
    <Card>
      <CardHeader title="Your hands" subtitle={subtitle} />

      {ownedTokenIds.length === 0 ? (
        <p className="text-[15px] leading-6 text-fg-secondary">
          You don&apos;t have any hands yet. Mint some when minting opens.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {ownedTokenIds.map((tokenId) => {
            const eliminated = inPlay && !active.has(tokenId)
            const hasPotato = tokenId === potatoTokenId
            return (
              <div
                key={tokenId}
                className={`rounded-2xl bg-surface-muted p-1.5 transition-opacity duration-200 ease-apple ${
                  hasPotato ? 'ring-2 ring-accent' : ''
                } ${eliminated ? 'opacity-50' : ''}`}
              >
                <HandImage tokenId={tokenId} image={images.get(tokenId)} isPotato={hasPotato} />
                <div className="mt-1 flex justify-center">
                  {hasPotato ? (
                    <Badge tone="accent" dot pulse>
                      #{tokenId}
                    </Badge>
                  ) : eliminated ? (
                    <Badge tone="neutral">#{tokenId} out</Badge>
                  ) : (
                    <span className="text-[12px] leading-6 font-medium text-fg-secondary tnum">#{tokenId}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
