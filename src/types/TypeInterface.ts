import React from "react";
export interface Column<T> {
  key: keyof T;
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

export interface DisciplineResponse {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  cardCount: number;
  questionCount: number;
  progress: number;
  lastStudied: string | null;
  createdAt: string;
  favorite: boolean;
  actions?: boolean;
}

export interface ContentResponse {
  id: number;
  discipline_id: number;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  actions?: boolean;
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

export enum StudyItemType {
  CARD = "CARD",
  QUESTION = "QUESTION",
}

export enum QuestionType {
  OBJECTIVE = "OBJECTIVE",
  DISCURSIVE = "DISCURSIVE",
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
  statement_image?: string | null;

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