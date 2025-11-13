'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminSession, clearAdminSession } from '@/lib/admin-auth';
import { SubmissionWithDetails } from '@/types/admin';
import { CheckCircle2, XCircle, Clock, LogOut, User, FileText, Calendar, Trophy } from 'lucide-react';

export default function AdminReviewPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [reviewScore, setReviewScore] = useState(0);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }

    loadSubmissions();
  }, [filter, router]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: submissionsData, error } = await query;

      if (error) throw error;

      // Fetch player and case details for each submission
      const enrichedSubmissions = await Promise.all(
        (submissionsData || []).map(async (sub) => {
          const [playerRes, caseRes] = await Promise.all([
            supabase.from('players').select('name, number').eq('id', sub.player_id).single(),
            supabase.from('cases').select('title, questions, max_score').eq('id', sub.case_id).single(),
          ]);

          return {
            ...sub,
            player_name: playerRes.data?.name || 'Unknown',
            player_number: playerRes.data?.number || 'N/A',
            case_title: caseRes.data?.title || 'Unknown Case',
            case_questions: caseRes.data?.questions || [],
            max_score: caseRes.data?.max_score || 0,
          };
        })
      );

      setSubmissions(enrichedSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  const openSubmissionDetails = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setReviewScore(submission.score);
  };

  const closeDetails = () => {
    setSelectedSubmission(null);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    const session = getAdminSession();
    if (!session) return;

    try {
      // Update submission status
      await supabase
        .from('submissions')
        .update({
          status: 'approved',
          score: reviewScore,
          reviewed_by: session.adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedSubmission.id);

      // Update player score
      const { data: player } = await supabase
        .from('players')
        .select('score, completed_cases')
        .eq('id', selectedSubmission.player_id)
        .single();

      if (player) {
        await supabase
          .from('players')
          .update({
            score: player.score + reviewScore,
            completed_cases: [...(player.completed_cases || []), selectedSubmission.case_id],
          })
          .eq('id', selectedSubmission.player_id);
      }

      alert('Submission approved and score updated!');
      closeDetails();
      loadSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    const session = getAdminSession();
    if (!session) return;

    try {
      await supabase
        .from('submissions')
        .update({
          status: 'rejected',
          score: 0,
          reviewed_by: session.adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedSubmission.id);

      alert('Submission rejected');
      closeDetails();
      loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission');
    }
  };

  const adminSession = getAdminSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal p-4">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="detective-file mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-detective-amber mb-2 font-mono">
                ADMIN REVIEW PANEL
              </h1>
              <p className="text-foreground/70">
                <User className="inline w-4 h-4 mr-2" />
                Logged in as: {adminSession?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-detective-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="detective-file mb-6">
          <div className="flex gap-3 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  filter === f
                    ? 'bg-detective-amber text-detective-dark'
                    : 'bg-detective-dark text-foreground hover:bg-detective-charcoal'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="text-center text-detective-amber py-12">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="detective-file text-center py-12">
            <Clock className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <p className="text-foreground/70">No submissions found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((sub) => (
              <div key={sub.id} className="detective-file hover:border-detective-amber transition-all cursor-pointer" onClick={() => openSubmissionDetails(sub)}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-detective-amber">{sub.player_name}</h3>
                      <span className="text-sm text-foreground/50">({sub.player_number})</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sub.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                        sub.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-foreground/70 mb-1">
                      <FileText className="inline w-4 h-4 mr-2" />
                      {sub.case_title}
                    </p>
                    <p className="text-sm text-foreground/50">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-detective-amber mb-1">
                      {sub.score} pts
                    </div>
                    <p className="text-xs text-foreground/50">
                      {sub.answers.length} answers
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submission Details Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={closeDetails}>
            <div className="bg-detective-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-detective-dark border-b border-detective-grey p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-detective-amber mb-2">
                      Submission Review
                    </h2>
                    <p className="text-foreground/70">
                      {selectedSubmission.player_name} - {selectedSubmission.case_title}
                    </p>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="text-foreground/50 hover:text-foreground text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Score Input */}
                <div className="bg-detective-charcoal p-4 rounded-lg">
                  <label className="block text-sm font-medium text-detective-amber mb-2">
                    <Trophy className="inline w-4 h-4 mr-2" />
                    Assign Score (Max: {selectedSubmission.max_score})
                  </label>
                  <input
                    type="number"
                    value={reviewScore}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setReviewScore(Math.min(value, selectedSubmission.max_score));
                    }}
                    className="detective-input"
                    min="0"
                    max={selectedSubmission.max_score}
                  />
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Questions and Answers */}
                {selectedSubmission.case_questions.map((question: any, index: number) => {
                  const userAnswer = selectedSubmission.answers[index];
                  const correctAnswer = question.answer;
                  const isCorrect = String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();

                  return (
                    <div key={index} className="bg-detective-charcoal p-4 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`mt-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-detective-amber mb-2">
                            Q{index + 1}: {question.q}
                          </p>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <span className="text-foreground/50 font-mono text-sm">User Answer:</span>
                              <span className="text-foreground font-mono">{String(userAnswer || 'Not answered')}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-foreground/50 font-mono text-sm">Correct Answer:</span>
                              <span className="text-green-500 font-mono font-bold">{String(correctAnswer)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === 'pending' && (
                <div className="sticky bottom-0 bg-detective-dark border-t border-detective-grey p-6 flex gap-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    APPROVE & UPDATE SCORE
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-detective-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    REJECT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
