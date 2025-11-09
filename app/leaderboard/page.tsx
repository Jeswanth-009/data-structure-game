'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { LeaderboardEntry } from '@/types/game';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayerNumber, setCurrentPlayerNumber] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    setCurrentPlayerNumber(session.playerNumber);
    loadLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('name, number, score')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const entries: LeaderboardEntry[] = (data || []).map((player, index) => ({
        rank: index + 1,
        name: player.name,
        number: player.number,
        score: player.score,
      }));

      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-detective-amber font-bold">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center">
        <div className="text-detective-amber text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-detective-amber" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-detective-amber mb-2 font-mono">
            GLOBAL LEADERBOARD
          </h1>
          <p className="text-sm sm:text-base text-foreground/70">Top detectives ranked by total score</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
            {/* 2nd Place */}
            <div className="sm:order-1 order-2">
              <div className="detective-file text-center bg-gradient-to-b from-detective-charcoal to-detective-dark">
                <Medal className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-words">
                  {leaderboard[1].name}
                </div>
                <div className="text-sm text-foreground/50 mb-2">
                  #{leaderboard[1].number}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-detective-amber">
                  {leaderboard[1].score}
                </div>
                <div className="text-xs text-foreground/70 mt-1">points</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="sm:order-2 order-1">
              <div className="detective-file text-center bg-gradient-to-b from-yellow-900/30 to-detective-dark border-2 border-yellow-600">
                <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-1 break-words">
                  {leaderboard[0].name}
                </div>
                <div className="text-sm text-foreground/50 mb-2">
                  #{leaderboard[0].number}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-400">
                  {leaderboard[0].score}
                </div>
                <div className="text-xs text-foreground/70 mt-1">points</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="sm:order-3 order-3">
              <div className="detective-file text-center bg-gradient-to-b from-detective-charcoal to-detective-dark">
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-amber-700 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 break-words">
                  {leaderboard[2].name}
                </div>
                <div className="text-sm text-foreground/50 mb-2">
                  #{leaderboard[2].number}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-detective-amber">
                  {leaderboard[2].score}
                </div>
                <div className="text-xs text-foreground/70 mt-1">points</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="detective-file overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-detective-amber">
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-detective-amber font-bold text-sm sm:text-base">Rank</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-detective-amber font-bold text-sm sm:text-base">Detective</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-detective-amber font-bold text-sm sm:text-base">Badge #</th>
                  <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-detective-amber font-bold text-sm sm:text-base">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.number}
                    className={`border-b border-detective-grey hover:bg-detective-dark transition-colors ${
                      entry.number === currentPlayerNumber ? 'bg-detective-amber/10' : ''
                    }`}
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4">
                      <div className="font-medium text-foreground text-sm sm:text-base break-words">
                        {entry.name}
                        {entry.number === currentPlayerNumber && (
                          <span className="ml-2 text-xs bg-detective-amber text-detective-dark px-2 py-1 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-foreground/70 text-sm sm:text-base">
                      #{entry.number}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-right">
                      <div className="text-base sm:text-lg font-bold text-detective-amber">
                        {entry.score}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-foreground/70">
              No detectives on the leaderboard yet.
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/cases')}
            className="detective-button inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </button>
        </div>
      </div>
    </main>
  );
}
