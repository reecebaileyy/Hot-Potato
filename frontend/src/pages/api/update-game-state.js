import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const { newState } = req.body;

  try {
    const currentStateData = await prisma.GameState.findFirst();

    await prisma.GameState.update({
      where: { id: currentStateData.id },
      data: {
        previous: currentStateData.current,
        current: newState
      },
    });

    res.status(200).json({ message: "Game state updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating game state." });
  }
}
