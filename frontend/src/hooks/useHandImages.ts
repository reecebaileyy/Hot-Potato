import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import type { Address } from 'viem'
import { isGameConfigured } from '../config/chain'
import { gameContract } from '../lib/game'
import type { GameInfo } from './useGame'

export interface HandImage {
  src?: string
  isLoading: boolean
  isError: boolean
}

/**
 * Image URLs for a set of hands. Traits come from one multicall of `traitsOf`; the SVG itself is
 * served (and cached) by /api/hand-image, keyed by renderer + traits + potato flag.
 *
 * Traits of a hand only change when the seed of the round it was minted in is revealed, so the
 * reads are cached for good within a (round, seedRevealed) scope.
 */
export function useHandImages(
  tokenIds: number[],
  info: GameInfo | undefined,
  metadataHandler: Address | undefined,
): Map<number, HandImage> {
  const { data, isLoading } = useReadContracts({
    contracts: tokenIds.map((id) => ({
      ...gameContract,
      functionName: 'traitsOf' as const,
      args: [BigInt(id)] as const,
    })),
    scopeKey: `traits:${info?.round ?? 0n}:${info?.seedRevealed ? 1 : 0}`,
    query: {
      enabled: isGameConfigured && tokenIds.length > 0 && !!info,
      staleTime: Infinity,
    },
  })

  const potatoTokenId = Number(info?.potatoTokenId ?? 0n)

  return useMemo(() => {
    const images = new Map<number, HandImage>()
    tokenIds.forEach((tokenId, index) => {
      const entry = data?.[index]
      if (!entry || !metadataHandler) {
        images.set(tokenId, { isLoading: isLoading || !metadataHandler, isError: false })
        return
      }
      if (entry.status !== 'success') {
        images.set(tokenId, { isLoading: false, isError: true })
        return
      }
      const [background, handType] = entry.result
      const potato = tokenId === potatoTokenId ? 1 : 0
      images.set(tokenId, {
        src: `/api/hand-image?h=${metadataHandler}&bg=${background}&hand=${handType}&potato=${potato}`,
        isLoading: false,
        isError: false,
      })
    })
    return images
  }, [tokenIds, data, isLoading, metadataHandler, potatoTokenId])
}
