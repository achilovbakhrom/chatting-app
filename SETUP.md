# Setup Instructions

## Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** installed and running
- **OpenAI API Key** (for translation feature)

### 1. Install Dependencies

From the root directory:

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

### 2. Configure Environment Variables

#### Backend Configuration

The backend `.env` file has been created at `backend/.env`. Update these values:

```env
# MongoDB - Update if your MongoDB is on a different host/port
MONGODB_URI=mongodb://localhost:27017/flexobo-chat

# JWT Secret - CHANGE THIS to a random secure string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please-make-it-long-and-random

# OpenAI API Key - ADD YOUR KEY HERE for translation feature
OPENAI_API_KEY=your-openai-api-key-here
```

**Important:**
- Change the `JWT_SECRET` to a secure random string
- Add your OpenAI API key if you want to use the translation feature
- If MongoDB is not on localhost:27017, update `MONGODB_URI`

#### Frontend Configuration

The frontend `.env` file is already configured at `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

No changes needed unless you change the backend port.

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or run manually
mongod --dbpath /path/to/your/data/directory

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services or run mongod.exe
```

### 4. Start the Application

You have two options:

#### Option A: Start Both Together (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both backend and frontend concurrently.

#### Option B: Start Separately

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

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Documentation (Swagger):** http://localhost:3000/api

## Project Structure

```
flexobo-chat-example/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/        # JWT authentication
│   │   ├── users/       # User management
│   │   ├── chats/       # Chat operations
│   │   ├── messages/    # Message handling
│   │   ├── bids/        # Bidding system
│   │   ├── storage/     # File storage interface
│   │   ├── translation/ # AI translation
│   │   └── websocket/   # Real-time Socket.io
│   └── .env
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── services/    # API & Socket clients
│   │   ├── types/       # TypeScript types
│   │   └── lib/         # Utilities
│   └── .env
├── IMPLEMENTATION_GUIDE.md  # Detailed implementation guide
└── README.md           # Project overview
```

## What's Completed

### Backend (100% Complete)
✅ Authentication with JWT
✅ User management with roles
✅ Chat system (1-on-1 and group)
✅ Message system (text, voice, file)
✅ Reply and edit functionality
✅ Bidding/negotiation system
✅ AI translation service
✅ WebSocket real-time updates
✅ Storage interface (local + S3-ready)
✅ Complete API documentation

### Frontend (Infrastructure Complete)
✅ Vite + React + TypeScript setup
✅ Tailwind CSS + Radix UI configuration
✅ API service with axios
✅ WebSocket service
✅ Type definitions
✅ Basic UI placeholder

🚧 UI components need to be implemented (see IMPLEMENTATION_GUIDE.md)

## Testing the Backend

### Using Swagger UI

1. Go to http://localhost:3000/api
2. Try the following flow:

   **Register a User:**
   - Click on `POST /auth/register`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "driver@example.com",
       "password": "password123",
       "name": "John Driver",
       "role": "TRUCK_DRIVER",
       "language": "en"
     }
     ```
   - Click "Execute"
   - Copy the `access_token` from response

   **Authorize:**
   - Click "Authorize" button at top
   - Enter: `Bearer YOUR_ACCESS_TOKEN`
   - Click "Authorize"

   **Create a Chat:**
   - Now you can test other endpoints
   - Try `POST /chats`, `POST /messages`, etc.

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "name": "Jane Owner",
    "role": "LOAD_OWNER"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'

# Get users (with token)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`
- Or change port in `backend/.env`

### OpenAI Translation Not Working
**Solution:** Add a valid OpenAI API key to `backend/.env`:
```
OPENAI_API_KEY=sk-...your-key-here
```

### Frontend Build Errors
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

### For Development

1. **Complete Frontend UI** - See `IMPLEMENTATION_GUIDE.md` for detailed instructions on implementing:
   - Authentication pages (Login/Register)
   - Chat list and chat room
   - Message components (text, voice, file)
   - Voice recording
   - File upload
   - Bidding interface
   - Translation toggle

2. **Testing** - Test all features end-to-end

3. **Polish** - Add loading states, error handling, and polish UX

### For Production

1. **Security:**
   - Change JWT_SECRET to a strong random string
   - Use environment-specific .env files
   - Enable HTTPS
   - Set secure CORS policies

2. **Database:**
   - Use MongoDB Atlas or production MongoDB instance
   - Set up database backups
   - Configure indexes for performance

3. **Storage:**
   - Implement S3StorageService
   - Switch STORAGE_TYPE to 's3' in .env
   - Configure AWS credentials

4. **Deployment:**
   - Deploy backend to a cloud service (AWS, Google Cloud, Heroku)
   - Deploy frontend to Vercel, Netlify, or similar
   - Set up CI/CD pipelines

## Development Commands

### Root
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
npm run build            # Build both
```

### Backend
```bash
npm run start:dev        # Development mode with watch
npm run start:prod       # Production mode
npm run build            # Build for production
npm run lint             # Lint code
npm run test             # Run tests
```

### Frontend
```bash
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
```

## Architecture Highlights

### Interface-Based Storage
The storage system uses an interface pattern, making it easy to switch between local and S3 storage without changing code:

```typescript
interface IStorageService {
  upload(file: Buffer, metadata: FileMetadata): Promise<string>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<void>;
  getUrl(fileId: string): Promise<string>;
}
```

Simply change `STORAGE_TYPE` in .env to switch implementations.

### Real-time Architecture
WebSocket events are authenticated with JWT and namespaced by chat room:
- Clients join specific chat rooms
- Events are broadcasted only to chat participants
- Typing indicators, new messages, and bid updates are real-time

### Translation Caching
Translations are cached in the message document to avoid repeated API calls:
```typescript
message.translations = [
  { language: 'es', text: 'Hola' },
  { language: 'fr', text: 'Bonjour' }
]
```

## Support

For issues or questions:
1. Check the `IMPLEMENTATION_GUIDE.md` for detailed documentation
2. Review the Swagger API documentation at http://localhost:3000/api
3. Check the console logs for error messages

## License

MIT

---

**Ready to start! Backend is fully functional. Begin implementing frontend components to complete the application.**
