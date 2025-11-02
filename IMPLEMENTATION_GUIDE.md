# Flexobo Chat - Implementation Guide

## Project Status

### Completed ✅

#### Backend (NestJS)
- ✅ Complete authentication system with JWT
- ✅ User management with roles (Load Owner / Truck Driver)
- ✅ Chat system with participant management
- ✅ Message system (text, voice, file support)
- ✅ Reply to messages functionality
- ✅ Message editing with history tracking
- ✅ Bidding system for negotiations
- ✅ AI translation service (OpenAI)
- ✅ Storage interface with local implementation
- ✅ WebSocket gateway for real-time updates
- ✅ Complete API documentation with Swagger

#### Frontend (React)
- ✅ Project setup with Vite + TypeScript
- ✅ Tailwind CSS + Radix UI configuration
- ✅ Type definitions
- ✅ API service with axios
- ✅ WebSocket service
- ✅ Authentication service

### Remaining Tasks 🚧

#### Frontend Implementation Needed

**1. Store/State Management (Zustand)**
Create `src/store/authStore.ts`:
```typescript
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
```

Create `src/store/chatStore.ts` for managing chats and messages.

**2. Auth Pages**
- `src/features/auth/LoginPage.tsx`
- `src/features/auth/RegisterPage.tsx`

**3. Chat Components**
- `src/features/chat/ChatList.tsx` - List of all chats
- `src/features/chat/ChatRoom.tsx` - Main chat interface
- `src/features/chat/InviteUserModal.tsx` - Modal to invite users to chat

**4. Message Components**
- `src/features/messages/MessageList.tsx` - Display messages
- `src/features/messages/MessageItem.tsx` - Individual message
- `src/features/messages/MessageInput.tsx` - Input with file/voice support
- `src/features/messages/VoiceRecorder.tsx` - Voice recording component
- `src/features/messages/FileUpload.tsx` - File upload component
- `src/features/messages/TranslationToggle.tsx` - Toggle translation

**5. Bidding Components**
- `src/features/bids/BidForm.tsx` - Create bid
- `src/features/bids/BidItem.tsx` - Display bid with accept/reject
- `src/features/bids/BidList.tsx` - List of bids

**6. Routing**
Update `src/App.tsx` with React Router:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ChatPage from './features/chat/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chats" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/chats/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/chats" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**7. Voice Recording Implementation**
Use the MediaRecorder API:
```typescript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  // Handle recording...
};
```

**8. File Upload Implementation**
Use FormData with axios for file uploads.

**9. Real-time Integration**
Connect WebSocket events to update UI in real-time.

## Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB running on localhost:27017
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your credentials:
# - MONGODB_URI
# - JWT_SECRET
# - OPENAI_API_KEY

# Start backend
npm run start:dev
```

Backend will run on http://localhost:3000
API docs available at http://localhost:3000/api

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start frontend
npm run dev
```

Frontend will run on http://localhost:5173

## Architecture Overview

### Backend Structure
```
backend/src/
├── auth/              # JWT authentication
├── users/             # User management
├── chats/             # Chat CRUD operations
├── messages/          # Message handling
├── bids/              # Bidding system
├── storage/           # File storage (interface-based)
├── translation/       # OpenAI translation
├── websocket/         # Real-time Socket.io
└── common/            # Shared utilities
```

### Frontend Structure (Planned)
```
frontend/src/
├── components/        # Reusable UI components
├── features/          # Feature-based modules
│   ├── auth/
│   ├── chat/
│   ├── messages/
│   └── bids/
├── services/          # API & WebSocket
├── store/             # Zustand state management
├── hooks/             # Custom React hooks
└── types/             # TypeScript definitions
```

## Key Features

### 1. Authentication
- JWT-based auth
- Role-based access (Load Owner / Truck Driver)
- Token stored in localStorage

### 2. Chat System
- Create 1-on-1 chats
- Invite additional users (group chat)
- Configurable mutable/immutable chats
- Real-time updates

### 3. Messages
- Text messages
- Voice messages (browser-recorded)
- File attachments
- Reply to messages
- Edit messages (if chat is mutable)
- Edit history tracking

### 4. Bidding/Negotiation
- Only available in 2-person chats
- Create bids with amount and description
- Accept/reject/counter-offer
- Bid states: PENDING, ACCEPTED, REJECTED

### 5. AI Translation
- OpenAI-powered translation
- Optional per message
- Cached translations
- Auto language detection

### 6. Real-time Features
- Live message delivery
- Typing indicators
- User join notifications
- Bid status updates

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Users
- `GET /users` - Get all users
- `GET /users/me` - Get current user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user

### Chats
- `POST /chats` - Create chat
- `GET /chats` - Get user's chats
- `GET /chats/:id` - Get chat details
- `POST /chats/:id/invite` - Invite user to chat
- `DELETE /chats/:id` - Delete chat

### Messages
- `POST /messages` - Send message (with file upload)
- `GET /messages/chat/:chatId` - Get chat messages
- `GET /messages/:id` - Get message
- `PATCH /messages/:id` - Edit message
- `DELETE /messages/:id` - Delete message
- `POST /messages/:id/translate` - Translate message
- `GET /messages/:id/download` - Download file

### Bids
- `POST /bids` - Create bid
- `GET /bids/chat/:chatId` - Get chat bids
- `GET /bids/:id` - Get bid
- `PATCH /bids/:id/status` - Update bid status
- `DELETE /bids/:id` - Delete bid

### WebSocket Events

#### Client → Server
- `join:chat` - Join chat room
- `leave:chat` - Leave chat room
- `typing:start` - Start typing
- `typing:stop` - Stop typing

#### Server → Client
- `message:new` - New message
- `message:update` - Message edited
- `message:delete` - Message deleted
- `chat:userJoined` - User joined chat
- `bid:created` - New bid
- `bid:updated` - Bid status changed
- `typing:start` - User typing
- `typing:stop` - User stopped typing

## Next Steps

1. **Complete Frontend Components** - Implement all React components listed above
2. **Integrate WebSocket** - Connect real-time events to UI
3. **Voice Recording** - Implement MediaRecorder for voice messages
4. **File Upload** - Implement file upload with progress
5. **Translation UI** - Add translation toggle to messages
6. **Bidding UI** - Create bid forms and status indicators
7. **Testing** - Test all features end-to-end
8. **S3 Migration** - Implement S3StorageService when ready

## Tips for Completion

- Use Radix UI primitives for dialogs, dropdowns, popovers
- Implement lazy loading for messages (pagination)
- Add loading states and error handling
- Use React Query or SWR for data fetching (optional but recommended)
- Implement optimistic updates for better UX
- Add message search functionality
- Implement notification system
- Add user presence (online/offline status)

## Storage Migration (Future)

To switch from local to S3 storage:

1. Implement `S3StorageService` in `backend/src/storage/services/s3-storage.service.ts`
2. Add AWS credentials to `.env`
3. Change `STORAGE_TYPE=s3` in `.env`
4. No code changes needed - interface-based design handles it!

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify .env file exists and has all variables
- Check port 3000 is not in use

### Frontend build errors
- Run `npm install` in frontend directory
- Check Node version is 18+
- Clear node_modules and reinstall

### WebSocket connection fails
- Check backend is running
- Verify CORS settings in backend
- Check token is being sent correctly

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [Radix UI](https://www.radix-ui.com)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Tailwind CSS](https://tailwindcss.com)

---

**Project is functional and ready for frontend completion!**
