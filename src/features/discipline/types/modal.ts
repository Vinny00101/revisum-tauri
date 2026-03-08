export interface CreateDisciplineModalProps {
  id?: number;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  reloadTable: () => void;
}

export interface CreateContentModalProps {
  id?: number;
  disciplineId: number;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  reloadTable: () => void;
}

export interface ModalStudyItemProps {
    contentId: number;
    isOpen: boolean;
    onClose: () => void;
    reload: () => void;
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