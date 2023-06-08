// pages/api/get-previous-game-state.js
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    const gameState = await prisma.GameState.findFirst();

    if (!gameState) {
      res.status(404).json({ error: "Game state not found." });
    } else {
      // Set the cache-control header to stale-while-revalidate with a max age of 1 hour
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      res.status(200).json({ previous: gameState.previous });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching previous game state." });
  }
}
