
CREATE TRIGGER IF NOT EXISTS trg_after_discipline_insert
AFTER INSERT ON discipline
BEGIN
    INSERT INTO discipline_progress (
        user_id, 
        discipline_id, 
        total_items, 
        items_mastered, 
        progress_percent
    )
    VALUES (NEW.user_id, NEW.id, 0, 0, 0.0);
END;


CREATE TRIGGER IF NOT EXISTS trg_after_studyitem_insert
AFTER INSERT ON studyitem
BEGIN
    -- 1. Atualiza o contador
    UPDATE discipline_progress
    SET total_items = total_items + 1
    WHERE discipline_id = (SELECT discipline_id FROM content WHERE id = NEW.content_id);

    -- 2. Recalcula a porcentagem (opcional, mas recomendado para consistência)
    UPDATE discipline_progress
    SET progress_percent = ROUND((items_mastered * 100.0) / MAX(total_items, 1), 2)
    WHERE discipline_id = (SELECT discipline_id FROM content WHERE id = NEW.content_id);
END;

CREATE TRIGGER IF NOT EXISTS trg_after_studyitem_delete
AFTER DELETE ON studyitem
BEGIN
    UPDATE discipline_progress
    SET total_items = MAX(0, total_items - 1)
    WHERE discipline_id = (
        SELECT c.discipline_id FROM content c WHERE c.id = OLD.content_id
    );
END;