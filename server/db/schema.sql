-- Cyber Security Training Web App Database Schema

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(50) NOT NULL DEFAULT 'employee'
                    CHECK (role IN ('admin', 'manager', 'employee')),
  department      VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  track            VARCHAR(50) NOT NULL
                     CHECK (track IN ('phishing', 'passwords', 'data_protection', 'social_engineering')),
  content          JSONB NOT NULL DEFAULT '{}',
  duration_minutes INTEGER,
  order_index      INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id            SERIAL PRIMARY KEY,
  lesson_id     INTEGER UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  questions     JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER NOT NULL DEFAULT 80,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id        INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status           VARCHAR(20) NOT NULL DEFAULT 'not_started'
                     CHECK (status IN ('not_started', 'in_progress', 'completed')),
  quiz_score       INTEGER,
  quiz_attempts    INTEGER NOT NULL DEFAULT 0,
  summary_text     TEXT,
  summary_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS lesson_assignments (
  id                      SERIAL PRIMARY KEY,
  lesson_id               INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  assigned_to_user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assigned_to_department  VARCHAR(255),
  assigned_by             INTEGER REFERENCES users(id),
  deadline                DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  badge_type     VARCHAR(20) NOT NULL
                   CHECK (badge_type IN ('lesson', 'track', 'master')),
  requirement_id INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id   INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_track ON lessons(track);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON lesson_assignments(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_dept ON lesson_assignments(assigned_to_department);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
