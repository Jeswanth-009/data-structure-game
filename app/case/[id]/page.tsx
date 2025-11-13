'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { Case, Question } from '@/types/game';
import { calculateScore, formatTime } from '@/lib/game';
import { Clock, AlertCircle, CheckCircle2, XCircle, Trophy, BookOpen } from 'lucide-react';
import StoryViewer from '@/app/components/StoryViewer';

export default function CasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id as string;

  const [caseData, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStory, setShowStory] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    loadCase();
  }, [caseId, router]);

  const loadCase = async () => {
    try {
      const session = getSession();
      if (!session) return;

      // Check if user has already submitted this case
      const { data: existingSubmission } = await supabase
        .from('submissions')
        .select('*')
        .eq('player_id', session.playerId)
        .eq('case_id', caseId)
        .single();

      if (existingSubmission) {
        alert('You have already attempted this case. Each case can only be attempted once.');
        router.push('/cases');
        return;
      }

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Case not found');

      setCase(data);
      setAnswers(new Array(data.questions.length).fill(-1));
    } catch (error) {
      console.error('Error loading case:', error);
      alert('Failed to load case');
      router.push('/cases');
    } finally {
      setLoading(false);
    }
  };

  const startInvestigation = () => {
    setShowStory(false);
    setStarted(true);
  };

  const completeStory = () => {
    setShowStory(false);
  };

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (text: string) => {
    setTextAnswer(text);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim();
  };

  const handleSubmit = async () => {
    if (!caseData || submitted) return;

    setSubmitted(true);

    // Don't calculate score automatically - just submit for review
    const session = getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    try {
      // Create submission for admin review
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          player_id: session.playerId,
          case_id: caseId,
          answers: answers,
          score: 0, // Initial score is 0, will be updated by admin
          status: 'pending',
        });

      if (submissionError) throw submissionError;

      // Show success message
      setResult({
        submitted: true,
        message: 'Your answers have been submitted for review!',
      });
    } catch (error) {
      console.error('Error submitting case:', error);
      alert('Failed to submit case. Please try again.');
      setSubmitted(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center">
        <div className="text-detective-amber text-xl">Loading case...</div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  // Story Viewer
  if (showStory) {
    return <StoryViewer title={caseData.title} brief={caseData.brief} onComplete={completeStory} />;
  }

  // Result Modal
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center p-4">
        <div className="max-w-2xl w-full detective-file">
          <div className="text-center mb-6">
            <Clock className="w-16 h-16 text-detective-amber mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-detective-amber mb-2 font-mono">
              SUBMISSION RECEIVED!
            </h1>
            <p className="text-foreground/70">{caseData.title}</p>
          </div>

          <div className="bg-detective-dark rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-detective-amber mb-4">📝 Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-yellow-500 mb-1">Pending Review</p>
                  <p className="text-sm text-foreground/70">
                    Your answers have been submitted and are waiting for admin review.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-detective-charcoal rounded-lg">
                <p className="text-foreground/80 text-sm leading-relaxed">
                  ✅ Your submission includes {answers.filter(a => a !== -1 && a !== '').length} out of {caseData.questions.length} answers
                </p>
                <p className="text-foreground/60 text-xs mt-2">
                  An admin will review your answers and update your score on the leaderboard soon.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/cases')}
            className="detective-button w-full"
          >
            BACK TO CASES
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/leaderboard')}
              className="text-detective-amber hover:text-detective-amber-light transition-colors text-sm"
            >
              View Leaderboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal flex items-center justify-center p-4">
        <div className="max-w-3xl w-full detective-file">
          <div className="mb-6">
            <div className="text-xs text-detective-amber uppercase tracking-wider mb-2">
              Case File: {caseData.id}
            </div>
            <h1 className="text-3xl font-bold text-detective-amber mb-4 font-mono">
              {caseData.title}
            </h1>
          </div>

          <div className="bg-detective-dark rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-detective-amber mb-3">📋 Case Brief</h3>
            <p className="text-foreground/80 leading-relaxed">{caseData.brief}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-detective-dark rounded-lg p-4 text-center">
              <div className="text-detective-amber font-bold text-2xl mb-1">
                {caseData.questions.length}
              </div>
              <div className="text-foreground/70 text-sm">Questions</div>
            </div>
            <div className="bg-detective-dark rounded-lg p-4 text-center">
              <div className="text-detective-amber font-bold text-2xl mb-1">
                {caseData.max_score}
              </div>
              <div className="text-foreground/70 text-sm">Max Score</div>
            </div>
            <div className="bg-detective-dark rounded-lg p-4 text-center">
              <div className="text-detective-amber font-bold text-2xl mb-1">
                No Limit
              </div>
              <div className="text-foreground/70 text-sm">Time Limit</div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={startInvestigation}
              className="detective-button flex-1 text-base sm:text-lg"
            >
              🔍 START INVESTIGATION
            </button>
            
            <button
              onClick={() => setShowStory(true)}
              className="bg-detective-grey hover:bg-detective-charcoal text-foreground font-bold py-3 px-4 sm:px-6 rounded-lg transition-all"
            >
              📖 Read Story Again
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/cases')}
              className="text-detective-amber hover:text-detective-amber-light transition-colors text-sm"
            >
              ← Back to Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  const question = caseData.questions[currentQuestion];
  const isTextQuestion = question.type === 'text';

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-dark via-background to-detective-charcoal p-4">
      <div className="max-w-4xl mx-auto py-4 sm:py-6">
        {/* Header */}
        <div className="detective-file mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex-1">
              <div className="text-xs sm:text-sm text-detective-amber">
                Question {currentQuestion + 1} of {caseData.questions.length}
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-detective-amber-light font-mono">
                {caseData.title}
              </h2>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-detective-dark rounded-full h-2">
            <div
              className="bg-detective-amber h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / caseData.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="detective-file mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 leading-relaxed">
            {question.q}
          </h3>

          {isTextQuestion ? (
            // Text Input Question
            <div className="space-y-4">
              <div className="bg-detective-dark p-3 sm:p-4 rounded-lg border border-detective-grey">
                <label className="block text-xs sm:text-sm text-detective-amber mb-2 font-mono">
                  📝 TYPE YOUR ANSWER:
                </label>
                <input
                  type="text"
                  value={typeof answers[currentQuestion] === 'string' ? answers[currentQuestion] : ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  className="detective-input text-base sm:text-lg font-mono"
                  placeholder={question.q.toLowerCase().includes('case sensitive') ? "Type exactly as shown" : "Type here... (case insensitive)"}
                  autoFocus
                />
                <p className="text-xs text-foreground/50 mt-2">
                  {question.q.toLowerCase().includes('case sensitive') 
                    ? "⚠️ This answer is case-sensitive! Type exactly." 
                    : "💡 Answers are case-insensitive. Type naturally!"}
                </p>
              </div>
            </div>
          ) : (
            // MCQ Question
            <div className="space-y-3">
              {question.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(currentQuestion, index)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all text-sm sm:text-base ${
                    answers[currentQuestion] === index
                      ? 'border-detective-amber bg-detective-amber/10'
                      : 'border-detective-grey bg-detective-dark hover:border-detective-amber/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQuestion] === index
                        ? 'border-detective-amber bg-detective-amber'
                        : 'border-detective-grey'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-detective-dark rounded-full" />
                      )}
                    </div>
                    <span className="text-foreground break-words">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setTextAnswer('');
              }}
              className="bg-detective-grey hover:bg-detective-charcoal text-foreground font-bold py-3 px-6 rounded-lg transition-all order-2 sm:order-1"
            >
              ← Previous
            </button>
          )}

          <button
            onClick={() => setShowStory(true)}
            className="bg-detective-charcoal hover:bg-detective-grey text-detective-amber border border-detective-amber font-bold py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 order-3 sm:order-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">View Story</span>
            <span className="sm:hidden">Story</span>
          </button>

          <div className="flex-1 order-4 sm:order-3" />

          {currentQuestion < caseData.questions.length - 1 ? (
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion + 1);
                setTextAnswer('');
              }}
              className="detective-button order-1 sm:order-4"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-all shadow-md hover:shadow-xl order-1 sm:order-4"
            >
              📝 SUBMIT CASE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
