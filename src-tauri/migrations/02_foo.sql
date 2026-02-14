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
    mode TEXT NOT NULL CHECK (
        mode IN ('CARD', 'QUESTION', 'MIXED')
    ),
    start_time TEXT NOT NULL,
    end_time TEXT,
    total_items INTEGER NOT NULL DEFAULT 0,
    correct_items INTEGER NOT NULL DEFAULT 0,
    accuracy REAL,
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

DROP TABLE IF EXISTS reviewlog;

CREATE TABLE reviewlog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    study_item_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK (
        item_type IN ('CARD', 'QUESTION')
    ),
    evaluation TEXT NOT NULL CHECK (
        evaluation IN ('WRONG', 'CORRECT', 'EASY')
    ),
    time_spent INTEGER,
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
        (strftime('%s', NEW.end_time) - strftime('%s', NEW.start_time)),
        last_review_date = date(NEW.end_time)
    WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER trg_update_discipline_progress
AFTER UPDATE OF end_time ON review_session
WHEN NEW.end_time IS NOT NULL
BEGIN
    UPDATE discipline_progress
    SET
      items_mastered = (
        SELECT COUNT(*)
        FROM study_item_review_state s
        JOIN studyitem si ON si.id = s.study_item_id
        JOIN content c ON c.id = si.content_id
        WHERE
          s.user_id = NEW.user_id
          AND c.discipline_id = NEW.discipline_id
          AND s.interval_days >= 21
      ),
      last_review_date = date(NEW.end_time),
      progress_percent =
        ROUND((items_mastered * 100.0) / total_items, 2)
    WHERE
      user_id = NEW.user_id
      AND discipline_id = NEW.discipline_id;

    UPDATE discipline_progress
    SET progress_percent = ROUND((items_mastered * 100.0) / MAX(total_items, 1), 2)
    WHERE user_id = NEW.user_id AND discipline_id = NEW.discipline_id;
END;