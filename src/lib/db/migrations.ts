/**
 * Ordered, append-only schema migrations. Never edit a migration that has
 * shipped — add a new one instead.
 */
export const migrations: { id: number; name: string; sql: string }[] = [
  {
    id: 1,
    name: "initial_schema",
    sql: `
      CREATE TABLE users (
        id              TEXT PRIMARY KEY,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        name            TEXT NOT NULL,
        level           TEXT NOT NULL DEFAULT 'foundations',
        onboarded       INTEGER NOT NULL DEFAULT 0,
        baseline_wpm    INTEGER,
        baseline_comp   REAL,
        preferences     TEXT NOT NULL DEFAULT '{}',
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );

      CREATE TABLE auth_sessions (
        id            TEXT PRIMARY KEY,           -- sha256(token)
        user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at    TEXT NOT NULL,
        expires_at    TEXT NOT NULL,
        last_seen_at  TEXT NOT NULL,
        user_agent    TEXT
      );
      CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);

      CREATE TABLE practice_sessions (
        id            TEXT PRIMARY KEY,
        user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exercise      TEXT NOT NULL,              -- rsvp | pacer | timed | span | grid | chunks | scan | assessment | placement
        source_type   TEXT NOT NULL,              -- passage | custom | drill
        source_id     TEXT,
        title         TEXT NOT NULL,
        words         INTEGER NOT NULL DEFAULT 0,
        duration_ms   INTEGER NOT NULL,
        wpm           INTEGER,
        comprehension REAL,                       -- 0..1
        accuracy      REAL,                       -- 0..1
        score         REAL,                       -- exercise specific (e.g. grid seconds, span chars)
        difficulty    INTEGER,
        lesson_id     TEXT,
        flagged       INTEGER NOT NULL DEFAULT 0, -- implausible speed / skimmed
        xp            INTEGER NOT NULL DEFAULT 0,
        meta          TEXT NOT NULL DEFAULT '{}',
        local_date    TEXT NOT NULL,              -- YYYY-MM-DD in the user's timezone
        created_at    TEXT NOT NULL
      );
      CREATE INDEX idx_practice_user_date ON practice_sessions(user_id, local_date);
      CREATE INDEX idx_practice_user_created ON practice_sessions(user_id, created_at);
      CREATE INDEX idx_practice_user_exercise ON practice_sessions(user_id, exercise);

      CREATE TABLE lesson_progress (
        user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id     TEXT NOT NULL,
        completed_at  TEXT NOT NULL,
        attempts      INTEGER NOT NULL DEFAULT 1,
        best_score    REAL,
        reflection    TEXT,
        PRIMARY KEY (user_id, lesson_id)
      );

      CREATE TABLE bookmarks (
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        passage_id  TEXT NOT NULL,
        created_at  TEXT NOT NULL,
        PRIMARY KEY (user_id, passage_id)
      );

      CREATE TABLE custom_texts (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        words       INTEGER NOT NULL,
        created_at  TEXT NOT NULL
      );
      CREATE INDEX idx_custom_texts_user ON custom_texts(user_id);

      CREATE TABLE xp_ledger (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount      INTEGER NOT NULL,
        reason      TEXT NOT NULL,                -- session | lesson | daily_goal | challenge | achievement
        ref         TEXT,
        local_date  TEXT NOT NULL,
        created_at  TEXT NOT NULL
      );
      CREATE INDEX idx_xp_user ON xp_ledger(user_id, created_at);
      CREATE UNIQUE INDEX idx_xp_unique_ref ON xp_ledger(user_id, reason, ref) WHERE ref IS NOT NULL;

      CREATE TABLE achievements (
        user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id  TEXT NOT NULL,
        unlocked_at     TEXT NOT NULL,
        PRIMARY KEY (user_id, achievement_id)
      );

      CREATE TABLE notifications (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind        TEXT NOT NULL,                -- achievement | level | challenge | streak | report | program
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        href        TEXT,
        dedupe_key  TEXT,
        created_at  TEXT NOT NULL,
        read_at     TEXT
      );
      CREATE INDEX idx_notifications_user ON notifications(user_id, created_at);
      CREATE UNIQUE INDEX idx_notifications_dedupe ON notifications(user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
    `,
  },
];
