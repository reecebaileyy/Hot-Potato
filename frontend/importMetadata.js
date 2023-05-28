require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectToDatabase } = require('./lib/mongodb'); 
const Metadata = require('./models/leaderboard');

const addressDirectory = path.join(process.cwd(), 'src', 'dummy', '');

(async () => {
  try {
    const { db } = await connectToDatabase(); 

    const files = fs.readdirSync(metadataDirectory);

    for (const file of files) {
      const addressPath = path.join(addressDirectory, file);
      const addressJSON = JSON.parse(fs.readFileSync(addressPath, 'utf8'));

      const existingMetadata = await db.collection('leaderboard').findOne({ address: addressJSON, successfulPasses }); // Use the db object to query the collection

      if (!existingMetadata) {
        await db.collection('leaderboard').insertOne({ address: TODO , successfulPasses: TODO, totalWins: TODO }); // Use the db object to insert new metadata
        console.log(`Imported token ${token}`);
      } else {
        console.log(`Token ${token} already exists in the database`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
