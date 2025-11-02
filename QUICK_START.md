# Quick Start Checklist

Follow these steps to get the application running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js v18+ installed (`node --version`)
- [ ] MongoDB installed and running
- [ ] OpenAI API key (optional, for translation feature)

## Setup Steps

### 1. Install Dependencies (2 minutes)

```bash
# From project root
cd /Users/bakhromachilov/flexobo/flexobo-chat-example

# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Environment (1 minute)

#### Update backend/.env

Open `backend/.env` and update these values:

```env
# Update these lines:
MONGODB_URI=mongodb://localhost:27017/flexobo-chat  # Update if MongoDB is elsewhere
JWT_SECRET=PUT-A-LONG-RANDOM-STRING-HERE-CHANGE-THIS  # REQUIRED: Change this!
OPENAI_API_KEY=sk-your-openai-key-here  # OPTIONAL: For translation feature
```

**Important:** At minimum, change the `JWT_SECRET` to a random string.

#### Frontend .env (Already Configured)

`frontend/.env` is already configured. No changes needed.

### 3. Start MongoDB (30 seconds)

Choose your platform:

**macOS (Homebrew):**
```bash
brew services start mongodb-community
# Or run once: mongod --config /opt/homebrew/etc/mongod.conf
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
- Start MongoDB service from Services
- Or run `mongod.exe` from MongoDB bin directory

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

Verify MongoDB is running:
```bash
# Should connect successfully
mongosh
```

### 4. Start Application (30 seconds)

**Option A: Start Both Together (Recommended)**

From project root:
```bash
npm run dev
```

**Option B: Start Separately**

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 5. Verify Setup (1 minute)

Open these URLs in your browser:

- [ ] Frontend: http://localhost:5173 (Should show welcome page)
- [ ] Backend API: http://localhost:3000 (Should show "Cannot GET /")
- [ ] Swagger Docs: http://localhost:3000/api (Should show API documentation)

## Quick Test via Swagger UI

Visit http://localhost:3000/api and try this flow:

### Step 1: Register a User

1. Click on **`POST /auth/register`**
2. Click **"Try it out"**
3. Paste this:
   ```json
   {
     "email": "owner@test.com",
     "password": "password123",
     "name": "Jane Owner",
     "role": "LOAD_OWNER",
     "company": "Test Logistics"
   }
   ```
4. Click **"Execute"**
5. **Copy the `access_token`** from response

### Step 2: Authorize

1. Click the **"Authorize"** button at the top
2. Enter: `Bearer YOUR_ACCESS_TOKEN` (paste the token you copied)
3. Click **"Authorize"**

### Step 3: Get Users

1. Click on **`GET /users`**
2. Click **"Try it out"**
3. Click **"Execute"**
4. Should see your user in the list
5. **Copy your user's `_id`**

### Step 4: Create Another User

Repeat Step 1 with:
```json
{
  "email": "driver@test.com",
  "password": "password123",
  "name": "John Driver",
  "role": "TRUCK_DRIVER",
  "company": "Test Transport"
}
```

Copy the second user's `_id` from the response.

### Step 5: Create a Chat

1. Click on **`POST /chats`**
2. Click **"Try it out"**
3. Paste (replace with actual user IDs):
   ```json
   {
     "participants": ["SECOND_USER_ID_HERE"],
     "isMutable": true
   }
   ```
4. Click **"Execute"**
5. **Copy the chat's `_id`**

### Step 6: Send a Message

1. Click on **`POST /messages`**
2. Click **"Try it out"**
3. Paste (replace with actual chat ID):
   ```json
   {
     "chatId": "CHAT_ID_HERE",
     "type": "TEXT",
     "content": "Hello! This is my first message."
   }
   ```
4. Click **"Execute"**

### Step 7: Get Chat Messages

1. Click on **`GET /messages/chat/{chatId}`**
2. Click **"Try it out"**
3. Enter your chat ID
4. Click **"Execute"**
5. Should see your message!

### Step 8: Create a Bid (Optional)

1. Click on **`POST /bids`**
2. Click **"Try it out"**
3. Paste:
   ```json
   {
     "chatId": "CHAT_ID_HERE",
     "amount": 1500,
     "currency": "USD",
     "description": "Delivery from LA to NYC in 3 days"
   }
   ```
4. Click **"Execute"**

**Success!** Backend is working perfectly.

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:**
- Make sure MongoDB is running: `brew services list` or `sudo systemctl status mongod`
- Start MongoDB: `brew services start mongodb-community`

### Port 3000 Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

### JWT Secret Warning

If you see warnings about JWT secret, update `backend/.env`:

```env
JWT_SECRET=use-a-very-long-random-string-here-at-least-32-characters-long
```

### npm install Fails

**Fix:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Frontend Won't Start

**Fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### OpenAI Translation Not Working

Translation will fail silently if no API key is configured.

**Fix:** Add your OpenAI API key to `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

## Next Steps

### Explore the Backend

✅ Backend is 100% complete and functional
- All API endpoints work
- WebSocket is ready
- Try all features via Swagger UI

### Implement Frontend

🚧 Frontend infrastructure is ready, UI needs implementation

See detailed guides:
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - How to build frontend components
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoint reference

Start with:
1. Login/Register pages
2. Chat list
3. Chat room
4. Message components
5. Voice recording
6. File upload
7. Bidding UI
8. Translation toggle

### Review Documentation

- **[README.md](./README.md)** - Project overview
- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - What was built
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API reference

## Development Workflow

### Daily Development

```bash
# Start everything
npm run dev

# Backend logs in one pane
# Frontend logs in another pane
```

### Testing Changes

```bash
# Backend changes auto-reload (NestJS watch mode)
# Frontend changes auto-reload (Vite HMR)
# Just save your files and see changes immediately
```

### View Logs

Backend logs show:
- API requests
- WebSocket connections
- Database queries
- Errors

Frontend shows in browser console:
- API calls
- WebSocket events
- React component rendering

### Access Points

- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api
- **MongoDB:** mongodb://localhost:27017

## Common Commands

```bash
# Development
npm run dev              # Start both
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Production Build
npm run build            # Build both
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only

# Backend Specific
cd backend
npm run start:dev        # Development mode
npm run start:prod       # Production mode
npm run lint             # Lint code
npm run test             # Run tests

# Frontend Specific
cd frontend
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview prod build
npm run lint             # Lint code
```

## Success Checklist

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access Swagger UI at http://localhost:3000/api
- [ ] Can register a user via Swagger
- [ ] Can create a chat via Swagger
- [ ] Can send a message via Swagger
- [ ] Frontend shows welcome page

**If all boxes are checked, you're ready to start development!**

## Get Help

1. Check error messages in terminal
2. Review [SETUP.md](./SETUP.md) for detailed troubleshooting
3. Check MongoDB is running: `mongosh`
4. Verify Node version: `node --version` (should be 18+)
5. Check ports are free: `lsof -i:3000` and `lsof -i:5173`

---

**You're all set! Happy coding! 🚀**
