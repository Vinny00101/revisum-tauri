import React from "react";
import { QuestionType, StudyItemType } from "./types";
export interface Column<T> {
  key: keyof T | "actions" | "preview";
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface CreateDisciplineModalProps {
  id?: number;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  reloadTable: () => void;
}

export interface UpdateUserRequest {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  avatar_bytes?: number[] | null;
  avatar_extension?: string | null;
}

export interface DisciplineFormData {
  name: string;
  description: string;
}

export interface ContentFormData {
  title: string;
  description: string;
  display_order: number;
}

export interface CreateContentModalProps {
  id?: number;
  disciplineId: number;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  reloadTable: () => void;
}

export interface message {
  code: boolean,
  message: string
}

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