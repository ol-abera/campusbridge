// End-to-end API test against a REAL PostgreSQL database.
//
//   npm run test:api
//
// By default the test starts its own copy of the API on a random free port, so you only need PostgreSQL
// running and backend/.env filled in (no second terminal needed).
// To test an API that is already running instead, set API_URL, for example:
//   API_URL=http://localhost:5000/api npm run test:api
//
// It creates throw-away accounts with the fake domain "@test.campusbridge.local" and, when it starts its
// own server, deletes them (and their applications) again when it finishes.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { config } from '../src/config.js';
import { pool, initializeDatabase } from '../src/db/index.js';
import { createApp } from '../src/app.js';

const OWN_SERVER = !process.env.API_URL;
let API = process.env.API_URL || '';
let server;
const stamp = Date.now();
const PASSWORD = 'TestPass123';
const CLOSED_ID = 'zz-test-closed';

async function call(path, { method = 'GET', body, token, raw } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: raw ?? (body ? JSON.stringify(body) : undefined)
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

const userA = { fullName: 'Test Student A', email: `a.${stamp}@test.campusbridge.local`, university: 'Test University', password: PASSWORD };
const userB = { fullName: 'Test Student B', email: `b.${stamp}@test.campusbridge.local`, university: 'Test University', password: PASSWORD };
let tokenA; let tokenB; let openOpportunity; let applicationId;

before(async () => {
  if (OWN_SERVER) {
    await initializeDatabase();
    await pool.query('DELETE FROM opportunities WHERE id = $1', [CLOSED_ID]);
    await new Promise((resolve) => { server = createApp().listen(0, '127.0.0.1', resolve); });
    API = `http://127.0.0.1:${server.address().port}/api`;
  }
  const health = await call('/health');
  assert.equal(health.status, 200, 'API/database not reachable. Is PostgreSQL running and DATABASE_URL correct?');
});

after(async () => {
  if (!OWN_SERVER) return;
  await pool.query('DELETE FROM opportunities WHERE id = $1', [CLOSED_ID]).catch(() => {});
  await pool.query("DELETE FROM users WHERE email LIKE $1", [`%.${stamp}@test.campusbridge.local`]).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('health endpoint reports database connected', async () => {
  const r = await call('/health');
  assert.equal(r.body.status, 'ok');
});

test('register: validation errors return 400', async () => {
  assert.equal((await call('/auth/register', { method: 'POST', body: {} })).status, 400);
  assert.equal((await call('/auth/register', { method: 'POST', body: { ...userA, email: 'nope' } })).status, 400);
  assert.equal((await call('/auth/register', { method: 'POST', body: { ...userA, password: 'short' } })).status, 400);
});

test('register: creates account, returns token, never returns password hash', async () => {
  const r = await call('/auth/register', { method: 'POST', body: userA });
  assert.equal(r.status, 201);
  assert.ok(r.body.token);
  assert.equal(r.body.user.email, userA.email);
  assert.equal(JSON.stringify(r.body).includes('password'), false);
  tokenA = r.body.token;
  const b = await call('/auth/register', { method: 'POST', body: userB });
  assert.equal(b.status, 201);
  tokenB = b.body.token;
});

test('register: duplicate email is rejected with 409 (case-insensitive)', async () => {
  const r = await call('/auth/register', { method: 'POST', body: { ...userA, email: userA.email.toUpperCase() } });
  assert.equal(r.status, 409);
});

test('login: correct credentials work, wrong ones return 401', async () => {
  const ok = await call('/auth/login', { method: 'POST', body: { email: userA.email, password: PASSWORD } });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);
  assert.equal((await call('/auth/login', { method: 'POST', body: { email: userA.email, password: 'WrongPass999' } })).status, 401);
  assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'nobody@test.campusbridge.local', password: PASSWORD } })).status, 401);
  assert.equal((await call('/auth/login', { method: 'POST', body: {} })).status, 400);
});

