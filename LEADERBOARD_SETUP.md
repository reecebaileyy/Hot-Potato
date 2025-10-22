# Leaderboard Database Setup Guide

This guide covers the setup and deployment of the Hot Potato leaderboard system with database tracking and Redis caching.

## Architecture Overview

The leaderboard system consists of:
- **Database**: MongoDB (via Prisma ORM)
- **Event Listeners**: Node.js services that listen to smart contract events
- **API Endpoints**: Next.js API routes for fetching leaderboard data
- **Caching Layer**: Redis (optional for dev, required for production)
- **Frontend**: React/Next.js leaderboard UI

## Local Development Setup

### Prerequisites

- Node.js >= 22.0.0
- MongoDB instance (local or cloud)
- Redis instance (optional for local dev, required for production)
- Alchemy API key for blockchain RPC access

### Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# Database
DATABASE_URL="mongodb://localhost:27017/HotPotato"
# Or use MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/HotPotato?retryWrites=true&w=majority"

# Blockchain RPC
ALCHEMY_URL="https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY"

# Redis (Optional for local development)
# Leave commented out to disable Redis caching locally
# REDIS_URL="redis://localhost:6379"
# Or enable without URL:
# USE_REDIS="true"
```

Create a `.env.local` file in the `frontend/` directory:

```bash
# Database
DATABASE_URL="mongodb://localhost:27017/HotPotato"

# Redis (Optional for local development)
# REDIS_URL="redis://localhost:6379"
# USE_REDIS="true"
```

### Installation Steps

1. **Install dependencies for the server:**
   ```bash
   cd server
   npm install
   ```

2. **Install dependencies for the frontend:**
   ```bash
   cd frontend
   npm install
   ```

3. **Generate Prisma Client:**
   ```bash
   cd frontend
   npx prisma generate
   ```

4. **Sync Database Schema (if needed):**
   ```bash
   cd frontend
   npx prisma db push
   ```

### Running Locally

1. **Start the event listeners:**
   ```bash
   cd server
   npm run dev:all
   ```
   This runs both `update-passes.js` and `update-wins.js` concurrently.

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Leaderboard: http://localhost:3000/leaderboard
   - Event listener health check: http://localhost:3000 (passes) and http://localhost:3001 (wins)

## Production Deployment (Heroku)

### Prerequisites

- Heroku account
- Heroku CLI installed
- MongoDB Atlas account (or other cloud MongoDB)
- Redis addon on Heroku

### Heroku Setup

1. **Create Heroku apps:**
   ```bash
   # For the event listener service
   heroku create your-app-event-listeners
   
   # For the frontend (if deploying separately)
   heroku create your-app-frontend
   ```

2. **Add MongoDB:**
   - Use MongoDB Atlas or another cloud provider
   - Get your connection string

3. **Add Redis addon:**
   ```bash
   heroku addons:create heroku-redis:mini -a your-app-event-listeners
   heroku addons:create heroku-redis:mini -a your-app-frontend
   ```
   This automatically sets the `REDIS_URL` environment variable.

4. **Set environment variables for event listeners:**
   ```bash
   cd server
   
   heroku config:set DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/HotPotato?retryWrites=true&w=majority" -a your-app-event-listeners
   
   heroku config:set ALCHEMY_URL="https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY" -a your-app-event-listeners
   
   heroku config:set NODE_ENV="production" -a your-app-event-listeners
   ```

5. **Set environment variables for frontend:**
   ```bash
   cd frontend
   
   heroku config:set DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/HotPotato?retryWrites=true&w=majority" -a your-app-frontend
   
   heroku config:set NODE_ENV="production" -a your-app-frontend
   ```

6. **Deploy the event listeners:**
   ```bash
   cd server
   git init (if not already a git repo)
   git add .
   git commit -m "Deploy event listeners"
   git push heroku main
   ```

7. **Deploy the frontend:**
   ```bash
   cd frontend
   # Follow your normal Next.js deployment process to Heroku or Vercel
   ```

### Vercel Deployment (Alternative for Frontend)

If deploying the frontend to Vercel instead of Heroku:

1. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL`: Your MongoDB connection string
   - `REDIS_URL`: Your Redis connection string (from Upstash or Redis Labs)

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

## Database Schema

The Prisma schema (`frontend/prisma/schema.prisma`) defines:

```prisma
model leaderboard {
  id      String @id @default(auto()) @map("_id") @db.ObjectId
  address String @unique
  fails   Int
  passes  Int
  wins    Int
}
```

## Event Tracking

The system tracks three smart contract events:

1. **SuccessfulPass**: Increments the `passes` count
2. **FailedPass**: Increments the `fails` count
3. **PlayerWon**: Increments the `wins` count

Both event listeners (`update-passes.js` and `update-wins.js`) use upsert operations to create player records if they don't exist.

## API Endpoints

### GET /api/get-leaderboard

Returns all players sorted by wins (descending) then passes (descending).

**Response:**
```json
{
  "Leaderboard": [
    {
      "id": "...",
      "address": "0x...",
      "wins": 10,
      "passes": 50,
      "fails": 5
    }
  ]
}
```

**Headers:**
- `X-Cache`: `HIT` or `MISS` (indicates if served from Redis cache)

### GET /api/get-player-data?address=0x...

Returns data for a specific player.

**Response:**
```json
{
  "id": "...",
  "address": "0x...",
  "wins": 10,
  "passes": 50,
  "fails": 5
}
```

## Redis Caching

- **TTL**: 30 seconds
- **Behavior**: 
  - If Redis is unavailable, falls back to direct database queries
  - Cache is automatically enabled if `REDIS_URL` is set or `USE_REDIS=true`
  - For local development, Redis is optional

## Monitoring

### Health Checks

- Event listeners expose health endpoints:
  - Passes listener: `http://localhost:3000/health`
  - Wins listener: `http://localhost:3001/health`

### Logs

Monitor logs for:
- Database connection status
- Redis connection status
- Event listener activity
- Cache hit/miss rates

```bash
# Heroku logs
heroku logs --tail -a your-app-event-listeners
```

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0 for cloud)
3. Ensure Prisma client is generated: `npx prisma generate`

### Redis Connection Issues

1. Verify `REDIS_URL` is set correctly
2. For local dev, ensure Redis is running: `redis-cli ping`
3. Check Heroku Redis addon status: `heroku addons:info heroku-redis`

### Event Listener Not Receiving Events

1. Verify `ALCHEMY_URL` is correct
2. Check contract address in `update-passes.js` and `update-wins.js`
3. Ensure the contract is deployed and events are being emitted
4. Check Heroku logs for errors

### Leaderboard Not Loading

1. Check browser console for API errors
2. Verify frontend environment variables are set
3. Test API endpoints directly: `/api/get-leaderboard`
4. Check database contains data

## Performance Optimization

- Redis caching reduces database load by ~97% (30s TTL)
- Client-side sorting prevents unnecessary API calls
- Prisma connection pooling handles concurrent requests
- Event listeners use upsert for efficient database updates

## Security Considerations

- MongoDB connection strings should never be committed to git
- Use environment variables for all sensitive data
- Enable MongoDB authentication in production
- Redis should be password-protected in production
- Rate limit API endpoints in production (not currently implemented)

## Future Enhancements

Potential improvements:
- Add pagination for large leaderboards
- Implement player search functionality
- Add achievement badges
- Track additional statistics (average pass time, longest streaks, etc.)
- Add admin dashboard for moderation
- Implement rate limiting on API endpoints
- Add WebSocket for real-time leaderboard updates

