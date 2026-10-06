import React from 'react'
import type { Address } from 'viem'
import HandImage from './HandImage'
import { useHandImages } from '../hooks/useHandImages'
import type { GameInfo } from '../hooks/useGame'

interface UserTokensProps {
  darkMode: boolean
  ownedTokenIds: number[]
  activeTokenIds: number[]
  /** Whether play has started, i.e. hands can be eliminated. */
  inPlay: boolean
  info: GameInfo | undefined
  metadataHandler: Address | undefined
}

/** The connected player's hands, marking the potato and eliminated hands. */
export default function UserTokens({
  darkMode,
  ownedTokenIds,
  activeTokenIds,
  inPlay,
  info,
  metadataHandler,
}: UserTokensProps) {
  const images = useHandImages(ownedTokenIds, info, metadataHandler)
  const potatoTokenId = Number(info?.potatoTokenId ?? 0n)
  const active = new Set(activeTokenIds)

  return (
    <div className={`w-full max-w-6xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-6 lg:p-8 animate-fade-in-up`}>
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 gradient-text glow">Your Hands</h2>

      {ownedTokenIds.length === 0 ? (
        <div className="text-center py-8">
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You don&apos;t have any hands yet. Mint some when the next round opens!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {ownedTokenIds.map((tokenId) => {
            const eliminated = inPlay && !active.has(tokenId)
            const hasPotato = tokenId === potatoTokenId
            return (
              <div
                key={tokenId}
                className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                  eliminated
                    ? 'opacity-50'
                    : hasPotato
                      ? 'ring-4 ring-red-500 animate-pulse shadow-lg shadow-red-500/50'
                      : 'ring-2 ring-gray-300 dark:ring-gray-600 hover:ring-amber-500/50 hover:scale-105'
                } ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}
              >
                <HandImage tokenId={tokenId} image={images.get(tokenId)} isPotato={hasPotato} />
                {hasPotato && (
                  <div className="absolute top-2 right-2 text-3xl drop-shadow-lg animate-bounce">🥔</div>
                )}
                {eliminated && (
                  <div className="absolute inset-0 bg-red-500/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-4xl animate-pulse">💥</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
