const express = require('express');
const prisma = require('./lib/prisma/index.js');
const ABI = require('./abi/UNKNOWN.json');

const app = express();
const port = process.env.PORT || 3000;

async function handler(req, res) {
  const { useContractEvent } = await import('wagmi');
  
  useContractEvent({
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
    abi: ABI,
    eventName: 'SuccessfulPass',
    async listener(log) {
      try {
        const player = log[0]?.args?.player;
        
        await prisma.leaderboard.upsert({
            where: { address: player },
            update: {
                passes: {
                    increment: 1
                },
            },
            create: {
                address: player,
                passes: 1,
                fails: 0,
                wins: 0,
            },
        });

        console.log("Completed upsert")

      } catch (error) {
        console.error('Error updating successful passes', error);
        res.status(500).send('An error occurred');
      }
    },
  });

  res.status(200).send('Request received and processing');
}

// Using your handler function when a GET request is made to the home page
app.get('/', handler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
