require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectToDatabase } = require('./lib/mongodb');

const gameStatePath = path.join(process.cwd(), 'src', 'dummy', 'gameState.json');
const previousStatePath = path.join(process.cwd(), 'src', 'dummy', 'previousState.json');
const nextStatePath = path.join(process.cwd(), 'src', 'dummy', 'nextState.json');

const gameStates = JSON.parse(fs.readFileSync(gameStatePath, 'utf8'));
const previousStates = JSON.parse(fs.readFileSync(previousStatePath, 'utf8'));
const nextStates = JSON.parse(fs.readFileSync(nextStatePath, 'utf8'));

(async () => {
  try {
    const { db } = await connectToDatabase(); 

    for (let i = 0; i < gameStates.length; i++) {
      const existingState = await db.collection('GameState').findOne({ address: gameStates[i].address });

      if (!existingState) {
        await db.collection('GameState').insertOne({ address: gameStates[i].address, gameState: gameStates[i].state, previousState: previousStates[i].state, nextState: nextStates[i].state });
        console.log(`Imported game state for ${gameStates[i].address}`);
      } else {
        if (existingState.gameState !== gameStates[i].state || existingState.previousState !== previousStates[i].state || existingState.nextState !== nextStates[i].state) {
          await db.collection('GameState').updateOne(
            { address: gameStates[i].address }, 
            { $set: { gameState: gameStates[i].state, previousState: previousStates[i].state, nextState: nextStates[i].state } });
          console.log(`Updated game state for ${gameStates[i].address}`);
        } else {
          console.log(`Game state for ${gameStates[i].address} already exists in the database`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
