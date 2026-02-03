CREATE TABLE IF NOT EXISTS discipline_review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    discipline_id INTEGER NOT NULL,
    review_time TEXT NOT NULL,
    time_spent INTEGER,
    UNIQUE(user_id, discipline_id, review_time),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES discipline (id) ON DELETE CASCADE
);