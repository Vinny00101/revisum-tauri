export interface User {
    id: number;
    username: string;
    email: string;
    avatar_path: string | null;
    createdAt: string;
    updatedAt: string;
    status: Status | null;
}

export interface Status {
  user_id: number;
  current_streak: number;
  last_review_date: string | null;
  longest_streak: number;
  total_study_time: number;
}