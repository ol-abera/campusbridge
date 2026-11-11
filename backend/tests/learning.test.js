// Tests for the learning platform: roles, enrolment, assignments, grading, badges, coordinator review, notifications.
// Starts its own API against your real PostgreSQL database (like api.test.js).
// Needs the demo accounts: set SEED_DEMO_ACCOUNTS=true in backend/.env (the tests skip themselves otherwise).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { pool, initializeDatabase } from '../src/db/index.js';
import { createApp } from '../src/app.js';
import { DEMO_PASSWORD } from '../src/data/learning.js';

const skip = !config.seedDemoAccounts && 'set SEED_DEMO_ACCOUNTS=true in backend/.env to run these tests';
const stamp = Date.now();
const PASSWORD = 'TestPass123';
let API; let server;
let instructor; let coordinator; let student; let student2; let otherInstructor; let otherCoordinator;
let ownCourse; let assignment; let opportunityId; let applicationId; let submissionId;

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
const login = async (email, password = DEMO_PASSWORD) => (await call('/auth/login', { method: 'POST', body: { email, password } })).body;
async function newStudent(label) {
  const email = `${label}.${stamp}@test.campusbridge.local`;
  const r = await call('/auth/register', { method: 'POST', body: { fullName: `Test Learner ${label}`, email, university: 'Test University', password: PASSWORD } });
  assert.equal(r.status, 201);
  return { token: r.body.token, email, id: r.body.user.id };
}
// Registration can only create students, so test staff are promoted directly in the database.
async function newStaff(label, role) {
  const s = await newStudent(label);
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, s.id]);
  return s;
}

before(async () => {
  if (skip) return;
  await initializeDatabase();
  await new Promise((resolve) => { server = createApp().listen(0, '127.0.0.1', resolve); });
  API = `http://127.0.0.1:${server.address().port}/api`;
  instructor = await login('instructor@demo.campusbridge.local');
  coordinator = await login('coordinator@demo.campusbridge.local');
  student = await newStudent('stu1');
  student2 = await newStudent('stu2');
  otherInstructor = await newStaff('instr2', 'instructor');
  otherCoordinator = await newStaff('coord2', 'coordinator');
});

after(async () => {
  if (skip) return;
  await pool.query(`DELETE FROM notifications WHERE message LIKE '%Test Learner%' OR message LIKE '%ZZ Test%'`).catch(() => {});
  await pool.query(`DELETE FROM applications WHERE position_title LIKE 'ZZ Test%'`).catch(() => {});
  await pool.query(`DELETE FROM opportunities WHERE title LIKE 'ZZ Test%'`).catch(() => {});
  await pool.query(`DELETE FROM assignments WHERE title LIKE 'ZZ Test%'`).catch(() => {});
  await pool.query('DELETE FROM users WHERE email LIKE $1', [`%.${stamp}@test.campusbridge.local`]).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('demo accounts log in and report their role', { skip }, async () => {
  assert.equal(instructor.user.role, 'instructor');
  assert.equal(coordinator.user.role, 'coordinator');
  assert.equal((await login('student@demo.campusbridge.local')).user.role, 'student');
});

test('SECURITY: public registration can never create a privileged account', { skip }, async () => {
  const email = `evil.${stamp}@test.campusbridge.local`;
  const r = await call('/auth/register', { method: 'POST', body: { fullName: 'Evil Test Learner', email, university: 'Test University', password: PASSWORD, role: 'instructor' } });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.role, 'student');
  const patch = await call('/auth/me', { method: 'PATCH', token: r.body.token, body: { role: 'coordinator' } });
  assert.equal(patch.body.user.role, 'student');
});

test('roles: wrong-role requests get 403, anonymous get 401, unknown URLs still 404', { skip }, async () => {
  assert.equal((await call('/instructor/courses', { token: student.token })).status, 403);
  assert.equal((await call('/coordinator/opportunities', { token: student.token })).status, 403);
  assert.equal((await call('/progress', { token: instructor.token })).status, 403);
  assert.equal((await call('/courses/c1/enroll', { method: 'POST', token: coordinator.token })).status, 403);
  assert.equal((await call('/instructor/courses')).status, 401);
  assert.equal((await call('/progress')).status, 401);
  assert.equal((await call('/nothing-here', { token: student.token })).status, 404);
  assert.equal((await call('/nothing-here')).status, 404);
  assert.equal((await call('/courses')).status, 200, 'public catalogue must stay public');
});

test('instructor sees their courses with student and pending counts', { skip }, async () => {
  const r = await call('/instructor/courses', { token: instructor.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.data.length >= 1);
  ownCourse = r.body.data.find((c) => c.id === 'c1') || r.body.data[0];
  assert.equal(typeof ownCourse.students, 'number');
});

test('enrolment: assignments are hidden until enrolled; enrolling works once', { skip }, async () => {
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { token: student.token })).status, 403);
  assert.equal((await call(`/courses/${ownCourse.id}/enrollment`, { token: student.token })).body.enrolled, false);
  assert.equal((await call(`/courses/${ownCourse.id}/enroll`, { method: 'POST', token: student.token })).status, 201);
  assert.equal((await call(`/courses/${ownCourse.id}/enroll`, { method: 'POST', token: student.token })).status, 409);
  assert.equal((await call('/courses/nope/enroll', { method: 'POST', token: student.token })).status, 404);
  assert.equal((await call(`/courses/${ownCourse.id}/enrollment`, { token: student.token })).body.enrolled, true);
});

