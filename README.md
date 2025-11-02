# Flexobo Chat Application

A full-stack real-time chat application with bidding system for load owners and truck drivers. Features include instant messaging, voice messages, file sharing, AI translation, and a built-in negotiation system.

## 🚀 Features

### Real-time Communication
- **Instant Messaging** - Real-time text messaging with Socket.io
- **Voice Messages** - Record and send voice notes
- **File Sharing** - Share files and documents
- **Typing Indicators** - See when others are typing
- **Unread Message Counts** - Track unread messages across chats
- **Browser Notifications** - Get notified of new messages

### Chat Management
- **1-on-1 & Group Chats** - Create private or group conversations
- **Invite Users** - Add participants to group chats
- **Last Message Preview** - See the latest message in chat list
- **Message Reply** - Reply to specific messages
- **Message Editing** - Edit sent messages (with history tracking)
- **Mutable/Immutable Chats** - Control if messages can be edited

### Bidding System
- **Send Bids** - Create negotiation offers (2-person chats only)
- **Accept/Reject Bids** - Respond to incoming bids
- **Counter Offers** - Send alternative bids
- **Bid Status Tracking** - Real-time bid status updates
- **Automatic Blocking** - No new bids after acceptance/rejection

### AI Translation
- **Auto-Translation** - Automatic message translation (OpenAI)
- **Multiple Languages** - Support for various languages
- **Translation Caching** - Store translations to reduce API calls
- **User Preferences** - Enable/disable translation per user

### User Roles
- **Load Owner** - Post loads and request bids
- **Truck Driver** - Browse loads and submit bids
- **Role-based UI** - Different interfaces based on role

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Secure authentication
- **OpenAI API** - AI-powered translation
- **Multer** - File upload handling

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe frontend
- **Vite** - Fast build tool
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time connection
- **Axios** - HTTP client

## 📋 Prerequisites

- **Node.js** v18+
- **MongoDB** v5+ (or MongoDB Atlas)
- **OpenAI API Key** (optional, for translation)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flexobo-chat-example
```

### 2. Install Dependencies

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

### 3. Configure Environment Variables

#### Backend Configuration

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flexobo-chat

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI (optional - for translation)
OPENAI_API_KEY=sk-your-openai-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads
```

#### Frontend Configuration

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### 4. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux with systemd
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

### 5. Run the Application

```bash
# Start both backend and frontend
npm run dev

# Or start separately:
npm run dev:backend  # Backend on http://localhost:3000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **API Documentation:** http://localhost:3000/api (Swagger UI)

## 📁 Project Structure

```
flexobo-chat-example/
├── backend/
│   ├── src/
│   │   ├── auth/           # JWT authentication
│   │   ├── users/          # User management
│   │   ├── chats/          # Chat operations
│   │   ├── messages/       # Message handling
│   │   ├── bids/           # Bidding system
│   │   ├── storage/        # File storage (local/S3)
│   │   ├── translation/    # AI translation
│   │   ├── websocket/      # Socket.io gateway
│   │   └── common/         # Shared utilities
│   ├── uploads/            # Local file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature modules
│   │   │   ├── auth/       # Login/Register
│   │   │   ├── chat/       # Chat UI
│   │   │   └── settings/   # User settings
│   │   ├── services/       # API & Socket services
│   │   ├── store/          # Zustand stores
│   │   └── types/          # TypeScript types
│   └── package.json
└── package.json            # Root scripts
```

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register        Register new user
POST   /auth/login           Login and get JWT token
GET    /auth/profile         Get current user profile
```

### Users
```
GET    /users                Get all users
GET    /users/:id            Get user by ID
PATCH  /users/settings       Update user settings
```

### Chats
```
POST   /chats                Create new chat
GET    /chats                Get user's chats
GET    /chats/:id            Get chat by ID
POST   /chats/:id/invite     Invite user to chat
DELETE /chats/:id            Delete chat (creator only)
```

