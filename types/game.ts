export interface Player {
  id: string;
  name: string;
  number: string;
  score: number;
  current_case: string | null;
  completed_cases: string[];
  created_at: string;
}

export interface Question {
  q: string;
  options?: string[]; // Optional for MCQ
  answer: number | string; // index for MCQ or string for text input
  points: number;
  type?: 'mcq' | 'text'; // Question type
}

export interface Case {
  id: string;
  title: string;
  brief: string;
  unlock_time: string;
  questions: Question[];
  max_score: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  number: string;
  score: number;
}

export interface GameSession {
  playerId: string;
  playerName: string;
  playerNumber: string;
}
