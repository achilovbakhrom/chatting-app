# Interactive API Example Page

A working frontend example that demonstrates the backend API functionality.

## What It Does

The example page provides an interactive UI to:
- ✅ Check backend health
- ✅ Register new users
- ✅ Login with JWT authentication
- ✅ Test authenticated API endpoints
- ✅ See real API responses
- ✅ Manage authentication state

## Quick Start

### Option 1: Using Docker (Easiest)

```bash
# Start everything
docker-compose up

# Frontend will be at http://localhost:5173
# Click "Try Interactive API Example" button
```

### Option 2: Local Development

```bash
# 1. Install frontend dependencies (if not already done)
cd frontend
npm install

# 2. Start backend
cd ../backend
npm run start:dev

# 3. Start frontend (in another terminal)
cd ../frontend
npm run dev

# 4. Open browser
# Visit http://localhost:5173
# Click "Try Interactive API Example" button
```

## How to Use

### 1. Check Backend Health

Click **"Check Backend Status"** to verify the backend is running.

Expected result:
```json
{
  "message": "Backend is running!",
  "response": "OK"
}
```

### 2. Register a User

Fill in the registration form:
- **Email**: test@example.com
- **Password**: password123
- **Full Name**: Test User
- **Role**: Truck Driver or Load Owner

Click **"Register"**

Expected result:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "TRUCK_DRIVER",
    ...
  }
}
```

The token is **automatically saved** for subsequent requests.

### 3. Login

If you already have an account:
- Enter email and password
- Click **"Login"**
- Token is saved automatically

### 4. Test API Endpoints

Once authenticated (green "✅ Authenticated" badge appears):

**Get All Users:**
- Click **"Get All Users"**
- See list of registered users

**Get My Chats:**
- Click **"Get My Chats"**
- See your chat list (empty if you haven't created any)

### 5. View Responses

All API responses appear in a colored box:
- **Green** = Success
- **Red** = Error

The response shows the actual JSON data from the backend.

## Features Demonstrated

### Authentication Flow
1. Register → Get token
2. Token stored in localStorage
3. Token automatically included in API requests
4. Logout → Token removed

### API Integration
- Axios service with JWT interceptor
- Automatic token attachment
- Error handling
- Response display

### State Management
- Authentication state
- Loading states
- Error states
- Form state

## Code Structure

### ExamplePage.tsx

The example page includes:

```typescript
// API call wrapper with error handling
const handleApiCall = async (apiFunction, successMessage) => {
  // Loading state
  // Try/catch with error handling
  // Response display
}

// Authentication handlers
handleRegister()
handleLogin()
handleLogout()

// API endpoint handlers
handleGetUsers()
handleGetChats()
handleCheckHealth()
```

### Features:
- ✅ Form validation
- ✅ Loading indicators
- ✅ Error messages
- ✅ Success responses
- ✅ Automatic token management
- ✅ Responsive design

## Testing Workflow

### Complete Test Flow

1. **Start Services**
   ```bash
   docker-compose up
   # or
   npm run dev  # from root
   ```

2. **Register User 1 (Load Owner)**
   - Email: owner@test.com
   - Password: password123
   - Name: Jane Owner
   - Role: Load Owner
   - Click Register
   - ✅ Should see success with token

3. **Get Users**
   - Click "Get All Users"
   - ✅ Should see your user in the list

4. **Logout**
   - Click "Logout"
   - ✅ Token removed, "Authenticated" badge disappears

5. **Register User 2 (Truck Driver)**
   - Email: driver@test.com
   - Password: password123
   - Name: John Driver
   - Role: Truck Driver
   - Click Register
   - ✅ Should see success

6. **Get Users Again**
   - Click "Get All Users"
   - ✅ Should see both users

7. **Login as First User**
   - Email: owner@test.com
   - Password: password123
   - Click Login
   - ✅ Should authenticate successfully

## API Endpoints Used

The example demonstrates these endpoints:

### Public Endpoints
- `POST /auth/register` - Create new user
- `POST /auth/login` - Authenticate user

### Protected Endpoints
- `GET /users` - Get all users (requires JWT)
- `GET /chats` - Get user's chats (requires JWT)

## Extending the Example

You can easily add more API calls:

```typescript
// In ExamplePage.tsx

// Add state for chat form
const [participantId, setParticipantId] = useState('');

// Add handler
const handleCreateChat = async () => {
  await handleApiCall(
    () => api.post('/chats', {
      participants: [participantId],
      isMutable: true
    }),
    'Chat created:'
  );
};

// Add button
<button onClick={handleCreateChat}>
  Create Chat
</button>
```

## Common Issues

### Backend Not Running

**Error:** "Backend is not reachable"

**Solution:**
```bash
# Make sure backend is running
docker-compose up
# or
cd backend && npm run start:dev
```

### CORS Error

**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:** Backend already configured for CORS. Make sure:
- Frontend URL in backend .env: `FRONTEND_URL=http://localhost:5173`
- Backend is running

### Token Not Saved

**Issue:** API calls fail with 401 Unauthorized

**Solution:**
1. Login again
2. Check browser console for errors
3. Make sure localStorage is enabled

### 401 Unauthorized

**Error:** All API calls return 401

**Solution:**
1. Make sure you're logged in
2. Check green "Authenticated" badge
3. Try logging out and back in
4. Check token in localStorage: `localStorage.getItem('token')`

## Next Steps

After testing the example:

1. **Understand the Code**
   - Review `ExamplePage.tsx`
   - See how API calls are made
   - Study error handling

2. **Add More Features**
   - Create chat form
   - Send message form
   - Create bid form
   - File upload example

3. **Build Real UI**
   - Use this as reference
   - Build complete chat interface
   - See `IMPLEMENTATION_GUIDE.md`

## API Reference

For all available endpoints, visit:
**http://localhost:3000/api**

Try endpoints in Swagger UI:
1. Register/Login to get token
2. Click "Authorize"
3. Enter: `Bearer YOUR_TOKEN`
4. Try any endpoint

## Files

- **`frontend/src/ExamplePage.tsx`** - Example page component
- **`frontend/src/App.tsx`** - App with routing
- **`frontend/src/services/api.ts`** - Axios instance

## Architecture

```
User Interface (ExamplePage.tsx)
        ↓
API Service (api.ts)
        ↓
Axios with JWT Interceptor
        ↓
Backend API (localhost:3000)
        ↓
Database (MongoDB)
```

## Tips

1. **Open DevTools** to see network requests
2. **Check Console** for detailed logs
3. **Inspect localStorage** to see saved token
4. **Use Swagger UI** for full API documentation
5. **Try different users** to test multi-user scenarios

---

**Ready to test!** Visit http://localhost:5173/example
