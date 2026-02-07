import React from "react";
export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface CreateDisciplineModalProps {
    isOpen: boolean,
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
  display_order: string;
  created_at: string;
  updated_at: string;
  actions?: boolean;
}

export interface DisciplineFormData {
  name: string;
  description: string;
}

export interface message {
    code: boolean,
    message: string
}