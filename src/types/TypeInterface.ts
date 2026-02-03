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
}

export interface DisciplineFormData {
  name: string;
  description: string;
}

export interface message {
    code: boolean,
    message: string
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatarPath: string | null;
  createdAt: string;
  updatedAt: string;
}