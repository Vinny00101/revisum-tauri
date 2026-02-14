import { QuestionType, StudyItemType } from "./types";

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


export interface Discipline {
    id: number,
    userId: number,
    name: string,
    description: string | null,
    createdAt: string,
    updatedAt: string
    total_items: number;
    items_mastered: number;
    progress_percent: number,
    last_review_date: string | null,
}

export interface Content {
    id: number;
    discipline_id: number;
    title: string;
    description: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}

// study_item
export interface CardResponse {
  id: number;
  study_item_id: number;
  front: string;
  back: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionResponse {
  id: number;
  study_item_id: number;
  question_type: QuestionType;
  statement_text: string;
  statement_image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveAnswerResponse {
  id: number;
  question_id: number;
  text: string;
  image?: string | null;
  is_correct: boolean;
}

export interface DiscursiveResponseResponse {
  id: number;
  question_id: number;
  expected_answer: string;
  evaluation_criteria?: string | null;
}

export interface QuestionFullResponse {
  question: QuestionResponse;
  objective_answers?: ObjectiveAnswerResponse[] | null;
  discursive_response?: DiscursiveResponseResponse | null;
}
export interface StudyItemFullResponse {
  id: number;
  content_id: number;
  item_type: StudyItemType;
  created_at: string;
  updated_at: string;

  card?: CardResponse | null;
  question?: QuestionFullResponse | null;
}