### Messages
```
POST   /messages             Send message (supports multipart/form-data)
GET    /messages/chat/:id    Get chat messages
PATCH  /messages/:id         Edit message
DELETE /messages/:id         Delete message
POST   /messages/:id/translate  Translate message
GET    /messages/:id/download   Download file
```

### Bids
```
POST   /bids                 Create bid
GET    /bids/chat/:id        Get bids for chat
GET    /bids/:id             Get bid by ID
PATCH  /bids/:id/status      Update bid status (accept/reject)
```

## 🔄 WebSocket Events

### Client → Server
```javascript
'join:chat'          // Join a chat room
'leave:chat'         // Leave a chat room
'typing:start'       // User started typing
'typing:stop'        // User stopped typing
'bid:updateStatus'   // Update bid status (accept/reject)
```

### Server → Client
```javascript
'message:new'        // New message sent
'message:update'     // Message edited
'message:delete'     // Message deleted
'chat:userJoined'    // User joined chat
'bid:created'        // New bid created
'bid:updated'        // Bid status updated
'typing:start'       // User is typing
'typing:stop'        // User stopped typing
```

## 💡 Usage Examples

### Register and Login

1. Navigate to http://localhost:5173
2. Click "Create Account"
3. Fill in details:
   - Name: Your Name
   - Email: your@email.com
   - Password: ********
   - Role: Load Owner or Truck Driver
4. Login with credentials

### Create a Chat

1. From chat list, click "New Chat"
2. Enter recipient email
3. Start messaging

### Send a Bid (2-person chats only)

1. Open a chat with one other person
2. Click "Ask for Bid" (Load Owner) or "Submit Bid" (Truck Driver)
3. Enter amount, currency, and description
4. Recipient can Accept, Reject, or send Another Bid
5. After acceptance/rejection, no more bids can be sent

### Enable Translation

1. Click "Settings"
2. Enable "AI Translation"
3. Select your preferred language
4. Messages will auto-translate

### Send Voice/File

1. In chat, click 🎤 to record voice
2. Click 📎 to attach file
3. Messages sent in real-time

## 🧪 Testing

### API Testing with Swagger

1. Open http://localhost:3000/api
2. Click "Authorize" button
3. Register a user via `POST /auth/register`
4. Copy the `access_token` from response
5. Enter `Bearer YOUR_TOKEN` in authorization
6. Test all endpoints

### Testing Real-time Features

1. Open app in two different browsers
2. Login as different users
3. Create a chat between them
4. Test:
   - Typing indicators
   - Message sending
   - Unread counts
   - Bid creation/acceptance
   - File sharing

## 🔧 Development

### Build Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Production Build
npm run build            # Build both
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only

# Start Production
npm run start:backend    # Start built backend
npm run start:frontend   # Serve built frontend
```

### Environment Modes

- **Development:** Hot reload, debug logs
- **Production:** Optimized builds, minimal logs

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongo --version
mongosh  # Try to connect

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use

```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Socket Connection Issues

- Check `VITE_WS_URL` in `frontend/.env`
- Ensure backend is running
- Check browser console for errors
- Verify CORS settings in backend

### Translation Not Working

- Verify `OPENAI_API_KEY` in `backend/.env`
- Check OpenAI API quota
- Enable translation in user settings
- Check backend logs for errors

## 🚀 Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` to secure random string
- [ ] Use MongoDB Atlas or production database
- [ ] Implement S3 storage for files
- [ ] Enable HTTPS
- [ ] Configure secure CORS
- [ ] Set up rate limiting
- [ ] Enable input validation
- [ ] Add logging and monitoring
- [ ] Use environment variables for secrets
- [ ] Enable helmet.js for security headers

### Environment Variables (Production)

```env
NODE_ENV=production
JWT_SECRET=<secure-random-string>
MONGODB_URI=<production-mongodb-uri>
FRONTEND_URL=https://your-domain.com
OPENAI_API_KEY=<your-key>
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
