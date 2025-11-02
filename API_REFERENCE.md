# API Reference

Quick reference for all backend API endpoints.

Base URL: `http://localhost:3000`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "TRUCK_DRIVER" | "LOAD_OWNER",
  "language": "en",      // optional
  "company": "ABC Corp"  // optional
}

Response: {
  "access_token": "jwt-token...",
  "user": { ...user object }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "access_token": "jwt-token...",
  "user": { ...user object }
}
```

## Users

**All endpoints require Authorization header:**
```
Authorization: Bearer <jwt-token>
```

### Get All Users
```http
GET /users
```

### Get Current User
```http
GET /users/me
```

### Get User by ID
```http
GET /users/:id
```

### Update User
```http
PATCH /users/:id
Content-Type: application/json

{
  "name": "New Name",        // optional
  "language": "es",          // optional
  "company": "New Company",  // optional
  "avatar": "url"            // optional
}
```

### Delete User
```http
DELETE /users/:id
```

## Chats

### Create Chat
```http
POST /chats
Content-Type: application/json
Authorization: Bearer <token>

{
  "participants": ["userId1", "userId2"],  // Array of user IDs
  "isMutable": true                         // optional, default true
}
```

### Get User's Chats
```http
GET /chats
Authorization: Bearer <token>
```

### Get Chat by ID
```http
GET /chats/:chatId
Authorization: Bearer <token>
```

### Invite User to Chat
```http
POST /chats/:chatId/invite
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "userId123"
}
```

### Delete Chat
```http
DELETE /chats/:chatId
Authorization: Bearer <token>
```

## Messages

### Send Text Message
```http
POST /messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "chatId": "chatId123",
  "type": "TEXT",
  "content": "Hello world!",
  "replyTo": "messageId"  // optional
}
```

### Send File/Voice Message
```http
POST /messages
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form data:
- chatId: "chatId123"
- type: "FILE" or "VOICE"
- content: "File description"
- file: <binary file data>
- replyTo: "messageId"  // optional
```

### Get Chat Messages
```http
GET /messages/chat/:chatId
Authorization: Bearer <token>
```

### Get Message by ID
```http
GET /messages/:messageId
Authorization: Bearer <token>
```

### Edit Message
```http
PATCH /messages/:messageId
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Updated message content"
}

Note: Only works if chat is mutable and you're the sender
```

### Delete Message
```http
DELETE /messages/:messageId
Authorization: Bearer <token>

Note: Only sender can delete. Deletes associated files too.
```

### Translate Message
```http
POST /messages/:messageId/translate
Content-Type: application/json
Authorization: Bearer <token>

{
  "targetLanguage": "es"  // ISO 639-1 language code
}

Response: {
  "translatedText": "Translated content..."
}

Note: Translation is cached in message document
```

### Download File
```http
GET /messages/:messageId/download
Authorization: Bearer <token>

Returns: File binary data with proper headers
```

## Bids

### Create Bid
```http
POST /bids
Content-Type: application/json
Authorization: Bearer <token>

{
  "chatId": "chatId123",
  "amount": 1500,
  "currency": "USD",
  "description": "Delivery within 3 days"  // optional
}

Note: Only works in chats with 2 participants
```

### Get Chat Bids
```http
GET /bids/chat/:chatId
Authorization: Bearer <token>
```

### Get Bid by ID
```http
GET /bids/:bidId
Authorization: Bearer <token>
```

### Update Bid Status
```http
PATCH /bids/:bidId/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "ACCEPTED" | "REJECTED"
}

Note: Only the recipient (not creator) can update status
```

### Delete Bid
```http
DELETE /bids/:bidId
Authorization: Bearer <token>

Note: Only creator can delete. Only pending bids can be deleted.
```

## WebSocket Events

Connect to WebSocket with JWT authentication:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket']
});
```

### Client → Server Events

#### Join Chat
```javascript
socket.emit('join:chat', chatId);
```

#### Leave Chat
```javascript
socket.emit('leave:chat', chatId);
```

#### Typing Start
```javascript
socket.emit('typing:start', {
  chatId: 'chatId123',
  userName: 'John Doe'
});
```

#### Typing Stop
```javascript
socket.emit('typing:stop', chatId);
```

### Server → Client Events

#### New Message
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

#### Message Updated
```javascript
socket.on('message:update', (message) => {
  console.log('Message edited:', message);
});
```

#### Message Deleted
```javascript
socket.on('message:delete', (messageId) => {
  console.log('Message deleted:', messageId);
});
```

#### User Joined Chat
```javascript
socket.on('chat:userJoined', (user) => {
  console.log('User joined:', user);
});
```

#### Bid Created
```javascript
socket.on('bid:created', (bid) => {
  console.log('New bid:', bid);
});
```

#### Bid Updated
```javascript
socket.on('bid:updated', (bid) => {
  console.log('Bid updated:', bid);
});
```

#### Typing Start
```javascript
socket.on('typing:start', ({ userId, userName }) => {
  console.log(`${userName} is typing...`);
});
```

#### Typing Stop
```javascript
socket.on('typing:stop', ({ userId }) => {
  console.log('User stopped typing');
});
```

## Response Formats

### User Object
```json
{
  "_id": "userId123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "TRUCK_DRIVER",
  "language": "en",
  "avatar": "url",
  "company": "ABC Corp",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Chat Object
```json
{
  "_id": "chatId123",
  "participants": [{ ...user objects }],
  "isMutable": true,
  "createdBy": { ...user object },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Message Object
```json
{
  "_id": "messageId123",
  "chatId": "chatId123",
  "senderId": { ...user object },
  "type": "TEXT",
  "content": "Hello world!",
  "replyTo": { ...message object },  // optional
  "translations": [
    { "language": "es", "text": "¡Hola mundo!" }
  ],
  "editHistory": [
    { "content": "Old content", "editedAt": "2024-01-01..." }
  ],
  "fileMetadata": {  // for FILE/VOICE messages
    "originalName": "file.pdf",
    "mimeType": "application/pdf",
    "size": 1024,
    "fileId": "uuid"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Bid Object
```json
{
  "_id": "bidId123",
  "messageId": "messageId123",
  "chatId": "chatId123",
  "amount": 1500,
  "currency": "USD",
  "description": "Delivery within 3 days",
  "status": "PENDING",
  "createdBy": { ...user object },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not allowed to access resource)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

## Testing with curl

### Register and Login
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "TRUCK_DRIVER"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the token from response
```

### Authenticated Requests
```bash
TOKEN="your-jwt-token-here"

# Get users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"

# Create chat
curl -X POST http://localhost:3000/chats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participants": ["userId1", "userId2"],
    "isMutable": true
  }'

# Send message
curl -X POST http://localhost:3000/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "chatId123",
    "type": "TEXT",
    "content": "Hello from curl!"
  }'
```

### File Upload
```bash
curl -X POST http://localhost:3000/messages \
  -H "Authorization: Bearer $TOKEN" \
  -F "chatId=chatId123" \
  -F "type=FILE" \
  -F "content=Important document" \
  -F "file=@/path/to/file.pdf"
```

## Swagger UI

For interactive API testing, visit:

**http://localhost:3000/api**

Features:
- Try all endpoints in browser
- See request/response schemas
- Authenticate with JWT token
- No external tools needed

---

For more details, see:
- `IMPLEMENTATION_GUIDE.md` - Frontend implementation
- `SETUP.md` - Setup instructions
- `README.md` - Project overview
