const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
  const { address } = req.query;
  console.log(`address: ${address}`)

  try {
    console.log('Before findUnique')
    const playerData = await prisma.leaderboard.findUnique({
      where: { address: address },
    });
    console.log('After findUnique')

    console.log(`${address} playerData: ${JSON.stringify(playerData)}`);

    // Set Cache-Control headers
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

    if (!playerData) {
      console.log('playerData is null')
      res.status(404).json({ error: `No data found for address` });
    } else {
      res.status(200).json(playerData);
    }
  } catch (error) {
    console.error('Inside catch block')
    console.error(error);
    res.status(500).json({ error: `Error fetching data for address ${address}: ${error.message}` });
  }
}
