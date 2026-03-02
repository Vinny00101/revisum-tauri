import { QuestionType, StudyItemType } from "@/types/types";

export interface Content {
    id: number;
    discipline_id: number;
    title: string;
    description: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
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

export interface UpdateUserRequest {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  avatar_bytes?: number[] | null;
  avatar_extension?: string | null;
}

// studyItems
export interface CreateCardInput {
  front: string;
  back: string;
}

export interface CreateObjectiveAnswerInput {
  text: string;
  image?: string | null;
  is_correct: number; // 0 ou 1 (igual ao Rust)
}

export interface CreateQuestionInput {
  question_type: QuestionType;
  statement_text: string;
  question_img_bytes?: number[] | null;
  question_img_extension?: string | null;

  // OBJECTIVE
  objective_answers?: CreateObjectiveAnswerInput[] | null;

  // DISCURSIVE
  expected_answer?: string | null;
  evaluation_criteria?: string | null;
}

export interface CreateStudyItemInput {
  content_id: number;
  item_type: StudyItemType;

  // Usado quando item_type === CARD
  card?: CreateCardInput | null;

  // Usado quando item_type === QUESTION
  question?: CreateQuestionInput | null;
}

// response studyitems

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