test('instructor creates an assignment: validation, ownership, duplicate title', { skip }, async () => {
  const body = { title: 'ZZ Test essay', description: 'Write about what you learned in this course.', dueDate: '2099-12-31', maxPoints: 50 };
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: instructor.token, body: { ...body, title: 'x' } })).status, 400);
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: instructor.token, body: { ...body, maxPoints: 0 } })).status, 400);
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: instructor.token, body: { ...body, dueDate: '2099-13-45' } })).status, 400);
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: otherInstructor.token, body })).status, 403, 'not their course');
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: student.token, body })).status, 403);
  const ok = await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: instructor.token, body });
  assert.equal(ok.status, 201);
  assignment = ok.body.data.id;
  assert.equal((await call(`/courses/${ownCourse.id}/assignments`, { method: 'POST', token: instructor.token, body })).status, 409);
});

test('enrolled students are notified of a new assignment', { skip }, async () => {
  const n = await call('/notifications', { token: student.token });
  assert.ok(n.body.data.some((x) => x.type === 'assignment' && x.message.includes('ZZ Test essay')));
  assert.ok(n.body.unread >= 1);
});

test('student sees the assignment with no submission yet', { skip }, async () => {
  const list = await call(`/courses/${ownCourse.id}/assignments`, { token: student.token });
  const a = list.body.data.find((x) => x.id === assignment);
  assert.ok(a);
  assert.equal(a.submission, null);
  assert.equal(a.maxPoints, 50);
  assert.equal((await call(`/assignments/${assignment}`, { token: student2.token })).status, 403, 'student2 is not enrolled');
});

test('submissions: validation, enrolment required, one per student, no work after the due date', { skip }, async () => {
  const work = { content: 'Here is my essay about what I learned, in detail.', link: 'https://example.com/essay' };
  assert.equal((await call(`/assignments/${assignment}/submissions`, { method: 'POST', token: student.token, body: { content: 'short' } })).status, 400);
  assert.equal((await call(`/assignments/${assignment}/submissions`, { method: 'POST', token: student.token, body: { ...work, link: 'javascript:alert(1)' } })).status, 400);
  assert.equal((await call(`/assignments/${assignment}/submissions`, { method: 'POST', token: student2.token, body: work })).status, 403);
  assert.equal((await call(`/assignments/${assignment}/submissions`, { method: 'POST', token: instructor.token, body: work })).status, 403);
  assert.equal((await call('/assignments/999999999/submissions', { method: 'POST', token: student.token, body: work })).status, 404);
  assert.equal((await call(`/assignments/${assignment}/submissions`, { method: 'POST', token: student.token, body: work })).status, 201);
  assert.equal((await call(`/assignments/${assignment}/submissions`, { method: 'POST', token: student.token, body: work })).status, 409);
  const late = (await pool.query(
    `INSERT INTO assignments (course_id, title, description, due_date) VALUES ($1,'ZZ Test late','Already past its due date.', CURRENT_DATE - 3) RETURNING id`, [ownCourse.id])).rows[0].id;
  const r = await call(`/assignments/${late}/submissions`, { method: 'POST', token: student.token, body: work });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /due date/i);
});

test('instructor sees the pending submission and the instructor is notified', { skip }, async () => {
  const subs = await call(`/assignments/${assignment}/submissions`, { token: instructor.token });
  assert.equal(subs.status, 200);
  assert.equal(subs.body.data.length, 1);
  assert.equal(subs.body.data[0].grade, null);
  submissionId = subs.body.data[0].id;
  const n = await call('/notifications', { token: instructor.token });
  assert.ok(n.body.data.some((x) => x.type === 'submission' && x.message.includes('ZZ Test essay')));
});

