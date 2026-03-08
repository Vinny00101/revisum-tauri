CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    avatar_path TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS discipline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, name),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discipline_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(discipline_id, title),
    FOREIGN KEY (discipline_id) REFERENCES discipline (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS studyitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK(item_type IN ('CARD', 'QUESTION')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS card (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_item_id INTEGER NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (study_item_id) REFERENCES studyitem (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS question (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_item_id INTEGER NOT NULL,
    question_type TEXT NOT NULL CHECK(question_type IN ('OBJECTIVE', 'DISCURSIVE')),
    statement_text TEXT NOT NULL,
    statement_image TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (study_item_id) REFERENCES studyitem (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS objective_answer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    image TEXT,
    is_correct INTEGER NOT NULL CHECK(is_correct IN (0,1)),
    FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS discursive_response (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    expected_answer TEXT NOT NULL,
    evaluation_criteria TEXT,
    FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
);