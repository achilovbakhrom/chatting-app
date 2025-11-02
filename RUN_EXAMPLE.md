# Run the Example Page - Quick Guide

## Fastest Way (Docker)

```bash
# 1. Start everything with Docker
docker-compose up

# 2. Open browser
# Visit: http://localhost:5173
# Click: "Try Interactive API Example" button

# Done! 🎉
```

## Alternative (Local)

If you prefer to run without Docker:

### First Time Setup

```bash
# 1. Install dependencies
cd frontend
npm install
cd ..

# 2. Start backend
cd backend
npm install
npm run start:dev
```

### Every Time After

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open: http://localhost:5173
# Click: "Try Interactive API Example"
```

## What You'll See

### Homepage (/)
- Project overview
- Features list
- Button to example page

### Example Page (/example)
- Backend health check
- Register/Login forms
- API test buttons
- Live response display

## Test Flow

1. **Check Backend** - Click "Check Backend Status"
   - Should show: "Backend is running!"

2. **Register** - Fill form and click "Register"
   - Email: test@example.com
   - Password: password123
   - Name: Test User
   - Should show: Success with JWT token

3. **Get Users** - Click "Get All Users"
   - Should show: List with your user

4. **Login** - Use same credentials, click "Login"
   - Should show: Success with token
   - Green badge appears: "✅ Authenticated"

## Troubleshooting

### Backend Not Running

```bash
# Check if backend is running
curl http://localhost:3000

# If not, start it:
docker-compose up
# or
cd backend && npm run start:dev
```

### Port Conflicts

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Missing

```bash
# Install frontend deps
cd frontend
rm -rf node_modules package-lock.json
npm install

# Install backend deps
cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure backend `.env` has:
```
FRONTEND_URL=http://localhost:5173
```

Restart backend after changing.

## Quick Commands

### With Docker
```bash
make up          # Start all
make down        # Stop all
make logs        # View logs
make clean       # Clean everything
```

### Without Docker
```bash
# From root directory
npm run dev              # Start both
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

## Next Steps

1. ✅ Test the example page
2. 📖 Read the code in `ExamplePage.tsx`
3. 🔧 Try adding more API calls
4. 🏗️ Build your own components

## Full Documentation

- **[EXAMPLE_PAGE.md](./EXAMPLE_PAGE.md)** - Complete guide
- **[API_REFERENCE.md](./API_REFERENCE.md)** - All endpoints
- **[DOCKER_README.md](./DOCKER_README.md)** - Docker guide

---

**Quick Start:** `docker-compose up` → http://localhost:5173/example
