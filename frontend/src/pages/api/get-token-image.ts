import type { NextApiRequest, NextApiResponse } from 'next'
import { createPublicClient, http, type Abi } from 'viem'
import GameArtifact from '../../abi/Game.json'
import { GAME_ADDRESS, chain, isGameConfigured, rpcUrl } from '../../config/chain'

const client = createPublicClient({ chain, transport: http(rpcUrl) })

type Data = { tokenId: number; imageString: string } | { error: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!isGameConfigured) {
    return res.status(503).json({ error: 'NEXT_PUBLIC_GAME_ADDRESS is not configured' })
  }

  const tokenId = Number(req.query.tokenId)
  if (!Number.isSafeInteger(tokenId) || tokenId < 0) {
    return res.status(400).json({ error: 'Invalid tokenId' })
  }

  try {
    const imageString = (await client.readContract({
      address: GAME_ADDRESS,
      abi: GameArtifact.abi as Abi,
      functionName: 'getImageString',
      args: [BigInt(tokenId)],
    })) as string

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
    return res.status(200).json({ tokenId, imageString })
  } catch (error) {
    console.error(`get-token-image: failed to read token ${tokenId}`, error)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(502).json({ error: 'Failed to read token image from chain' })
  }
}
