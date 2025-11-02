import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import api from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
}

export default function NewChatPage() {
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isMutable, setIsMutable] = useState(true);

  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const addChat = useChatStore((state) => state.addChat);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/users');
      // Filter out the current user
      const otherUsers = response.data.filter((u: User) => u._id !== currentUser?.id);
      setUsers(otherUsers);
    } catch (err: any) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/chats', {
        participants: selectedUsers,
        isMutable,
      });

      addChat(response.data);
      navigate(`/chats/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create chat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/chats')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">New Chat</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleCreateChat} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Select Participants</h2>
              <p className="text-sm text-muted-foreground">
                Choose one or more users to start a conversation
              </p>
            </div>

            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No other users available
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUser(user._id)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email} • {user.role}
                        {user.company && ` • ${user.company}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Chat Settings</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isMutable}
                onChange={(e) => setIsMutable(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium">Allow message editing</div>
                <div className="text-sm text-muted-foreground">
                  Participants can edit their messages after sending
                </div>
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/chats')}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Chat'}
            </button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              {selectedUsers.length} participant{selectedUsers.length > 1 ? 's' : ''} selected
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
