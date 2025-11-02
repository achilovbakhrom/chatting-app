import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { socketService } from '../../services/socket';
import { formatDate } from '../../lib/utils';
import { MessageType } from '../../types';

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidCurrency, setBidCurrency] = useState('USD');
  const [bidDescription, setBidDescription] = useState('');
  const [bidAddressedTo, setBidAddressedTo] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}); // userId -> userName
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { currentChat, messages, setCurrentChat, setMessages, addMessage, updateMessage, deleteMessage, clearUnread } = useChatStore();

  // Check if there's an accepted or rejected bid
  const hasAcceptedOrRejectedBid = () => {
    return messages.some((msg: any) => {
      if (msg.type === 'BID' && msg.bidData) {
        return msg.bidData.status === 'ACCEPTED' || msg.bidData.status === 'REJECTED';
      }
      return false;
    });
  };

  // Auto-scroll to bottom when new messages arrive or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Connect to WebSocket and join chat
  useEffect(() => {
    if (chatId && token) {
      // Connect to WebSocket
      socketService.connect(token);

      // Join the chat room
      socketService.joinChat(chatId);

      // Listen for new messages
      socketService.onNewMessage((message) => {
        // Only add message if it's for this chat and not from current user
        if (message.chatId === chatId) {
          addMessage(message);
        }
      });

      // Listen for message updates
      socketService.onMessageUpdate((message) => {
        if (message.chatId === chatId) {
          updateMessage(message);
        }
      });

      // Listen for message deletions
      socketService.onMessageDelete((messageId) => {
        deleteMessage(messageId);
      });

      // Listen for bid updates
      socketService.onBidUpdated((updatedBid) => {
        console.log('Bid updated:', updatedBid);
        // Reload messages to get the updated bid data
        loadMessages();
      });

      // Listen for typing events
      socketService.onTypingStart((data) => {
        // Only show typing for this chat
        if (data.chatId === chatId && data.userId !== (user?.id || (user as any)?._id)) {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: data.userName
          }));
        }
      });

      socketService.onTypingStop((data) => {
        // Only process typing stop for this chat
        if (data.chatId === chatId) {
          setTypingUsers(prev => {
            const newTyping = { ...prev };
            delete newTyping[data.userId];
            return newTyping;
          });
        }
      });

      // Cleanup on unmount
      return () => {
        if (chatId) {
          socketService.leaveChat(chatId);
        }
        socketService.removeAllListeners();
      };
    }
  }, [chatId, token, user]);

  useEffect(() => {
    if (chatId) {
      loadChat();
      loadMessages();
      // Clear unread count when entering chat
      clearUnread(chatId);
    }
  }, [chatId]);

  const loadChat = async () => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      console.log('Chat loaded from API:', response.data);
      console.log('Participants:', response.data.participants);
      setCurrentChat(response.data);
    } catch (err) {
      console.error('Failed to load chat', err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/chat/${chatId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    if (!chatId) return;

    // Send typing start
    socketService.sendTypingStart(chatId, user?.name || 'User');

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing stop after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTypingStop(chatId);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    // Stop typing indicator
    if (chatId) {
      socketService.sendTypingStop(chatId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      setSending(true);
      const messageData: any = {
        chatId,
        type: MessageType.TEXT,
        content: messageText,
      };

      if (replyingTo) {
        messageData.replyTo = replyingTo._id;
      }

      await api.post('/messages', messageData);
      // Don't add message locally - WebSocket will broadcast it to all clients including sender
      setMessageText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || sending) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('chatId', chatId!);
      formData.append('type', MessageType.FILE);
      formData.append('content', file.name);
      formData.append('file', file);

      await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to send file', err);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    try {
      setSending(true);
      const formData = new FormData();
      formData.append('chatId', chatId!);
      formData.append('type', MessageType.VOICE);
      formData.append('content', 'Voice message');
      formData.append('file', audioBlob, 'voice-message.webm');

      await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err) {
      console.error('Failed to send voice message', err);
    } finally {
      setSending(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !bidAddressedTo || sending) return;

    try {
      setSending(true);
      await api.post('/bids', {
        chatId,
        amount: parseFloat(bidAmount),
        currency: bidCurrency,
        description: bidDescription || undefined,
        addressedTo: bidAddressedTo,
      });

      // Reset form and close modal
      setBidAmount('');
      setBidCurrency('USD');
      setBidDescription('');
      setBidAddressedTo('');
      setShowBidModal(false);
    } catch (err: any) {
      console.error('Failed to create bid', err);
      alert(err.response?.data?.message || 'Failed to create bid');
    } finally {
      setSending(false);
    }
  };

  const handleBidAction = async (bidId: string, action: 'accept' | 'reject') => {
    try {
      const socket = socketService.getSocket();
      if (!socket) {
        throw new Error('Socket not connected');
      }

      // Emit bid status update via Socket.io
      socket.emit('bid:updateStatus', {
        bidId,
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      }, (response: any) => {
        if (!response.success) {
          console.error(`Failed to ${action} bid:`, response.error);
          alert(response.error || `Failed to ${action} bid`);
        }
      });
    } catch (err: any) {
      console.error(`Failed to ${action} bid`, err);
      alert(err.message || `Failed to ${action} bid`);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || !currentChat?.isMutable) return;

    try {
      setSending(true);
      await api.post(`/chats/${chatId}/participants`, { email: userEmail });
      setUserEmail('');
      setShowInviteModal(false);
      // Refresh chat data to show new participant
      const response = await api.get(`/chats/${chatId}`);
      setCurrentChat(response.data);
    } catch (err: any) {
      console.error('Failed to invite user', err);
      alert(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate('/chats')}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">
            {(() => {
              if (!currentChat?.participants) return 'Chat';
              const currentUserId = (user as any)?._id || user?.id;

              console.log('Debug - Current User ID:', currentUserId);
              console.log('Debug - Participants:', currentChat.participants.map((p: any) => ({
                id: p.id,
                _id: p._id,
                name: p.name
              })));

              const otherParticipants = currentChat.participants.filter((p: any) => {
                const participantId = p._id || p.id;
                const match = String(participantId) !== String(currentUserId);
                console.log(`Debug - Comparing ${participantId} with ${currentUserId}: ${match ? 'DIFFERENT' : 'SAME'}`);
                return match;
              });

              console.log('Debug - Other participants:', otherParticipants.map((p: any) => p.name));

              const names = otherParticipants.map((p: any) => p.name).filter(Boolean).join(', ');
              return names || 'Chat';
            })()}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentChat?.participants.length} participant
            {currentChat && currentChat.participants.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Show Invite button only for mutable chats */}
          {currentChat?.isMutable && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Invite
            </button>
          )}
          {/* Show Bid button only for 2-person chats and when no bid is accepted/rejected */}
          {currentChat?.participants.length === 2 && !hasAcceptedOrRejectedBid() && (
            <button
              onClick={() => setShowBidModal(true)}
              className="bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg text-sm font-medium"
            >
              {user?.role === 'LOAD_OWNER' ? '📋 Ask for Bid' : '💰 Submit Bid'}
            </button>
          )}
        </div>
      </div>

      {/* Translation Status Banner */}
      {user?.translationEnabled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2 flex items-center gap-2 text-sm">
          <span className="text-blue-600 dark:text-blue-400">🌐</span>
          <span className="text-blue-700 dark:text-blue-300">
            Live translation enabled - Messages will be translated to <strong>{user.language.toUpperCase()}</strong>
          </span>
          <button
            onClick={() => navigate('/settings')}
            className="ml-auto text-blue-600 dark:text-blue-400 hover:underline text-xs"
          >
            Settings
          </button>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">
              {user?.role === 'LOAD_OWNER' ? 'Ask for a Bid' : 'Submit Your Bid'}
            </h3>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {user?.role === 'LOAD_OWNER' ? 'Budget/Expected Amount *' : 'Your Bid Amount *'}
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={user?.role === 'LOAD_OWNER' ? 'e.g., 1000' : 'e.g., 850'}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Addressed To *</label>
                <select
                  value={bidAddressedTo}
                  onChange={(e) => setBidAddressedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  required
                >
                  <option value="">Select recipient...</option>
                  {currentChat?.participants
                    .filter((p: any) => {
                      const participantId = p._id || p.id;
                      const currentUserId = user?.id || (user as any)?._id;
                      return String(participantId) !== String(currentUserId);
                    })
                    .map((p: any) => {
                      console.log('Participant in dropdown:', p);
                      const displayName = p.name || 'Unknown User';
                      const displayRole = p.role || 'N/A';
                      return (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {displayName} ({displayRole})
                        </option>
                      );
                    })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency *</label>
                <select
                  value={bidCurrency}
                  onChange={(e) => setBidCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={bidDescription}
                  onChange={(e) => setBidDescription(e.target.value)}
                  placeholder={user?.role === 'LOAD_OWNER'
                    ? 'e.g., Load details: 20 tons, 500 miles, delivery by Friday...'
                    : 'e.g., Can deliver within 3 days, have refrigerated truck...'}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!bidAmount || !bidAddressedTo || sending}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending
                    ? 'Sending...'
                    : user?.role === 'LOAD_OWNER'
                    ? 'Send Request'
                    : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">Invite User to Chat</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!userEmail || sending}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const senderId = typeof message.senderId === 'object'
              ? (message.senderId.id || (message.senderId as any)._id)
              : message.senderId;
            const currentUserId = user?.id || (user as any)?._id;
            const isOwn = senderId === currentUserId;
            const isVoice = message.type === MessageType.VOICE;
            const isFile = message.type === MessageType.FILE;
            const isBid = message.type === MessageType.BID;

            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${isBid ? 'max-w-2xl' : 'max-w-md'} px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1">
                      {typeof message.senderId === 'object' ? message.senderId.name : ''}
                    </p>
                  )}

                  {/* Reply Preview */}
                  {message.replyTo && (
                    <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
                      isOwn
                        ? 'bg-primary-foreground/10 border-primary-foreground/30'
                        : 'bg-background/50 border-border'
                    }`}>
                      <p className="font-semibold opacity-70">
                        {typeof message.replyTo.senderId === 'object'
                          ? message.replyTo.senderId.name
                          : 'User'}
                      </p>
                      <p className="opacity-60 truncate">
                        {message.replyTo.content.substring(0, 50)}
                        {message.replyTo.content.length > 50 ? '...' : ''}
                      </p>
                    </div>
                  )}

                  {isVoice ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>🎤</span>
                        <span className="text-sm">Voice message</span>
                      </div>
                      <audio controls className="w-full max-w-xs">
                        <source src={message.content} type="audio/webm" />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  ) : isFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>📎</span>
                        <span className="text-sm font-medium">
                          {message.fileMetadata?.originalName || 'File'}
                        </span>
                      </div>
                      {message.fileMetadata?.mimeType?.startsWith('image/') ? (
                        <div className="space-y-2">
                          <img
                            src={message.content}
                            alt={message.fileMetadata?.originalName}
                            className="max-w-xs rounded cursor-pointer"
                            onClick={() => window.open(message.content, '_blank')}
                          />
                          <div className="flex gap-2">
                            <a
                              href={message.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 bg-background rounded hover:bg-accent"
                            >
                              View
                            </a>
                            <a
                              href={message.content}
                              download={message.fileMetadata?.originalName}
                              className="text-xs px-2 py-1 bg-background rounded hover:bg-accent"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ) : message.fileMetadata?.mimeType?.startsWith('video/') ? (
                        <div className="space-y-2">
                          <video
                            controls
                            className="max-w-xs rounded"
                            src={message.content}
                          />
                          <a
                            href={message.content}
                            download={message.fileMetadata?.originalName}
                            className="text-xs px-2 py-1 bg-background rounded hover:bg-accent inline-block"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <a
                            href={message.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-2 bg-background rounded hover:bg-accent"
                          >
                            Open
                          </a>
                          <a
                            href={message.content}
                            download={message.fileMetadata?.originalName}
                            className="text-xs px-3 py-2 bg-background rounded hover:bg-accent"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  ) : isBid ? (
                    <div className="space-y-3 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg min-w-[320px]">
                      <div className="flex items-start gap-3">
                        <span className="text-4xl">💰</span>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <p className="font-bold text-3xl text-amber-900 dark:text-amber-100">{message.content}</p>
                            {(message as any).bidData && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                (message as any).bidData.status === 'ACCEPTED'
                                  ? 'bg-green-500 text-white shadow-md'
                                  : (message as any).bidData.status === 'REJECTED'
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-yellow-400 text-black shadow-md'
                              }`}>
                                {(message as any).bidData.status}
                              </span>
                            )}
                          </div>
                          {(message as any).bidData?.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{(message as any).bidData.description}</p>
                          )}
                        </div>
                      </div>
                      {(message as any).bidData?.addressedTo && (
                        <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span>👤</span>
                            <span className="font-medium">
                              Addressed to: {typeof (message as any).bidData.addressedTo === 'object'
                                ? (message as any).bidData.addressedTo.name
                                : 'User'}
                            </span>
                          </p>
                        </div>
                      )}
                      {(() => {
                        const bidData = (message as any).bidData;
                        if (bidData) {
                          const addressedToId = typeof bidData.addressedTo === 'object'
                            ? (bidData.addressedTo.id || bidData.addressedTo._id)
                            : bidData.addressedTo;
                          console.log('Bid Status:', bidData.status);
                          console.log('AddressedTo ID:', addressedToId);
                          console.log('Current User ID:', currentUserId);
                          console.log('Match:', String(addressedToId) === String(currentUserId));
                        }
                        return null;
                      })()}
                      {(message as any).bidData?.status === 'PENDING' &&
                       (message as any).bidData?.addressedTo &&
                       ((typeof (message as any).bidData.addressedTo === 'object'
                         ? ((message as any).bidData.addressedTo.id || (message as any).bidData.addressedTo._id)
                         : (message as any).bidData.addressedTo) === currentUserId) && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleBidAction((message as any).bidData._id, 'accept')}
                            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleBidAction((message as any).bidData._id, 'reject')}
                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium"
                          >
                            ✕ Reject
                          </button>
                          <button
                            onClick={() => {
                              setBidAmount('');
                              setBidCurrency((message as any).bidData.currency);
                              setBidDescription('');
                              setShowBidModal(true);
                            }}
                            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
                          >
                            💬 Another Bid or Ask
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Show translated content if available and user has translation enabled */}
                      {!isOwn && user?.translationEnabled && message.translations && message.translations.length > 0 ? (
                        <div className="space-y-2">
                          {(() => {
                            const userTranslation = message.translations.find(
                              (t: any) => t.language === user.language
                            );
                            if (userTranslation) {
                              return (
                                <>
                                  <p className="break-words">{userTranslation.text}</p>
                                  <details className="text-xs opacity-60">
                                    <summary className="cursor-pointer hover:opacity-80">
                                      Show original
                                    </summary>
                                    <p className="mt-1 italic">{message.content}</p>
                                  </details>
                                </>
                              );
                            }
                            return <p className="break-words">{message.content}</p>;
                          })()}
                        </div>
                      ) : (
                        <p className="break-words">{message.content}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatDate(message.createdAt)}
                    </p>
                    <button
                      onClick={() => setReplyingTo(message)}
                      className={`text-xs px-2 py-0.5 rounded hover:bg-background/20 ${
                        isOwn ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                      title="Reply to this message"
                    >
                      ↩️ Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
            </div>
            <span>
              {Object.keys(typingUsers).length === 1
                ? `${Object.values(typingUsers)[0]} is typing...`
                : `${Object.values(typingUsers).join(', ')} are typing...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-muted rounded-lg flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Replying to {typeof replyingTo.senderId === 'object' ? replyingTo.senderId.name : 'User'}
              </p>
              <p className="text-sm truncate">
                {replyingTo.content.substring(0, 80)}
                {replyingTo.content.length > 80 ? '...' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={sending}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="px-3 py-2 border border-input rounded-lg hover:bg-accent disabled:opacity-50"
            title="Send file"
          >
            📎
          </button>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={sending}
            className={`px-3 py-2 border border-input rounded-lg hover:bg-accent disabled:opacity-50 ${
              isRecording ? 'bg-destructive text-destructive-foreground' : ''
            }`}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={sending || isRecording}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || !messageText.trim() || isRecording}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        {isRecording && (
          <div className="mt-2 text-sm text-destructive animate-pulse">
            🔴 Recording... Click stop to send
          </div>
        )}
      </div>
    </div>
  );
}
