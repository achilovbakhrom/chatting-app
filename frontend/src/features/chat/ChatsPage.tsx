import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import api from '../../services/api';
import { formatDate } from '../../lib/utils';

export default function ChatsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const chats = useChatStore((state) => state.chats);
  const setChats = useChatStore((state) => state.setChats);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);
  const unreadCounts = useChatStore((state) => state.unreadCounts);
  const setUnreadCounts = useChatStore((state) => state.setUnreadCounts);
  const clearUnread = useChatStore((state) => state.clearUnread);

  useEffect(() => {
    loadChats();
    loadUnreadCounts();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (err: any) {
      setError('Failed to load chats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const response = await api.get('/unread');
      // Response is a map of chatId -> count
      setUnreadCounts(response.data);
    } catch (err: any) {
      console.error('Failed to load unread counts', err);
    }
  };

  const handleChatClick = async (chat: any) => {
    setCurrentChat(chat);
    // Clear unread on backend
    try {
      await api.patch(`/unread/${chat._id}/clear`);
      clearUnread(chat._id);
    } catch (err) {
      console.error('Failed to clear unread count', err);
    }
    navigate(`/chats/${chat._id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Flexobo Chat</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={() => navigate('/settings')}
              className="text-sm text-foreground hover:underline"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-destructive hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Chats</h2>
          <button
            onClick={() => navigate('/chats/new')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            New Chat
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground mb-4">No chats yet</p>
            <button
              onClick={() => navigate('/chats/new')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const unreadCount = unreadCounts[chat._id] || 0;
              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatClick(chat)}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-accent cursor-pointer transition relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {chat.participants
                            .filter((p: any) => p._id !== user?.id)
                            .map((p: any) => p.name)
                            .join(', ') || 'Chat'}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          <span className="font-medium">
                            {chat.lastMessage.senderId?._id === user?.id
                              ? 'You'
                              : chat.lastMessage.senderId?.name}:
                          </span>{' '}
                          {chat.lastMessage.type === 'BID'
                            ? '💰 Bid'
                            : chat.lastMessage.type === 'VOICE'
                            ? '🎤 Voice message'
                            : chat.lastMessage.type === 'FILE'
                            ? '📎 File'
                            : chat.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {chat.participants.length} participant
                          {chat.participants.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(chat.updatedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
