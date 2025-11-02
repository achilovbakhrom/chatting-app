import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [translationEnabled, setTranslationEnabled] = useState(user?.translationEnabled ?? true);
  const [company, setCompany] = useState(user?.company || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLanguage(user.language);
      setTranslationEnabled(user.translationEnabled ?? true);
      setCompany(user.company || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const response = await api.patch(`/users/${user.id || (user as any)._id}`, {
        name,
        language,
        translationEnabled,
        company,
      });

      // Update auth store with new user data
      const token = useAuthStore.getState().token;
      if (token) {
        setAuth(response.data, token);
      }

      alert('Settings saved successfully!');
    } catch (err: any) {
      console.error('Failed to save settings', err);
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/chats')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* User Profile Header */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.role === 'LOAD_OWNER' ? 'Load Owner' : 'Truck Driver'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ar">Arabic</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="tr">Turkish</option>
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                Messages will be automatically translated to this language when translation is enabled
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border border-accent">
              <div>
                <label className="block text-sm font-semibold mb-1">Enable Live Translation</label>
                <p className="text-xs text-muted-foreground">
                  Automatically translate incoming messages to your preferred language
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTranslationEnabled(!translationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  translationEnabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    translationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company (optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/chats')}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
