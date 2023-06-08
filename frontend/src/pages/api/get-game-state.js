// pages/api/get-game-state.js
const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
  try {
    const gameState = await prisma.GameState.findFirst();

    if (!gameState) {
      res.status(404).json({ error: "No game state found" });
      return;
    }

    res.status(200).json(gameState);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error fetching game state: ${error.message}` });
  }
}
