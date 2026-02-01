
export default interface CreateDisciplineModalProps {
    isOpen: boolean,
    onClose: () => void;
    onSubmit: (data: DisciplineFormData) => Promise<void>;
}