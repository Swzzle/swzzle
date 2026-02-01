'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, User, Palette, Info, LogOut, Check } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('user_settings').select('user_name').single();
    if (data?.user_name) {
      setUserName(data.user_name);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        user_name: userName,
      });
      setMessage('Settings saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-6">
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-text-secondary hover:text-text-primary" />
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-text-secondary" />
            <h1 className="font-semibold text-text-primary">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Account */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-neon-pink" />
            <h2 className="font-semibold text-text-primary">Account</h2>
          </div>

          <div className="flex items-center gap-3 bg-bg-secondary rounded-xl p-4 mb-4">
            <div className="w-12 h-12 bg-neon-pink/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-neon-pink" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{userName || 'Chef'}</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </div>

          <Button variant="secondary" onClick={handleSignOut} icon={<LogOut className="w-4 h-4 text-red-500" />} className="w-full">
            <span className="text-red-500">Sign Out</span>
          </Button>
        </Card>

        {/* Profile */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-neon-blue" />
            <h2 className="font-semibold text-text-primary">Profile</h2>
          </div>

          <Input
            label="Display Name"
            placeholder="Chef"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Card>

        {/* About */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-semibold text-text-primary">About</h2>
          </div>

          <p className="text-text-secondary mb-1">Swzzle v1.0.0</p>
          <p className="text-text-secondary text-sm">
            Your AI-powered recipe assistant. Generate recipes from ingredients, import from photos or URLs.
          </p>
          <p className="text-text-secondary text-xs mt-4">swzzle.com</p>
        </Card>

        {message && (
          <p className="text-neon-cyan text-center text-sm">{message}</p>
        )}

        <Button onClick={handleSave} loading={saving} icon={<Check className="w-4 h-4" />} className="w-full">
          Save Settings
        </Button>
      </main>
    </div>
  );
}
