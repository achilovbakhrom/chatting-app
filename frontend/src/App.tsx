import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { socketService } from './services/socket';
import api from './services/api';
import ExamplePage from './ExamplePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ChatsPage from './features/chat/ChatsPage';
import NewChatPage from './features/chat/NewChatPage';
import ChatRoomPage from './features/chat/ChatRoomPage';
import SettingsPage from './features/settings/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Global socket listener component
function GlobalSocketListener() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUnreadCounts = useChatStore((state) => state.setUnreadCounts);
  const updateChatLastMessage = useChatStore((state) => state.updateChatLastMessage);
  const location = useLocation();

  useEffect(() => {
    if (!token || !user) return;

    console.log('GlobalSocketListener: Setting up socket connection');

    // Connect to socket
    socketService.connect(token);

    // Remove any existing listeners first to avoid duplicates
    socketService.getSocket()?.off('message:new');

    // Listen for new messages globally
    const handleNewMessage = (message: any) => {
      console.log('Global socket - new message received:', message);

      // Get sender ID from message
      const senderId = typeof message.senderId === 'object'
        ? (message.senderId._id || message.senderId.id)
        : message.senderId;

      const currentUserId = user?.id || (user as any)?._id;

      // Only increment unread if:
      // 1. Message is from another user
      // 2. We're not currently in that specific chat room
      const isInChatRoom = location.pathname === `/chats/${message.chatId}`;

      console.log('Is in chat room?', isInChatRoom, 'Path:', location.pathname, 'Chat ID:', message.chatId);

      if (String(senderId) !== String(currentUserId) && !isInChatRoom) {
        console.log('New message from another user while not in chat room');

        // Reload unread counts from backend
        api.get('/unread').then(response => {
          // Response is simple map: { chatId: count }
          setUnreadCounts(response.data);
          console.log('[App] Reloaded unread counts:', response.data);
        }).catch(err => console.error('Failed to reload unread counts', err));

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New message', {
            body: message.content.substring(0, 50),
            icon: '/favicon.ico',
          });
        }
      }

      // Update the chat's last message in the store
      console.log('Updating chat last message in store for chat:', message.chatId);
      updateChatLastMessage(message.chatId, {
        _id: message._id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        createdAt: message.createdAt,
      });

      // Trigger a custom event that other components can listen to if needed
      window.dispatchEvent(new CustomEvent('chat:newMessage', { detail: message }));
    };

    socketService.onNewMessage(handleNewMessage);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('GlobalSocketListener: Cleanup');
      // Keep socket connected, just remove the listener
      socketService.getSocket()?.off('message:new', handleNewMessage);
    };
  }, [token, user, location.pathname, setUnreadCounts, updateChatLastMessage]);

  return null;
}

function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Flexobo Chat Application
          </h1>
          <p className="text-xl text-muted-foreground">
            A full-stack chat application with authentication, bidding, and AI translation
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Get Started</h2>
            <p className="text-muted-foreground">
              Choose an option below to begin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/login"
              className="bg-primary text-primary-foreground px-6 py-4 rounded-lg hover:bg-primary/90 font-medium"
            >
              Sign In →
            </Link>
            <Link
              to="/register"
              className="bg-secondary text-secondary-foreground px-6 py-4 rounded-lg hover:bg-secondary/90 font-medium"
            >
              Create Account →
            </Link>
          </div>

          <div className="pt-4 border-t border-border">
            <Link
              to="/example"
              className="text-primary hover:underline text-sm"
            >
              Try Interactive API Example
            </Link>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li>✅ JWT Authentication</li>
            <li>✅ Real-time Chat with Socket.io</li>
            <li>✅ Text, Voice, and File Messages</li>
            <li>✅ Group Chat with Invites</li>
            <li>✅ Bidding System for Negotiations</li>
            <li>✅ AI Translation (OpenAI)</li>
            <li>✅ Message Reply and Edit</li>
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Backend API:{' '}
            <a
              href="http://localhost:3000/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              http://localhost:3000/api
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <GlobalSocketListener />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/example" element={<ExamplePage />} />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/new"
          element={
            <ProtectedRoute>
              <NewChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:chatId"
          element={
            <ProtectedRoute>
              <ChatRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
