// Puts the database into a clean, predictable DEMO state. Run it before a presentation:
//
//   cd backend && npm run demo:reset
//
// It removes: automated-test accounts (@test.campusbridge.local) and the listings/assignments they created
// ("ZZ ..."), all notifications of the demo accounts, and the demo accounts' own enrolments, submissions and
// applications. Then it re-creates the demo history (an enrolled student with one graded assignment).
// Real accounts and real listings are NOT touched. Needs SEED_DEMO_ACCOUNTS=true in backend/.env.
import { config } from '../src/config.js';
import { pool, initializeDatabase } from '../src/db/index.js';

if (!config.seedDemoAccounts) {
  console.error('Demo accounts are switched off. Add SEED_DEMO_ACCOUNTS=true to backend/.env (not allowed in production).');
  process.exit(1);
}

const demo = "SELECT id FROM users WHERE email LIKE '%@demo.campusbridge.local'";
const test = "SELECT id FROM users WHERE email LIKE '%@test.campusbridge.local'";
const steps = [
  ["automated-test listings and their applications", `DELETE FROM applications WHERE position_title LIKE 'ZZ %'`],
  [null, `DELETE FROM opportunities WHERE title LIKE 'ZZ %'`],
  [null, `DELETE FROM assignments WHERE title LIKE 'ZZ %'`],
  ["automated-test accounts", `DELETE FROM users WHERE email LIKE '%@test.campusbridge.local'`],
  ["demo notifications", `DELETE FROM notifications WHERE user_id IN (${demo})`],
  ["demo submissions", `DELETE FROM submissions WHERE user_id IN (${demo})`],
  ["demo enrolments", `DELETE FROM enrollments WHERE user_id IN (${demo})`],
  ["demo applications", `DELETE FROM applications WHERE user_id IN (${demo})`]
];
try {
  for (const [label, sql] of steps) {
    const r = await pool.query(sql);
    if (label) console.log(`Removed ${r.rowCount} ${label}.`);
  }
  await initializeDatabase(); // re-creates the demo history
  console.log('\nDemo reset complete. Log in with (password Demo12345):');
  console.log('  student@demo.campusbridge.local, instructor@demo.campusbridge.local, coordinator@demo.campusbridge.local');
} catch (err) {
  console.error('Reset failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
