import type { NextApiRequest, NextApiResponse } from 'next'
import { createPublicClient, http, isAddress, isAddressEqual, parseAbi, type Address } from 'viem'
import { gameAbi } from '../../abi/gameAbi'
import { GAME_ADDRESS, chain, isGameConfigured, rpcUrl } from '../../config/chain'

/**
 * Serves a hand's SVG straight from the on-chain renderer.
 *
 * The art is a pure function of (renderer, background, handType, hasPotato), so the response
 * is keyed by exactly those query params and can be cached by the browser and CDN for a long
 * time. Clients read `traitsOf(tokenId)` and the potato holder from the Game contract and build
 * the URL; see useHandImages.
 *
 *   /api/hand-image?h=<metadataHandler>&bg=<0-255>&hand=<0-255>&potato=<0|1>
 */

const rendererAbi = parseAbi([
  'function getSVGInterface(uint8 background, uint8 handType, bool hasPotato, uint8 potato) view returns (string)',
])

// Game.getImageString always renders potato variant 1.
const POTATO_VARIANT = 1

const HANDLER_TTL_MS = 5 * 60_000

const client = createPublicClient({ chain, transport: http(rpcUrl) })

let cachedHandler: { address: Address; fetchedAt: number } | null = null

async function getHandler(): Promise<Address> {
  if (cachedHandler && Date.now() - cachedHandler.fetchedAt < HANDLER_TTL_MS) return cachedHandler.address
  const address = await client.readContract({
    address: GAME_ADDRESS,
    abi: gameAbi,
    functionName: 'metadataHandler',
  })
  cachedHandler = { address, fetchedAt: Date.now() }
  return address
}

function parseByte(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string' || !/^\d{1,3}$/.test(value)) return null
  const n = Number(value)
  return n <= 255 ? n : null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (!isGameConfigured) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ error: 'NEXT_PUBLIC_GAME_ADDRESS is not configured' })
  }

  const background = parseByte(req.query.bg)
  const handType = parseByte(req.query.hand)
  const potato = req.query.potato
  const requestedHandler = req.query.h
  if (background === null || handType === null || (potato !== '0' && potato !== '1')) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(400).json({ error: 'Expected bg and hand (0-255) and potato (0 or 1)' })
  }

  try {
    const renderer = await getHandler()
    // The handler is part of the cache key: refuse to answer for a stale one.
    if (typeof requestedHandler === 'string') {
      if (!isAddress(requestedHandler) || !isAddressEqual(requestedHandler, renderer)) {
        res.setHeader('Cache-Control', 'no-store')
        return res.status(409).json({ error: 'Unknown metadata handler', current: renderer })
      }
    }

    const svg = await client.readContract({
      address: renderer,
      abi: rendererAbi,
      functionName: 'getSVGInterface',
      args: [background, handType, potato === '1', POTATO_VARIANT],
    })

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    // Never let the SVG run script or load anything if it is opened directly.
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data:")
    res.setHeader(
      'Cache-Control',
      typeof requestedHandler === 'string'
        ? 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400'
        : 'public, max-age=300, s-maxage=3600',
    )
    return res.status(200).send(svg)
  } catch (error) {
    console.error('hand-image: failed to render', { background, handType, potato }, error)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(502).json({ error: 'Failed to read the hand image from chain' })
  }
}
