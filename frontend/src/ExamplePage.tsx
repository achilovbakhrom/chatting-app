import { useState } from 'react';
import api from './services/api';
import { UserRole } from './types';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function ExamplePage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TRUCK_DRIVER);

  const handleApiCall = async (apiFunction: () => Promise<any>, successMessage: string) => {
    setLoading(true);
    setResponse(null);
    try {
      const result = await apiFunction();
      setResponse({
        success: true,
        data: result.data,
      });
      console.log(successMessage, result.data);
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.response?.data?.message || error.message,
      });
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setResponse({ success: false, error: 'Please fill all fields' });
      return;
    }

    await handleApiCall(
      () => api.post('/auth/register', { email, password, name, role }),
      'User registered:'
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setResponse({ success: false, error: 'Please fill email and password' });
      return;
    }

    await handleApiCall(
      () => api.post('/auth/login', { email, password }),
      'Logged in:'
    );
  };

  const handleGetUsers = async () => {
    await handleApiCall(() => api.get('/users'), 'Users fetched:');
  };

  const handleGetChats = async () => {
    await handleApiCall(() => api.get('/chats'), 'Chats fetched:');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setResponse({ success: true, data: { message: 'Logged out successfully' } });
  };

  const handleCheckHealth = async () => {
    try {
      setLoading(true);
      const result = await fetch('http://localhost:3000');
      const text = await result.text();
      setResponse({
        success: true,
        data: { message: 'Backend is running!', response: text || 'OK' },
      });
    } catch (error: any) {
      setResponse({
        success: false,
        error: 'Backend is not reachable. Make sure it is running on port 3000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Flexobo Chat - API Example
          </h1>
          <p className="text-muted-foreground">
            Interactive examples demonstrating the backend API
          </p>
          {token && (
            <div className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg mt-2">
              ✅ Authenticated
            </div>
          )}
        </div>

        {/* Backend Health Check */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-2xl font-semibold mb-4">1. Backend Health Check</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Check if the backend is running
          </p>
          <button
            onClick={handleCheckHealth}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Check Backend Status
          </button>
        </div>

        {/* Authentication */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-2xl font-semibold mb-4">2. Authentication</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Register Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Register</h3>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value={UserRole.TRUCK_DRIVER}>Truck Driver</option>
                <option value={UserRole.LOAD_OWNER}>Load Owner</option>
              </select>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Login</h3>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Login
              </button>
              {token && (
                <button
                  onClick={handleLogout}
                  className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* API Calls */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-2xl font-semibold mb-4">3. API Calls</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {token ? 'You are authenticated. Try these endpoints:' : 'Please login first to test authenticated endpoints'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGetUsers}
              disabled={loading || !token}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 disabled:opacity-50"
            >
              Get All Users
            </button>
            <button
              onClick={handleGetChats}
              disabled={loading || !token}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 disabled:opacity-50"
            >
              Get My Chats
            </button>
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className={`rounded-lg border p-6 ${
            response.success
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              response.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
            }`}>
              {response.success ? '✅ Success' : '❌ Error'}
            </h3>
            <pre className={`text-sm overflow-x-auto p-4 rounded ${
              response.success
                ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
            }`}>
              {response.error || JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading...</p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1. Make sure backend is running: <code className="bg-background px-2 py-1 rounded">docker-compose up</code></li>
            <li>2. Register a new user or use existing credentials</li>
            <li>3. Login to get JWT token (stored automatically)</li>
            <li>4. Try the API calls to see responses</li>
            <li>5. Check Swagger UI for all endpoints: <a href="http://localhost:3000/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">http://localhost:3000/api</a></li>
          </ul>
        </div>

        {/* Links */}
        <div className="flex gap-4 justify-center">
          <a
            href="http://localhost:3000/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Swagger API Docs
          </a>
          <span className="text-muted-foreground">•</span>
          <a
            href="/"
            className="text-primary hover:underline"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default ExamplePage;
