import fs from 'node:fs/promises';
import pg from 'pg';
import { config } from '../config.js';
import bcrypt from 'bcryptjs';
import { courses, opportunities } from '../data/seed.js';
import { assignments, demoAccounts, DEMO_PASSWORD } from '../data/learning.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });
pool.on('error', (err) => console.error('Unexpected database error:', err.message));

// Older versions of CampusBridge stored courses/opportunities as one JSON blob
// per row (a column named "data"). We never delete that data: the old table is
// only RENAMED to <name>_legacy_backup and a proper table is created instead.
async function renameLegacyTables(client) {
  for (const table of ['courses', 'opportunities']) {
    const legacy = await client.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = $1 AND column_name = 'data'`,
      [table]
    );
    if (legacy.rowCount === 0) continue;
    const backup = `${table}_legacy_backup`;
    const exists = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = $1`,
      [backup]
    );
    const target = exists.rowCount ? `${backup}_${Date.now()}` : backup;
    await client.query(`ALTER TABLE ${table} RENAME TO ${target}`); // identifiers are fixed strings, not user input
    console.log(`Migration: old "${table}" table kept as "${target}".`);
  }
}

async function seedCatalog(client) {
  for (const c of courses) {
    await client.query(
      `INSERT INTO courses (id, title, instructor, category, level, duration, description, syllabus, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title, instructor = EXCLUDED.instructor, category = EXCLUDED.category,
         level = EXCLUDED.level, duration = EXCLUDED.duration, description = EXCLUDED.description,
         syllabus = EXCLUDED.syllabus, tags = EXCLUDED.tags`,
      [c.id, c.title, c.instructor, c.category, c.level, c.duration, c.description, c.syllabus, c.tags]
    );
  }
  for (const o of opportunities) {
    await client.query(
      `INSERT INTO opportunities (id, title, company, location, type, duration, stipend, deadline, category, description, requirements, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title, company = EXCLUDED.company, location = EXCLUDED.location, type = EXCLUDED.type,
         duration = EXCLUDED.duration, stipend = EXCLUDED.stipend,
         -- keep an open deadline as it is; only renew sample deadlines that have already passed
         deadline = CASE WHEN opportunities.deadline IS NULL
                           OR opportunities.deadline < (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date
                         THEN EXCLUDED.deadline ELSE opportunities.deadline END,
         category = EXCLUDED.category, description = EXCLUDED.description,
         requirements = EXCLUDED.requirements, tags = EXCLUDED.tags`,
      [o.id, o.title, o.company, o.location, o.type, o.duration, o.stipend, o.deadline, o.category, o.description, o.requirements, o.tags]
    );
  }
}

// Constraints are added one by one. If an old database already contains rows that
// break a rule (for example duplicate applications) we warn instead of crashing.
const CONSTRAINTS = [
  {
    name: 'applications_opportunity_fk',
    sql: `ALTER TABLE applications ADD CONSTRAINT applications_opportunity_fk
          FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)`
  },
  {
    name: 'applications_user_opportunity_uniq',
    sql: `ALTER TABLE applications ADD CONSTRAINT applications_user_opportunity_uniq
          UNIQUE (user_id, opportunity_id)`
  },
  {
    name: 'users_role_check',
    sql: `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student','instructor','coordinator'))`
  },
  {
    name: 'applications_status_check',
    sql: `ALTER TABLE applications ADD CONSTRAINT applications_status_check
          CHECK (status IN ('Submitted','Under Review','Accepted','Rejected','Withdrawn'))`
  }
];

async function ensureConstraints() {
  for (const c of CONSTRAINTS) {
    const found = await pool.query('SELECT 1 FROM pg_constraint WHERE conname = $1', [c.name]);
    if (found.rowCount) continue;
    try {
      await pool.query(c.sql);
    } catch (err) {
      console.warn(`WARNING: could not add database rule "${c.name}": ${err.message}`);
    }
  }
}

// Demo accounts (one student, one instructor, one coordinator) so the whole platform can be demonstrated.
// Only created when SEED_DEMO_ACCOUNTS=true, and never in production (the passwords are public).
async function seedLearning(client) {
  let instructorId = null;
  let coordinatorId = null;
  let studentId = null;
  if (config.seedDemoAccounts) {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const ids = {};
    for (const a of demoAccounts) {
      const r = await client.query(
        `INSERT INTO users (full_name, email, password_hash, university, year_of_study, field, role)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING id`,
        [a.fullName, a.email, hash, a.university, a.yearOfStudy, a.field, a.role]
      );
      ids[a.role] = r.rows[0].id;
    }
    ({ instructor: instructorId, coordinator: coordinatorId, student: studentId } = ids);
    // The sample catalogue is managed by the demo staff, so they have something to manage.
    await client.query('UPDATE courses SET instructor_id = $1 WHERE instructor_id IS NULL', [instructorId]);
    await client.query('UPDATE opportunities SET created_by = $1 WHERE created_by IS NULL', [coordinatorId]);
  }
  for (const a of assignments) {
    await client.query(
      `INSERT INTO assignments (course_id, title, description, due_date, max_points)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (course_id, title) DO UPDATE SET
         description = EXCLUDED.description, max_points = EXCLUDED.max_points,
         due_date = CASE WHEN assignments.due_date IS NULL
                           OR assignments.due_date < (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date
                         THEN EXCLUDED.due_date ELSE assignments.due_date END`,
      [a.courseId, a.title, a.description, a.dueDate, a.maxPoints]
    );
  }
  if (studentId) {
    // Give the demo student a little history so dashboards are not empty at the start of a demo.
    await client.query(`INSERT INTO enrollments (user_id, course_id) VALUES ($1,'c1') ON CONFLICT DO NOTHING`, [studentId]);
    const first = await client.query(`SELECT id, max_points FROM assignments WHERE course_id='c1' ORDER BY id LIMIT 1`);
    if (first.rows[0]) {
      await client.query(
        `INSERT INTO submissions (assignment_id, user_id, content, grade, feedback, graded_at)
         VALUES ($1,$2,'My first responsive page: a personal profile card using Flexbox.',$3,'Clean semantic HTML. Next time, add a media query for small screens.', NOW())
         ON CONFLICT DO NOTHING`,
        [first.rows[0].id, studentId, Math.round(first.rows[0].max_points * 0.9)]
      );
    }
  }
}

export async function initializeDatabase() {
  const schemaSql = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await renameLegacyTables(client);
    await client.query(schemaSql);
    await seedCatalog(client);
    await seedLearning(client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  await ensureConstraints();
}
