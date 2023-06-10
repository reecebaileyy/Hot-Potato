import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  console.log("Request body:", req.body);
  const { newState } = req.body;
  console.log("Request body:", newState);

  try {
    console.log("Updating game state...");
    const currentStateData = await prisma.GameState.findFirst();
    console.log("Current state data:", currentStateData);

    await prisma.GameState.update({
      where: { id: currentStateData.id },
      data: {
        previous: currentStateData.current,
        current: newState
      },
    });
    console.log("Game state updated successfully.");

    res.status(200).json({ message: "Game state updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating game state." });
  }
}