test('protected routes reject missing and invalid tokens', async () => {
  assert.equal((await call('/auth/me')).status, 401);
  assert.equal((await call('/auth/me', { token: 'garbage.token.value' })).status, 401);
  assert.equal((await call('/applications')).status, 401);
});

test('profile: update persists and is returned by /auth/me', async () => {
  const upd = await call('/auth/me', { method: 'PATCH', token: tokenA, body: { university: 'Mizan-Tepi University', yearOfStudy: '3rd Year', field: 'Software Engineering', phone: '+251 911 000 000', bio: 'Testing the profile.' } });
  assert.equal(upd.status, 200);
  const me = await call('/auth/me', { token: tokenA });
  assert.equal(me.body.user.university, 'Mizan-Tepi University');
  assert.equal(me.body.user.yearOfStudy, '3rd Year');
  assert.equal(me.body.user.bio, 'Testing the profile.');
  assert.equal((await call('/auth/me', { method: 'PATCH', token: tokenA, body: { yearOfStudy: '99th Year' } })).status, 400);
});

test('courses: list, search, filter, detail, 404', async () => {
  const all = await call('/courses');
  assert.equal(all.status, 200);
  assert.ok(all.body.total > 0);
  const search = await call('/courses?search=python');
  assert.ok(search.body.data.length >= 1);
  const none = await call('/courses?search=zzzznotacourse');
  assert.equal(none.body.total, 0);
  const cat = all.body.data[0].category;
  const filtered = await call(`/courses?category=${encodeURIComponent(cat)}`);
  assert.ok(filtered.body.data.every((c) => c.category === cat));
  const detail = await call(`/courses/${all.body.data[0].id}`);
  assert.equal(detail.status, 200);
  assert.equal((await call('/courses/does-not-exist')).status, 404);
});

test('opportunities: list, search, filter, detail, 404', async () => {
  const all = await call('/opportunities');
  assert.equal(all.status, 200);
  assert.ok(all.body.total > 0);
  openOpportunity = all.body.data.find((o) => !o.isClosed);
  assert.ok(openOpportunity, 'need at least one open opportunity in the database');
  assert.equal((await call('/opportunities?search=zzzznothing')).body.total, 0);
  const typed = await call(`/opportunities?type=${encodeURIComponent(openOpportunity.type)}`);
  assert.ok(typed.body.data.every((o) => o.type === openOpportunity.type));
  assert.equal((await call(`/opportunities/${openOpportunity.id}`)).status, 200);
  assert.equal((await call('/opportunities/nope')).status, 404);
  const meta = await call('/meta/filters');
  assert.ok(meta.body.opportunityCategories.length > 0);
});

const applicationBody = () => ({
  opportunityId: openOpportunity.id, fullName: userA.fullName, email: userA.email, university: 'Mizan-Tepi University',
  coverLetter: 'I am a motivated student and I would like to learn from this opportunity and contribute my skills.',
  positionTitle: 'FAKE TITLE FROM BROWSER', company: 'FAKE COMPANY'
});

test('applications: require login', async () => {
  assert.equal((await call('/applications', { method: 'POST', body: applicationBody() })).status, 401);
});

test('applications: validation and unknown opportunity', async () => {
  assert.equal((await call('/applications', { method: 'POST', token: tokenA, body: { ...applicationBody(), coverLetter: 'short' } })).status, 400);
  assert.equal((await call('/applications', { method: 'POST', token: tokenA, body: { ...applicationBody(), opportunityId: 'nope' } })).status, 404);
});

test('applications: submit stores real title/company from the database, not from the browser', async () => {
  const r = await call('/applications', { method: 'POST', token: tokenA, body: applicationBody() });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.status, 'Submitted');
  assert.equal(r.body.data.positionTitle, openOpportunity.title);
  assert.equal(r.body.data.company, openOpportunity.company);
  applicationId = r.body.data.id;
});

