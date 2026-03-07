import ActionButtons from "./ActionButtons";
import { useState } from "react";
import { eventBus } from "@/util/Event";
import { ModalContent } from "../ModalContent";

export default function ModalRender({id, disciplineId}: {id: number, disciplineId: number}) {
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    return (
        <>
            <ActionButtons
                contentid={id}
                onAction={(action, id) => {
                    if (action === "edit") setEditId(id);
                    if (action === "delete") setDeleteId(id);
                }}
            >
                <ModalContent
                    id={editId!}
                    disciplineId={disciplineId}
                    title="Editar conteúdo"
                    isOpen={editId === id}
                    onClose={() => setEditId(null)}
                    reloadTable={() => eventBus.emit("content:updated")}
                />

                <ModalContent
                    id={deleteId!}
                    disciplineId={disciplineId}
                    title="Excluir Conteúdo"
                    isOpen={deleteId === id}
                    onClose={() => setDeleteId(null)}
                    reloadTable={() => eventBus.emit("content:updated")}
                />
            </ActionButtons>
        </>
    );
}