# Fix and Run Guide

## Quick Fix - Use Docker (Easiest!)

Docker handles all dependencies automatically:

```bash
# Just run this
docker-compose up
```

Then visit: **http://localhost:5173**

This will work without any errors because Docker has the right Node version and all dependencies.

## Alternative: Run Locally (If you see errors)

If you prefer running locally and encounter errors:

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Check for TypeScript Errors

```bash
# In frontend directory
cd frontend

# Check for type errors
npx tsc --noEmit
```

### Step 3: Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Common Errors and Fixes

### Error: "vite: command not found"

**Fix:**
```bash
cd /Users/bakhromachilov/flexobo/flexobo-chat-example/frontend
npm install
npm run dev
```

### Error: "Cannot find module 'zustand'"

**Fix:**
```bash
cd /Users/bakhromachilov/flexobo/flexobo-chat-example/frontend
npm install zustand
```

### Error: Type errors in TypeScript

**Fix:** Install missing types:
```bash
cd /Users/bakhromachilov/flexobo/flexobo-chat-example/frontend
npm install --save-dev @types/node
```

### Error: "Module not found: Error: Can't resolve"

**Fix:** Check the import paths. The files should be:
- `src/store/authStore.ts` ✅
- `src/store/chatStore.ts` ✅
- `src/features/auth/LoginPage.tsx` ✅
- `src/features/auth/RegisterPage.tsx` ✅
- `src/features/chat/ChatsPage.tsx` ✅
- `src/features/chat/ChatRoomPage.tsx` ✅
- `src/components/ProtectedRoute.tsx` ✅

### Error: Backend connection fails

**Fix:**
```bash
# Make sure backend is running
cd backend
npm run start:dev

# Check it's accessible
curl http://localhost:3000
```

## Recommended: Use Docker

To avoid ALL dependency and version issues:

```bash
# Stop any local services
# Ctrl+C in all terminals

# Start with Docker
docker-compose up

# That's it!
```

Docker will:
- ✅ Use correct Node version
- ✅ Install all dependencies
- ✅ Start MongoDB
- ✅ Start backend
- ✅ Start frontend
- ✅ Configure networking

## Verify Everything Works

### Test Backend

```bash
# Visit Swagger UI
open http://localhost:3000/api

# Or with curl
curl http://localhost:3000
```

### Test Frontend

```bash
# Visit app
open http://localhost:5173

# Should see homepage with "Sign In" and "Create Account" buttons
```

### Test Database

```bash
# With Docker
docker-compose exec mongodb mongosh

# Check database
show dbs
use flexobo-chat
show collections
```

## Clean Start (If nothing works)

```bash
# Stop everything
docker-compose down -v

# Remove node_modules
rm -rf node_modules frontend/node_modules backend/node_modules

# Remove package locks
rm package-lock.json frontend/package-lock.json backend/package-lock.json

# Start fresh with Docker
docker-compose up --build
```

## Still Having Issues?

Please share the **specific error message** and I'll help fix it.

Common things to check:
1. Is Docker running? (`docker ps`)
2. Is port 3000 free? (`lsof -i:3000`)
3. Is port 5173 free? (`lsof -i:5173`)
4. Is MongoDB running? (in Docker or locally)

---

**Recommended approach: Use Docker!**

```bash
docker-compose up
```