test('applications: duplicate submission is rejected with 409', async () => {
  assert.equal((await call('/applications', { method: 'POST', token: tokenA, body: applicationBody() })).status, 409);
});

test('applications: owner can list and open it', async () => {
  const list = await call('/applications', { token: tokenA });
  assert.ok(list.body.data.some((a) => a.id === applicationId));
  const one = await call(`/applications/${applicationId}`, { token: tokenA });
  assert.equal(one.status, 200);
  assert.ok(one.body.data.coverLetter);
});

test('applications: another user cannot see or list it', async () => {
  assert.equal((await call(`/applications/${applicationId}`, { token: tokenB })).status, 404);
  const list = await call('/applications', { token: tokenB });
  assert.equal(list.body.data.some((a) => a.id === applicationId), false);
});

test('applications: invalid ids return 404, not a server error', async () => {
  assert.equal((await call('/applications/abc', { token: tokenA })).status, 404);
  assert.equal((await call('/applications/999999999', { token: tokenA })).status, 404);
  assert.equal((await call("/applications/1;DROP TABLE users", { token: tokenA })).status, 404);
});

test('unknown API routes return JSON 404', async () => {
  const r = await call('/this-route-does-not-exist');
  assert.equal(r.status, 404);
  assert.ok(r.body.message);
});

// ---------------------------------------------------------------------------------------------
// Regression and security tests
// ---------------------------------------------------------------------------------------------

test('NUL characters are rejected with 400 instead of crashing the database query (was a 500)', async () => {
  const bad = 'Bad\u0000Name';
  assert.equal((await call('/auth/register', { method: 'POST', body: { ...userA, email: `n.${stamp}@test.campusbridge.local`, fullName: bad } })).status, 400);
  assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'a\u0000@b.com', password: PASSWORD } })).status, 400);
  assert.equal((await call('/courses?search=%00')).status, 400);
  assert.equal((await call('/opportunities?category=a%00b')).status, 400);
  assert.equal((await call('/courses/a%00b')).status, 400);
  assert.equal((await call('/applications', { method: 'POST', token: tokenA, body: { ...applicationBody(), coverLetter: 'x'.repeat(60) + '\u0000' } })).status, 400);
});

test('malformed percent-encoding in the address never causes a 500', async () => {
  const r = await call('/courses?search=100%');
  assert.ok(r.status < 500, `got ${r.status}`);
  assert.ok((await call('/courses/%E0%A4%A')).status < 500);
});

test('register: a password longer than bcrypt can use (72 bytes) is rejected, not silently truncated', async () => {
  const r = await call('/auth/register', { method: 'POST', body: { ...userA, email: `emoji.${stamp}@test.campusbridge.local`, password: 'a1' + '\u{1F600}'.repeat(30) } });
  assert.equal(r.status, 400);
});

