# 🚀 START HERE - Flexobo Chat

## Quick Start (2 Commands!)

```bash
# 1. Start everything
docker-compose up

# 2. Open browser
http://localhost:5173
```

**That's it!** The app is running.

## What You Have

✅ **Backend** - Fully functional NestJS API (100% complete)
✅ **Frontend** - Working React chat app (core features done)
✅ **Swagger** - API documentation at http://localhost:3000/api
✅ **Docker** - Everything containerized

## First Time Using the App

### Step 1: Create Account

1. Go to http://localhost:5173
2. Click **"Create Account"**
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Truck Driver
4. Click **"Create account"**
5. You're now logged in! 🎉

### Step 2: Create a Chat (via Swagger)

Since "New Chat" UI isn't done yet, use Swagger:

1. Open http://localhost:3000/api
2. Find **POST /auth/register**
3. Create a second user:
   ```json
   {
     "email": "user2@example.com",
     "password": "password123",
     "name": "Second User",
     "role": "LOAD_OWNER"
   }
   ```
4. Copy the `access_token` from first user
5. Click **"Authorize"** → Paste token
6. Find **GET /users** → Execute
7. Copy the second user's `_id`
8. Find **POST /chats** → Execute with:
   ```json
   {
     "participants": ["SECOND_USER_ID_HERE"]
   }
   ```

### Step 3: Start Chatting!

1. Go back to http://localhost:5173
2. Refresh the page
3. See your chat in the list
4. Click to open
5. Type a message
6. Click **"Send"**
7. Message appears! 💬

## What Works Right Now

✅ User registration
✅ User login
✅ View chat list
✅ Open chat room
✅ Send text messages
✅ See message history
✅ Logout

## Pages Available

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Homepage |
| http://localhost:5173/login | Login page |
| http://localhost:5173/register | Register page |
| http://localhost:5173/chats | Chat list (need to login) |
| http://localhost:5173/chats/CHAT_ID | Chat room (need to login) |
| http://localhost:5173/example | API testing page |
| http://localhost:3000/api | Swagger API docs |

## Backend Features (All Working!)

The backend is **100% complete** with:

- ✅ JWT Authentication
- ✅ User Management
- ✅ Chat System (1-on-1 and group)
- ✅ Messages (text, voice, file)
- ✅ Bidding System
- ✅ AI Translation
- ✅ WebSocket (real-time)
- ✅ File Storage
- ✅ Message Replies
- ✅ Message Editing
- ✅ Complete API Documentation

## Frontend Status

**Implemented (Working):**
- ✅ Login/Register pages
- ✅ Chat list
- ✅ Chat room
- ✅ Send messages
- ✅ Protected routes

**Not Yet Implemented:**
- 🚧 Create new chat (use Swagger for now)
- 🚧 Invite users
- 🚧 Voice/file upload
- 🚧 Message replies
- 🚧 Message editing
- 🚧 Bidding UI
- 🚧 Translation toggle
- 🚧 Real-time updates (refresh to see new messages)

## Common Tasks

### Create a Second User

```bash
# Register on the app or use Swagger:
# POST /auth/register
{
  "email": "driver@test.com",
  "password": "password123",
  "name": "John Driver",
  "role": "TRUCK_DRIVER"
}
```

### Create a Chat

```bash
# Via Swagger: POST /chats
{
  "participants": ["USER_ID_HERE"]
}
```

### Send Message

```bash
# In the app: Type in chat room and click Send
# Or via Swagger: POST /messages
{
  "chatId": "CHAT_ID",
  "type": "TEXT",
  "content": "Hello!"
}
```

### Upload File

```bash
# Via Swagger: POST /messages
# Select "multipart/form-data"
# chatId: CHAT_ID
# type: FILE
# content: File description
# file: Choose file
```

### Create Bid

```bash
# Via Swagger: POST /bids
{
  "chatId": "CHAT_ID",
  "amount": 1500,
  "currency": "USD",
  "description": "Delivery in 3 days"
}
```

## Troubleshooting

### Backend not starting?

```bash
# Check if MongoDB is running
docker-compose logs mongodb

# Restart everything
docker-compose down
docker-compose up
```

### Frontend not loading?

```bash
# Check if running
docker-compose ps

# View logs
docker-compose logs frontend

# Rebuild
docker-compose up --build
```

### Can't login?

- Make sure you registered first
- Check email/password
- Try registering a new account
- Check backend is running: http://localhost:3000/api

### Chat list empty?

- Create a chat via Swagger
- Refresh the page
- Check you're logged in (green badge)

## Useful Commands

```bash
# Start everything
docker-compose up

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build

# Clean everything
docker-compose down -v
```

## Documentation

- **[FRONTEND_COMPLETE.md](./FRONTEND_COMPLETE.md)** - What was implemented
- **[API_REFERENCE.md](./API_REFERENCE.md)** - All API endpoints
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker complete guide
- **[README.md](./README.md)** - Project overview

## Next Steps

1. ✅ Use the app as-is (core features work!)
2. 🚧 Add "New Chat" UI (see IMPLEMENTATION_GUIDE.md)
3. 🚧 Connect WebSocket for real-time
4. 🚧 Add voice/file upload
5. 🚧 Implement bidding UI

## Need Help?

1. Check Swagger: http://localhost:3000/api
2. Check logs: `docker-compose logs`
3. Read: FRONTEND_COMPLETE.md
4. Try: Example page at /example

---

**Ready to chat!** 🎉

```bash
docker-compose up
# → http://localhost:5173
```
