-- CampusBridge database schema.
-- Safe to run many times: every statement uses IF NOT EXISTS.
-- (Run automatically when the API starts; you never need to paste this by hand.)

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  university    TEXT NOT NULL DEFAULT '',
  year_of_study TEXT NOT NULL DEFAULT '',
  field         TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS courses (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  instructor  TEXT NOT NULL,
  category    TEXT NOT NULL,
  level       TEXT NOT NULL,
  duration    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  syllabus    TEXT[] NOT NULL DEFAULT '{}',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  company      TEXT NOT NULL,
  location     TEXT NOT NULL DEFAULT '',
  type         TEXT NOT NULL,
  duration     TEXT NOT NULL DEFAULT '',
  stipend      TEXT NOT NULL DEFAULT '',
  deadline     DATE,
  category     TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  position_title TEXT NOT NULL,
  company        TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL DEFAULT '',
  university     TEXT NOT NULL,
  year_of_study  TEXT NOT NULL DEFAULT '',
  cover_letter   TEXT NOT NULL,
  portfolio_url  TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'Submitted',
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications (user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities (category);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category);

-- ---------------------------------------------------------------------------------------------
-- Learning platform additions (roles, enrolments, assignments, submissions, notifications)
-- ---------------------------------------------------------------------------------------------

-- Roles: 'student' (default, the only role public sign-up can create), 'instructor', 'coordinator'.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
-- Who runs a course / who posted an opportunity (NULL = sample data nobody manages).
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS enrollments (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   TEXT   NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id          BIGSERIAL PRIMARY KEY,
  course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date    DATE,
  max_points  INTEGER NOT NULL DEFAULT 100 CHECK (max_points BETWEEN 1 AND 1000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, title)
);

CREATE TABLE IF NOT EXISTS submissions (
  id            BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  link          TEXT NOT NULL DEFAULT '',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade         INTEGER CHECK (grade >= 0),
  feedback      TEXT NOT NULL DEFAULT '',
  graded_at     TIMESTAMPTZ,
  UNIQUE (assignment_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  link       TEXT NOT NULL DEFAULT '',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments (course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by ON opportunities (created_by);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses (instructor_id);
