# Flexobo Chat Example

A full-stack monorepo chat application for load owners and truck drivers, featuring real-time messaging, bidding/negotiation system, and AI-powered translation.

## Project Status

**Backend:** ✅ Complete and Functional
**Frontend:** 🚧 Infrastructure ready, UI components need implementation
**Example Page:** ✅ Working interactive API demo available!

## Features

### Completed ✅
- JWT Authentication with roles (Load Owner / Truck Driver)
- Real-time chat with Socket.io
- Support for text, voice messages, and file sharing
- 1-on-1 and group chat with invite functionality
- Bidding/negotiation system (only in 2-person chats)
- AI-powered translation (OpenAI)
- Message replies and editing (with history tracking)
- Configurable mutable/immutable chats
- Interface-based storage (Local implementation complete, S3-ready)
- Complete REST API with Swagger documentation
- WebSocket events for real-time updates

### To Be Implemented 🚧
- Frontend UI components (auth pages, chat interface, etc.)
- Voice recording in browser
- File upload UI
- Translation toggle UI
- Bidding UI

## Tech Stack

**Backend:**
- NestJS + TypeScript
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- OpenAI API
- Multer (file uploads)

**Frontend:**
- React + TypeScript
- Vite
- Radix UI
- Tailwind CSS
- Socket.io Client
- Axios
- Zustand

## Quick Start

### Option 1: Docker (Recommended - Easiest)

**Prerequisites:** Docker Desktop only

```bash
# 1. Create environment file
cp .env.docker .env
# Edit .env and add your OPENAI_API_KEY (optional)

# 2. Start everything
docker-compose up
```

**That's it!** No Node.js or MongoDB installation needed.

### Option 2: Local Installation

**Prerequisites:** Node.js v18+, MongoDB, OpenAI API Key (optional)

```bash
# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# The .env files are already created. Update them:
# - backend/.env: Add your MongoDB URI and OpenAI API key
# - frontend/.env: Already configured for local development

# Start MongoDB
# (brew services start mongodb-community on macOS)

# Start both servers
npm run dev
```

**Access (both options):**
- Frontend: http://localhost:5173
- **Interactive Example:** http://localhost:5173/example 🎯
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api

## Documentation

### 🐳 Docker (Recommended)
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete Docker setup and usage guide
- **[DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)** - One-page Docker cheat sheet
- **[Makefile](./Makefile)** - Convenient command shortcuts

### 🚀 Getting Started
- **[RUN_EXAMPLE.md](./RUN_EXAMPLE.md)** - Run the interactive example in 2 steps
- **[EXAMPLE_PAGE.md](./EXAMPLE_PAGE.md)** - Complete example page guide
- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes (local setup)
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions and troubleshooting

### 💻 Development
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete frontend implementation guide
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoint reference

### 📊 Summaries
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete feature breakdown
- **[DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md)** - Docker setup summary

## Architecture Highlights

### Backend Structure
```
backend/src/
├── auth/          # JWT authentication
├── users/         # User management
├── chats/         # Chat CRUD operations
├── messages/      # Messages with file/voice support
├── bids/          # Bidding system
├── storage/       # Interface-based storage (local/S3)
├── translation/   # OpenAI translation
├── websocket/     # Socket.io gateway
└── common/        # Shared utilities, guards, decorators
```

### Key Design Patterns
- **Interface-based storage** - Easy migration from local to S3
- **Role-based access control** - Load Owner vs Truck Driver
- **Real-time architecture** - Authenticated WebSocket with room-based broadcasting
- **Translation caching** - Store translations to minimize API calls
- **Edit history tracking** - Full audit trail for message edits

## API Overview

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with JWT

### Chats
- `POST /chats` - Create chat
- `GET /chats` - Get user's chats
- `POST /chats/:id/invite` - Invite user to chat

### Messages
- `POST /messages` - Send message (multipart for files)
- `GET /messages/chat/:chatId` - Get chat messages
- `PATCH /messages/:id` - Edit message
- `POST /messages/:id/translate` - Translate message

### Bids
- `POST /bids` - Create bid
- `GET /bids/chat/:chatId` - Get chat bids
- `PATCH /bids/:id/status` - Accept/reject bid

### WebSocket Events
- `message:new`, `message:update`, `message:delete`
- `chat:userJoined`
- `bid:created`, `bid:updated`
- `typing:start`, `typing:stop`

## Development

```bash
# Start both servers
npm run dev

# Or start separately:
npm run dev:backend
npm run dev:frontend

# Build for production
npm run build
```

## Testing the Backend

Use the Swagger UI at http://localhost:3000/api

1. Register a user via `POST /auth/register`
2. Copy the access_token from response
3. Click "Authorize" and enter: `Bearer YOUR_TOKEN`
4. Test all endpoints

## Next Steps

1. Review [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. Implement frontend components:
   - Authentication pages (Login/Register)
   - Chat list and chat room
   - Message components (text, voice, file)
   - Voice recorder using MediaRecorder API
   - File upload with FormData
   - Bidding interface
   - Translation toggle
3. Integrate WebSocket for real-time updates
4. Test end-to-end functionality

## Production Considerations

- Change JWT_SECRET to a secure random string
- Use MongoDB Atlas or production database
- Implement S3StorageService for file storage
- Enable HTTPS and secure CORS
- Set up proper logging and monitoring
- Add rate limiting and input validation
- Configure environment-specific settings

## License

MIT
