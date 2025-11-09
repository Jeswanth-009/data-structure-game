'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession, clearSession } from '@/lib/auth';
import { Case, Player } from '@/types/game';
import { isCaseUnlocked, getTimeUntilUnlock } from '@/lib/game';
import { Lock, CheckCircle, Clock, Trophy, LogOut, Users } from 'lucide-react';

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    loadData(session.playerId);
  }, [router]);

  const loadData = async (playerId: string) => {
    try {
      // Load player data
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      // Load cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('unlock_time', { ascending: true });

      if (casesError) throw casesError;
      setCases(casesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center">
        <div className="text-detective-amber text-xl">Loading case files...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="detective-file mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-detective-amber mb-1 font-mono">
                ACTIVE CASES
              </h1>
              <p className="text-sm sm:text-base text-foreground/70 break-words">
                Detective: <span className="text-detective-amber-light">{player?.name}</span> • 
                Badge: <span className="text-detective-amber-light">#{player?.number}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="text-left sm:text-right flex-1 sm:flex-initial">
                <div className="text-xs sm:text-sm text-foreground/70">Total Score</div>
                <div className="text-xl sm:text-2xl font-bold text-detective-amber flex items-center gap-2">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                  {player?.score || 0}
                </div>
              </div>
              
              <button
                onClick={() => router.push('/leaderboard')}
                className="detective-button py-2 px-3 sm:px-4 text-sm flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
                <span className="sm:hidden">Ranks</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-detective-grey hover:bg-detective-red text-foreground py-2 px-3 sm:px-4 rounded-lg transition-all flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cases.map((caseData) => {
            const unlocked = isCaseUnlocked(caseData);
            const completed = player?.completed_cases?.includes(caseData.id);
            const timeUntil = getTimeUntilUnlock(caseData.unlock_time);

            return (
              <div
                key={caseData.id}
                className={`detective-file ${!unlocked ? 'case-locked' : ''} ${completed ? 'case-completed' : ''} cursor-pointer transition-transform hover:scale-105 active:scale-95`}
                onClick={() => {
                  if (unlocked && !completed) {
                    router.push(`/case/${caseData.id}`);
                  }
                }}
              >
                {/* Case Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-detective-amber mb-2 break-words">
                      {caseData.title}
                    </h3>
                    <div className="text-xs text-foreground/50 uppercase tracking-wider">
                      Case ID: {caseData.id}
                    </div>
                  </div>
                  
                  {completed ? (
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 ml-2" />
                  ) : !unlocked ? (
                    <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-detective-grey flex-shrink-0 ml-2" />
                  ) : (
                    <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-detective-amber flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Case Brief */}
                <p className="text-foreground/80 text-sm mb-4 line-clamp-3">
                  {caseData.brief}
                </p>

                {/* Case Footer */}
                <div className="border-t border-detective-grey pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-foreground/70">
                      Max Score: <span className="text-detective-amber font-bold">{caseData.max_score}</span>
                    </div>
                    
                    {completed ? (
                      <div className="text-green-500 font-bold">
                        ✓ SOLVED
                      </div>
                    ) : !unlocked ? (
                      <div className="text-detective-grey flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        {timeUntil}
                      </div>
                    ) : (
                      <div className="text-detective-amber font-bold">
                        → INVESTIGATE
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {cases.length === 0 && (
          <div className="detective-file text-center py-12">
            <p className="text-foreground/70 mb-4">No cases available yet.</p>
            <p className="text-sm text-foreground/50">Check back soon for new investigations!</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="detective-file mt-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-detective-amber mb-1">
                {player?.completed_cases?.length || 0}
              </div>
              <div className="text-sm text-foreground/70">Cases Solved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-detective-amber mb-1">
                {cases.filter(c => isCaseUnlocked(c)).length}
              </div>
              <div className="text-sm text-foreground/70">Cases Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-detective-amber mb-1">
                {cases.length}
              </div>
              <div className="text-sm text-foreground/70">Total Cases</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
