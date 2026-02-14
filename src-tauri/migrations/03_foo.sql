
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

/* Gatilho de Atualização do Progresso de estudo da disciplina*/
CREATE TRIGGER IF NOT EXISTS trg_update_progress_on_state_change
AFTER UPDATE OF interval_days ON study_item_review_state
BEGIN
    UPDATE discipline_progress
    SET 
        items_mastered = (
            SELECT COUNT(*) 
            FROM study_item_review_state s
            JOIN studyitem si ON si.id = s.study_item_id
            JOIN content c ON c.id = si.content_id
            WHERE c.discipline_id = NEW.discipline_id 
              AND s.user_id = NEW.user_id
              AND s.interval_days >= 21
        ),
        progress_percent = ROUND(
            ((SELECT COUNT(*) FROM study_item_review_state s 
              JOIN studyitem si ON si.id = s.study_item_id
              JOIN content c ON c.id = si.content_id
              WHERE c.discipline_id = NEW.discipline_id 
                AND s.user_id = NEW.user_id
                AND s.interval_days >= 21) * 100.0) / MAX(total_items, 1), 
            2
        ),
        last_review_date = date('now')
    WHERE discipline_id = (
        SELECT c.discipline_id 
        FROM studyitem si
        JOIN content c ON c.id = si.content_id
        WHERE si.id = NEW.study_item_id
    ) AND user_id = NEW.user_id;
END;