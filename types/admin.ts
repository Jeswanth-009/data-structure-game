export interface AdminUser {
  id: string;
  username: string;
  created_at: string;
}

export interface Submission {
  id: string;
  player_id: string;
  case_id: string;
  answers: any[];
  score: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface SubmissionWithDetails extends Submission {
  player_name: string;
  player_number: string;
  case_title: string;
  case_questions: any[];
  max_score: number;
}
