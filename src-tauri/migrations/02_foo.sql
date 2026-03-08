CREATE TABLE IF NOT EXISTS user_status (
    user_id INTEGER PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_review_date TEXT,
    total_study_time INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    discipline_id INTEGER NOT NULL,
    content_id INTEGER NOT NULL,
    session_type TEXT NOT NULL CHECK (
        session_type IN ('CARD', 'OBJECTIVE', 'DISCURSIVE') -- Separado por tipo
    ),
    start_time TEXT NOT NULL,
    end_time TEXT,
    total_items INTEGER NOT NULL DEFAULT 0,
    correct_items INTEGER DEFAULT 0, -- Relevante apenas para OBJECTIVE
    accuracy REAL,                  -- Relevante apenas para OBJECTIVE
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES discipline (id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_item_review_state (
    user_id INTEGER NOT NULL,
    study_item_id INTEGER NOT NULL,
    ease_factor REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetition INTEGER DEFAULT 0,
    last_review_date TEXT,
    next_review_date TEXT,
    PRIMARY KEY (user_id, study_item_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (study_item_id) REFERENCES studyitem (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discipline_progress (
    user_id INTEGER NOT NULL,
    discipline_id INTEGER NOT NULL,
    total_items INTEGER NOT NULL DEFAULT 0,
    items_mastered INTEGER NOT NULL DEFAULT 0,
    progress_percent REAL DEFAULT 0,
    last_review_date TEXT,
    PRIMARY KEY (user_id, discipline_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES discipline (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviewlog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    study_item_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('CARD', 'OBJECTIVE', 'DISCURSIVE')),
    
    -- evaluation expandido para aceitar os dois tipos de feedback
    evaluation TEXT NOT NULL CHECK (
        evaluation IN ('WRONG', 'CORRECT', 'HARD', 'MEDIUM', 'EASY')
    ),
    
    time_spent INTEGER, -- segundos gastos neste item específico
    review_time TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES review_session (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (study_item_id) REFERENCES studyitem (id) ON DELETE CASCADE
);

CREATE TRIGGER trg_on_review_session_end
AFTER UPDATE OF end_time ON review_session
WHEN NEW.end_time IS NOT NULL
BEGIN
    INSERT OR IGNORE INTO user_status (user_id) VALUES (NEW.user_id);
    UPDATE user_status
    SET total_study_time = 
        total_study_time + 
        (strftime('%s', NEW.end_time) - strftime('%s', NEW.start_time))
    WHERE user_id = NEW.user_id;
END;