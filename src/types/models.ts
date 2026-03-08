export interface User {
    id: number;
    username: string;
    email: string;
    avatar_path: string | null;
    created_at: string;
    updated_at: string;
    status: Status | null;
}

export interface Status {
  user_id: number;
  current_streak: number;
  last_review_date: string | null;
  longest_streak: number;
  total_study_time: number;
}