test('tokens: expired, wrongly signed, unsigned (alg none) and unknown-user tokens all return 401', async () => {
  const me = (await call('/auth/me', { token: tokenA })).body.user;
  const expired = jwt.sign({ id: me.id }, config.jwtSecret, { expiresIn: -60 });
  const wrongSecret = jwt.sign({ id: me.id }, 'x'.repeat(48));
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const noneAlg = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: me.id })}.`;
  const unknownUser = jwt.sign({ id: '999999999' }, config.jwtSecret);
  for (const [name, token] of Object.entries({ expired, wrongSecret, noneAlg, unknownUser })) {
    assert.equal((await call('/auth/me', { token })).status, 401, name);
  }
  assert.equal((await call('/auth/me', { token: tokenA })).status, 200, 'the real token must still work');
});

test('profile: users cannot change their email or id through PATCH /auth/me (no mass assignment)', async () => {
  const before = (await call('/auth/me', { token: tokenA })).body.user;
  const r = await call('/auth/me', { method: 'PATCH', token: tokenA, body: { id: '1', email: 'hacker@example.com', password_hash: 'x', bio: 'still works' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.email, before.email);
  assert.equal(r.body.user.id, before.id);
  assert.equal(r.body.user.bio, 'still works');
});

test('applications: 8 simultaneous identical submissions create exactly ONE application (409 for the rest)', async () => {
  const c = await call('/auth/register', { method: 'POST', body: { fullName: 'Race Student', email: `race.${stamp}@test.campusbridge.local`, university: 'Test University', password: PASSWORD } });
  assert.equal(c.status, 201);
  const body = { ...applicationBody(), fullName: 'Race Student', email: `race.${stamp}@test.campusbridge.local` };
  const results = await Promise.all(Array.from({ length: 8 }, () => call('/applications', { method: 'POST', token: c.body.token, body })));
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 7);
  const list = await call('/applications', { token: c.body.token });
  assert.equal(list.body.total, 1);
});

test('applications: other HTTP methods cannot modify or delete an application', async () => {
  for (const method of ['PATCH', 'PUT', 'DELETE']) {
    const r = await call(`/applications/${applicationId}`, { method, token: tokenA, body: { status: 'Accepted' } });
    assert.ok([404, 405].includes(r.status), `${method} -> ${r.status}`);
  }
  const one = await call(`/applications/${applicationId}`, { token: tokenA });
  assert.equal(one.body.data.status, 'Submitted', 'status must not be changeable by the student');
});

test('applications: a student cannot apply after the deadline has passed (400)', { skip: !OWN_SERVER && 'needs direct database access (runs only when the test starts its own server)' }, async () => {
  await pool.query(
    `INSERT INTO opportunities (id, title, company, type, category, deadline)
     VALUES ($1, 'Closed Test Listing', 'Test Co', 'Internship', 'Technology', (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date - 1)
     ON CONFLICT (id) DO UPDATE SET deadline = EXCLUDED.deadline`, [CLOSED_ID]);
  const detail = await call(`/opportunities/${CLOSED_ID}`);
  assert.equal(detail.body.data.isClosed, true);
  const r = await call('/applications', { method: 'POST', token: tokenA, body: { ...applicationBody(), opportunityId: CLOSED_ID } });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /deadline/i);
});

test('seed data: scholarships and South West Ethiopia listings exist and are filterable', async () => {
  const meta = await call('/meta/filters');
  assert.ok(meta.body.opportunityTypes.includes('Scholarship'));
  const sch = await call('/opportunities?type=Scholarship');
  assert.ok(sch.body.total >= 1);
  assert.ok(sch.body.data.every((o) => o.type === 'Scholarship'));
  const jimma = await call('/opportunities?search=jimma');
  assert.ok(jimma.body.total >= 1);
});

test('error responses never leak stack traces, SQL or secrets', async () => {
  const probes = [
    await call('/courses?search=%00'),
    await call('/applications/abc', { token: tokenA }),
    await call('/auth/register', { method: 'POST', raw: '{bad json' }),
    await call('/auth/me', { token: 'garbage' })
  ];
  for (const p of probes) {
    const text = JSON.stringify(p.body);
    assert.equal(/at \w+.*\(|node_modules|SELECT |INSERT |password_hash|JWT_SECRET|postgres/i.test(text), false, text);
  }
});

test('login limiter: 25 successful logins are all fine, but repeated wrong passwords get 429 with Retry-After', { skip: !OWN_SERVER && 'would lock the shared running server' }, async () => {
  for (let i = 0; i < 25; i++) assert.equal((await call('/auth/login', { method: 'POST', body: { email: userA.email, password: PASSWORD } })).status, 200, `login ${i + 1}`);
  let last;
  for (let i = 0; i < 25; i++) {
    last = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: userA.email, password: 'WrongPassword9' }) });
    if (last.status === 429) break;
  }
  assert.equal(last.status, 429);
  assert.ok(Number(last.headers.get('retry-after')) > 0);
});
