// pages/api/update-game-state.js
const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
  console.log(`prisma = ${prisma}`);
  const { newState } = req.body;

  try {

    function getCurrentState(gameState) {
      for (let [key, value] of Object.entries(gameState)) {
        if (value === "True") {
          return key;
        }
      }
      return null;
    }

    const currentGameState = await prisma.GameState.findFirst();

    let updateData = {
      Ended: "False",
      Final_Round: "False",
      Minting: "False",
      Paused: "False",
      Playing: "False",
      Queued: "False",
    };

    updateData[newState] = "True";

    if (currentGameState) {
      let currentKey = getCurrentState(currentGameState);
      if (currentKey !== null) {
        updateData[currentKey] = "Prev";
      }

      await prisma.GameState.update({
        where: { id: currentGameState.id },
        data: updateData,
      });
    } else {
      await prisma.GameState.create({
        data: updateData,
      });
    }

    res.status(200).json({ message: `Game state updated to ${newState}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error updating game state: ${error.message}` });
  }
}
