'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveSession, isAuthenticated } from '@/lib/auth';
import { User, Hash, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated()) {
      router.push('/cases');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!name.trim() || !number.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Check if player exists
      const { data: existingPlayer, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('number', number.trim())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw fetchError;
      }

      let playerId: string;
      let playerName: string;

      if (existingPlayer) {
        // Player exists - restore session
        playerId = existingPlayer.id;
        playerName = existingPlayer.name;
      } else {
        // Create new player
        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .insert([
            {
              name: name.trim(),
              number: number.trim(),
              score: 0,
              completed_cases: [],
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newPlayer) throw new Error('Failed to create player');

        playerId = newPlayer.id;
        playerName = newPlayer.name;
      }

      // Save session
      saveSession({
        playerId,
        playerName,
        playerNumber: number.trim(),
      });

      // Redirect to cases
      router.push('/cases');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-detective-amber mb-2 font-mono">
            DETECTIVE LOGIN
          </h1>
          <p className="text-sm sm:text-base text-foreground/70">Enter your credentials to begin</p>
        </div>

        <div className="detective-file">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-detective-amber mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Detective Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="detective-input"
                placeholder="Enter your name"
                disabled={loading}
                required
              />
            </div>

            {/* Roll Number Input */}
            <div>
              <label className="block text-sm font-medium text-detective-amber mb-2">
                <Hash className="inline w-4 h-4 mr-2" />
                Badge Number (Roll Number)
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="detective-input"
                placeholder="Enter your roll number"
                disabled={loading}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-detective-red/20 border border-detective-red rounded-lg p-3 flex items-center gap-2 text-detective-red">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="detective-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'AUTHENTICATING...' : '🔓 ACCESS CASE FILES'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-foreground/50">
            <p>First time? Your account will be created automatically.</p>
            <p className="mt-1">Returning? Your progress will be restored.</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-detective-amber hover:text-detective-amber-light transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
