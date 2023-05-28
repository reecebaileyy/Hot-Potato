require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectToDatabase } = require('./lib/mongodb');

const addressPath = path.join(process.cwd(), 'src', 'dummy', 'address.json');
const passesPath = path.join(process.cwd(), 'src', 'dummy', 'passes.json');
const winsPath = path.join(process.cwd(), 'src', 'dummy', 'wins.json');

const addresses = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
const passes = JSON.parse(fs.readFileSync(passesPath, 'utf8'));
const wins = JSON.parse(fs.readFileSync(winsPath, 'utf8'));

(async () => {
  try {
    const { db } = await connectToDatabase(); 

    for (let i = 0; i < addresses.length; i++) {
      const existingMetadata = await db.collection('leaderboard').findOne({ address: addresses[i].address });

      if (!existingMetadata) {
        await db.collection('leaderboard').insertOne({ address: addresses[i].address, successfulPasses: passes[i].successfulPasses, totalWins: wins[i].totalWins });
        console.log(`Imported token ${addresses[i].address}`);
      } else {
        if (existingMetadata.successfulPasses !== passes[i].successfulPasses || existingMetadata.totalWins !== wins[i].totalWins) {
          await db.collection('leaderboard').updateOne({ address: addresses[i].address }, { $set: { successfulPasses: passes[i].successfulPasses, totalWins: wins[i].totalWins } });
          console.log(`Updated data for ${addresses[i].address}`);
        } else {
          console.log(`Token ${addresses[i].address} already exists in the database`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