test('grading: only the course instructor, and only valid grades', { skip }, async () => {
  assert.equal((await call(`/assignments/${assignment}/submissions`, { token: otherInstructor.token })).status, 403);
  assert.equal((await call(`/submissions/${submissionId}/grade`, { method: 'PATCH', token: otherInstructor.token, body: { grade: 50 } })).status, 404);
  assert.equal((await call(`/submissions/${submissionId}/grade`, { method: 'PATCH', token: student.token, body: { grade: 50 } })).status, 403);
  assert.equal((await call(`/submissions/${submissionId}/grade`, { method: 'PATCH', token: instructor.token, body: { grade: 51 } })).status, 400, 'above max points');
  assert.equal((await call(`/submissions/${submissionId}/grade`, { method: 'PATCH', token: instructor.token, body: { grade: -1 } })).status, 400);
  assert.equal((await call(`/submissions/${submissionId}/grade`, { method: 'PATCH', token: instructor.token, body: { grade: 'abc' } })).status, 400);
  assert.equal((await call('/submissions/999999999/grade', { method: 'PATCH', token: instructor.token, body: { grade: 5 } })).status, 404);
  const ok = await call(`/submissions/${submissionId}/grade`, { method: 'PATCH', token: instructor.token, body: { grade: 48, feedback: 'Very good work.' } });
  assert.equal(ok.status, 200);
});

test('student sees grade and feedback, a notification, points and badges', { skip }, async () => {
  const a = await call(`/assignments/${assignment}`, { token: student.token });
  assert.equal(a.body.data.submission.grade, 48);
  assert.equal(a.body.data.submission.feedback, 'Very good work.');
  const n = await call('/notifications', { token: student.token });
  assert.ok(n.body.data.some((x) => x.type === 'grade' && x.message.includes('48/50')));
  const p = (await call('/progress', { token: student.token })).body.data;
  assert.equal(p.points, 48);
  const earned = Object.fromEntries(p.badges.map((b) => [b.id, b.earned]));
  assert.equal(earned['first-steps'], true);
  assert.equal(earned['first-submission'], true);
  assert.equal(earned['high-achiever'], true, '48/50 is above 90%');
  assert.equal(earned['applicant'], false);
  const course = p.courses.find((c) => c.id === ownCourse.id);
  assert.ok(course.submitted >= 1 && course.percent > 0 && course.percent <= 100);
});

test('leaderboard shows short names and points only, never emails', { skip }, async () => {
  const r = await call('/leaderboard', { token: student.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.data.length >= 1);
  assert.equal(JSON.stringify(r.body).includes('@'), false);
  assert.deepEqual(r.body.data.map((x) => x.rank), r.body.data.map((_, i) => i + 1));
  assert.equal((await call('/leaderboard')).status, 401);
});

test('notifications: mark one read, mark all read, never touch someone else\'s', { skip }, async () => {
  const list = (await call('/notifications', { token: student.token })).body;
  const id = list.data[0].id;
  assert.equal((await call(`/notifications/${id}/read`, { method: 'PATCH', token: student2.token })).status, 404);
  assert.equal((await call(`/notifications/${id}/read`, { method: 'PATCH', token: student.token })).status, 200);
  assert.equal((await call('/notifications/abc/read', { method: 'PATCH', token: student.token })).status, 404);
  await call('/notifications/read-all', { method: 'POST', token: student.token });
  assert.equal((await call('/notifications', { token: student.token })).body.unread, 0);
});

test('coordinator posts an opportunity (validated) and it appears publicly', { skip }, async () => {
  const body = { title: 'ZZ Test Internship', company: 'Test Org', location: 'Jimma', type: 'Internship', duration: '2 months', stipend: '', deadline: '2099-12-31', category: 'Technology', description: 'A test internship for automated testing only.', requirements: 'Be a student\nLike testing', tags: 'test' };
  assert.equal((await call('/opportunities', { method: 'POST', token: student.token, body })).status, 403);
  assert.equal((await call('/opportunities', { method: 'POST', body })).status, 401);
  assert.equal((await call('/opportunities', { method: 'POST', token: coordinator.token, body: { ...body, type: 'Hacking' } })).status, 400);
  assert.equal((await call('/opportunities', { method: 'POST', token: coordinator.token, body: { ...body, deadline: '2000-01-01' } })).status, 400, 'past deadline');
  assert.equal((await call('/opportunities', { method: 'POST', token: coordinator.token, body: { ...body, deadline: '2099-02-31' } })).status, 400, 'impossible date');
  assert.equal((await call('/opportunities', { method: 'POST', token: coordinator.token, body: { ...body, title: '' } })).status, 400);
  const ok = await call('/opportunities', { method: 'POST', token: coordinator.token, body });
  assert.equal(ok.status, 201);
  opportunityId = ok.body.data.id;
  const pub = await call(`/opportunities/${opportunityId}`);
  assert.equal(pub.status, 200);
  assert.deepEqual(pub.body.data.requirements, ['Be a student', 'Like testing']);
});

test('student applies; coordinator is notified, sees the applicant, and only the owner can review', { skip }, async () => {
  const app = { opportunityId, fullName: 'Test Learner stu1', email: student.email, university: 'Test University', coverLetter: 'I am a motivated student and I would like to learn from this opportunity and help.' };
  assert.equal((await call('/applications', { method: 'POST', token: coordinator.token, body: app })).status, 403, 'staff cannot apply');
  const r = await call('/applications', { method: 'POST', token: student.token, body: app });
  assert.equal(r.status, 201);
  applicationId = r.body.data.id;
  assert.ok((await call('/notifications', { token: coordinator.token })).body.data.some((x) => x.type === 'application' && x.message.includes('ZZ Test Internship')));

  assert.equal((await call(`/opportunities/${opportunityId}/applications`, { token: otherCoordinator.token })).status, 403);
  assert.equal((await call(`/opportunities/${opportunityId}/applications`, { token: student.token })).status, 403);
  const list = await call(`/opportunities/${opportunityId}/applications`, { token: coordinator.token });
  assert.equal(list.status, 200);
  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.data[0].status, 'Submitted');

  const mine = await call('/coordinator/opportunities', { token: coordinator.token });
  const row = mine.body.data.find((o) => o.id === opportunityId);
  assert.equal(row.applicants, 1);
  assert.equal(row.awaitingReview, 1);
});

