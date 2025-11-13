'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Fingerprint, Target, Trophy } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect if already logged in
    if (isAuthenticated()) {
      router.push('/cases');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Fingerprint className="w-12 h-12 sm:w-16 sm:h-16 text-detective-amber" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-detective-amber mb-3 sm:mb-4 font-mono tracking-tight">
            DETECTIVE AGENCY
          </h1>
          <p className="text-base sm:text-xl text-detective-amber-light italic px-4">
            "Solve cases. Earn ranks. Rise as the ultimate DSA detective."
          </p>
        </div>

        {/* Main Card */}
        <div className="detective-file max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-detective-amber border-b border-detective-grey pb-3">
            📋 MISSION BRIEFING
          </h2>
          
          <div className="space-y-4 text-foreground/90 mb-8">
            <p className="leading-relaxed">
              Welcome, Detective. You've been recruited to solve algorithmic mysteries 
              that plague our digital world. Each case represents a real Data Structure 
              or Algorithm problem waiting to be cracked.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-detective-dark p-4 rounded-lg border border-detective-grey">
                <Target className="w-8 h-8 text-detective-amber mb-2" />
                <h3 className="font-bold text-detective-amber mb-1">Solve Cases</h3>
                <p className="text-sm text-foreground/70">
                  Answer timed questions based on DSA concepts
                </p>
              </div>
              
              <div className="bg-detective-dark p-4 rounded-lg border border-detective-grey">
                <Trophy className="w-8 h-8 text-detective-amber mb-2" />
                <h3 className="font-bold text-detective-amber mb-1">Earn Points</h3>
                <p className="text-sm text-foreground/70">
                  Correct answers and speed bonuses increase your score
                </p>
              </div>
              
              <div className="bg-detective-dark p-4 rounded-lg border border-detective-grey">
                <Fingerprint className="w-8 h-8 text-detective-amber mb-2" />
                <h3 className="font-bold text-detective-amber mb-1">Climb Ranks</h3>
                <p className="text-sm text-foreground/70">
                  Compete on the global leaderboard
                </p>
              </div>
            </div>

            <p className="leading-relaxed">
              Your progress is automatically saved. New cases unlock on schedule. 
              Time is crucial - solve them fast to earn bonus points!
            </p>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="detective-button w-full text-base sm:text-lg"
          >
            🔍 BEGIN INVESTIGATION
          </button>
          
          <div className="mt-4">
            <button
              onClick={() => router.push('/leaderboard')}
              className="w-full bg-detective-charcoal hover:bg-detective-grey text-detective-amber border border-detective-amber font-bold py-2 px-4 rounded-lg transition-all text-sm"
            >
              🏆 View Leaderboard
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-detective-dark rounded-lg border border-detective-grey/50">
            <p className="text-xs sm:text-sm text-foreground/70 text-center">
              💡 <strong className="text-detective-amber">Note:</strong> Answers are reviewed by admins before scores are updated!
            </p>
            <p className="text-xs text-foreground/50 text-center mt-2">
              🛡️ Admin access: Munisree-323106410048 or Srivalli-323106410038
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-foreground/50 text-xs sm:text-sm">
          <p>© 2025 Detective Agency • DSA Training Division</p>
        </div>
      </div>
    </main>
  );
}
