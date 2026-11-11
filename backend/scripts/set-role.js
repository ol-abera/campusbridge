// Gives an existing account a role. There is no admin screen yet, and public sign-up can only create students
// (so nobody can make themselves an instructor), so this is how staff accounts are created:
//
//   cd backend
//   npm run set-role -- someone@example.com instructor
//   npm run set-role -- someone@example.com coordinator
//   npm run set-role -- someone@example.com student
//
// To let an instructor manage a course:  npm run set-role -- someone@example.com instructor c1   (course id)
import { pool } from '../src/db/index.js';

const [email, role, courseId] = process.argv.slice(2);
const ROLES = ['student', 'instructor', 'coordinator'];
if (!email || !ROLES.includes(role)) {
  console.error(`Usage: npm run set-role -- <email> <${ROLES.join('|')}> [courseId]`);
  process.exit(1);
}
try {
  const r = await pool.query('UPDATE users SET role = $1 WHERE LOWER(email) = LOWER($2) RETURNING id, full_name', [role, email]);
  if (!r.rowCount) { console.error(`No account with the email ${email}. Register it first.`); process.exitCode = 1; }
  else {
    console.log(`${r.rows[0].full_name} (${email}) is now: ${role}`);
    if (courseId) {
      if (role !== 'instructor') console.error('A course can only be given to an instructor.');
      else {
        const c = await pool.query('UPDATE courses SET instructor_id = $1 WHERE id = $2 RETURNING title', [r.rows[0].id, courseId]);
        console.log(c.rowCount ? `They now teach: ${c.rows[0].title}` : `No course with id ${courseId} (see the Courses page address, e.g. c1).`);
      }
    }
  }
} catch (err) {
  console.error('Failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