test('status changes: only the owning coordinator, only allowed values, student is notified', { skip }, async () => {
  const set = (token, status) => call(`/applications/${applicationId}/status`, { method: 'PATCH', token, body: { status } });
  assert.equal((await set(student.token, 'Accepted')).status, 403, 'a student cannot accept themselves');
  assert.equal((await set(otherCoordinator.token, 'Accepted')).status, 404, 'not their opportunity');
  assert.equal((await set(coordinator.token, 'Withdrawn')).status, 400, 'staff cannot set Withdrawn');
  assert.equal((await set(coordinator.token, 'Hired!')).status, 400);
  assert.equal((await set(coordinator.token, 'Under Review')).status, 200);
  assert.equal((await set(coordinator.token, 'Accepted')).status, 200);
  const mine = await call(`/applications/${applicationId}`, { token: student.token });
  assert.equal(mine.body.data.status, 'Accepted');
  const n = await call('/notifications', { token: student.token });
  assert.ok(n.body.data.some((x) => x.type === 'status' && x.message.includes('Accepted')));
  assert.equal((await call(`/progress`, { token: student.token })).body.data.badges.find((b) => b.id === 'applicant').earned, true);
});

test('withdrawing: allowed before a decision, blocked after, and only for your own application', { skip }, async () => {
  const w = (token, id) => call(`/applications/${id}/withdraw`, { method: 'PATCH', token });
  assert.equal((await w(student.token, applicationId)).status, 409, 'already accepted');
  const opp2 = (await call('/opportunities', { method: 'POST', token: coordinator.token, body: { title: 'ZZ Test Scholarship', company: 'Test Org', type: 'Scholarship', deadline: '2099-12-31', category: 'Education', description: 'Another test listing, used for withdrawal tests.' } })).body.data.id;
  const a2 = await call('/applications', { method: 'POST', token: student.token, body: { opportunityId: opp2, fullName: 'Test Learner stu1', email: student.email, university: 'Test University', coverLetter: 'I am a motivated student and I would like to apply for this scholarship please.' } });
  assert.equal(a2.status, 201);
  assert.equal((await w(student2.token, a2.body.data.id)).status, 404, "cannot withdraw someone else's");
  const ok = await w(student.token, a2.body.data.id);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.status, 'Withdrawn');
  assert.equal((await w(student.token, a2.body.data.id)).status, 409, 'cannot withdraw twice');
  const status = await call(`/applications/${a2.body.data.id}/status`, { method: 'PATCH', token: coordinator.token, body: { status: 'Accepted' } });
  assert.equal(status.status, 409, 'coordinator cannot revive a withdrawn application');
});
