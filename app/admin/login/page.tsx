'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { setAdminSession } from '@/lib/admin-auth';
import { Shield, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For simplicity, using hardcoded credentials
      // In production, implement proper authentication
      if ((username === 'admin1' || username === 'admin2') && password === 'admin123') {
        // Get admin user from database
        const { data: adminUser, error: dbError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .single();

        if (dbError || !adminUser) {
          setError('Invalid credentials');
          setLoading(false);
          return;
        }

        setAdminSession({
          adminId: adminUser.id,
          username: adminUser.username,
        });

        router.push('/admin/review');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center p-4">
      <div className="max-w-md w-full detective-file">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-detective-amber/10 rounded-full mb-4">
            <Shield className="w-12 h-12 text-detective-amber" />
          </div>
          <h1 className="text-3xl font-bold text-detective-amber mb-2 font-mono">
            ADMIN ACCESS
          </h1>
          <p className="text-foreground/70">Submission Review System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-detective-amber mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="detective-input"
              placeholder="admin1 or admin2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-detective-amber mb-2">
              <Lock className="inline w-4 h-4 mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="detective-input"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-detective-red/10 border border-detective-red text-detective-red p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="detective-button w-full"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-detective-amber hover:text-detective-amber-light transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
