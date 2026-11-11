// Real-browser test of the three roles working together:
//   student enrols + submits -> instructor grades -> student sees grade/notification/badges
//   coordinator posts an opportunity -> student applies -> coordinator accepts -> student is notified -> withdraw.
//
// Needs the demo accounts: backend/.env must contain SEED_DEMO_ACCOUNTS=true. Start the API and frontend, then:
//   cd e2e && npm test        (runs both browser tests)   or   node roles.test.mjs
import { BASE, launch, ok, text, path, waitText, waitTextCI, waitPath, clickByText, fill, login, logout, makeRunner } from './lib.mjs';

const stamp = Date.now();
const PASSWORD = 'E2ePass123';
const student = { name: 'Lensa Tolera', email: `e2e.roles.${stamp}@test.campusbridge.local` };
const OPP_TITLE = `ZZ E2E Internship ${stamp}`;
const browser = await launch();
const errors = [];
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
page.setDefaultTimeout(8000);
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console.error: ${m.text().slice(0, 200)}`); });
const { step, results } = makeRunner();

// The instructor page lists everyone's submissions, so find this run's student by their unique email.
async function studentCard() {
  for (const c of await page.$$('.card')) {
    if ((await c.evaluate((e) => e.innerText)).includes(student.email)) return c;
  }
  throw new Error("this run's student card not found");
}

console.log(`\nCampusBridge multi-role browser test against ${BASE}\n`);

await step('Student registers, opens a course and sees the Enrol button', async () => {
  await page.goto(`${BASE}/register`);
  await fill(page, '#fullName', student.name);
  await fill(page, '#email', student.email);
  await fill(page, '#university', 'Jimma University');
  await fill(page, '#password', PASSWORD);
  await fill(page, '#confirmPassword', PASSWORD);
  await clickByText(page, 'button[type=submit]', 'Sign up');
  await waitPath(page, '/dashboard');
  await page.goto(`${BASE}/courses/c1`);
  await waitText(page, 'Enrol in this course');
});

await step('Enrolling shows the course assignments (with status "To do")', async () => {
  await clickByText(page, 'button', 'Enrol now');
  await waitText(page, 'You are enrolled');
  await waitText(page, 'Build a personal profile page');
  await waitTextCI(page, 'To do');
});

await step('Assignment form validates, then a valid submission shows "Awaiting grading"', async () => {
  await clickByText(page, 'a', 'Build a personal profile page');
  await page.waitForSelector('#content');
  await fill(page, '#content', 'too short');
  await clickByText(page, 'button[type=submit]', 'Submit assignment');
  await waitText(page, 'at least 20 characters');
  await fill(page, '#content', 'I built a responsive profile card with semantic HTML and Flexbox, and tested it on a phone.');
  await fill(page, '#link', 'https://github.com/example/profile');
  await clickByText(page, 'button[type=submit]', 'Submit assignment');
  await waitTextCI(page, 'Awaiting grading');
});

await step('My learning shows progress, points and earned/locked badges', async () => {
  await page.goto(`${BASE}/my-learning`);
  await waitText(page, 'My courses');
  const t = await text(page);
  ok(/1 of 2 assignments submitted \(50%\)/.test(t), 'progress text wrong');
  const label = (n) => page.$eval(`[aria-label^="${n}:"]`, (e) => e.getAttribute('aria-label'));
  ok((await label('First Steps')).includes('earned'), 'First Steps not earned');
  ok((await label('Doer')).includes('earned'), 'Doer not earned');
  ok((await label('High Achiever')).includes('locked'), 'High Achiever should still be locked');
});

await step('Instructor logs in, lands on their dashboard and sees work waiting to be graded', async () => {
  await logout(page);
  await login(page, 'instructor@demo.campusbridge.local');
  await waitPath(page, '/instructor');
  await waitText(page, 'Introduction to Web Development');
  await waitTextCI(page, 'to grade');
});

await step('Instructor opens the course and assignment, and invalid grades are blocked', async () => {
  await clickByText(page, 'a', 'Introduction to Web Development');
  await waitText(page, 'Create an assignment');
  await clickByText(page, 'a', 'Build a personal profile page');
  await waitText(page, student.email);
  const card = await studentCard();
  const gradeInput = await card.$('input[type=number]');
  await gradeInput.click({ clickCount: 3 });
  await gradeInput.type('150');
  await (await card.$('button[type=submit]')).click();
  await waitText(page, 'Grade must be a whole number from 0 to 100');
});

await step('Instructor grades the work with feedback (saved, shown on this student only)', async () => {
  const card = await studentCard();
  const gradeInput = await card.$('input[type=number]');
  await gradeInput.click({ clickCount: 3 });
  await gradeInput.type('95');
  const inputs = await card.$$('input');
  await inputs[1].type('Great responsive layout!');
  await (await card.$('button[type=submit]')).click();
  await page.waitForFunction((email) => [...document.querySelectorAll('.card')].some((c) => c.innerText.includes(email) && c.innerText.includes('95/100')), {}, student.email);
});

await step('Instructor cannot open student pages (access denied screen)', async () => {
  await page.goto(`${BASE}/my-learning`);
  await waitText(page, 'You do not have access to this page');
  await page.goto(`${BASE}/coordinator`);
  await waitText(page, 'You do not have access to this page');
});

await step('Student sees an unread bell, the grade notification, then the feedback', async () => {
  await logout(page);
  await login(page, student.email, PASSWORD);
  await page.waitForSelector('a[aria-label*="unread"]');
  await page.click('a[aria-label*="unread"]');
  await waitText(page, 'was graded: 95/100');
  await clickByText(page, 'button', 'was graded: 95/100');
  await waitText(page, 'Great responsive layout!');
  ok((await text(page)).includes('95'), 'grade not shown');
});

await step('Student earns the High Achiever badge and appears on the leaderboard', async () => {
  await page.goto(`${BASE}/my-learning`);
  await page.waitForSelector('[aria-label^="High Achiever:"]');
  ok((await page.$eval('[aria-label^="High Achiever:"]', (e) => e.getAttribute('aria-label'))).includes('earned'), 'badge not earned');
  await page.goto(`${BASE}/leaderboard`);
  await waitText(page, 'Lensa T.');
  ok(!(await text(page)).includes('@'), 'leaderboard leaks an email');
});

await step('Coordinator logs in, form validation works, then they post an opportunity', async () => {
  await logout(page);
  await login(page, 'coordinator@demo.campusbridge.local');
  await waitPath(page, '/coordinator');
  await clickByText(page, 'a', 'Post an opportunity');
  await waitPath(page, '/coordinator/new');
  await clickByText(page, 'button[type=submit]', 'Post opportunity');
  await waitText(page, 'Title must be at least 3 characters');
  await fill(page, '#title', OPP_TITLE);
  await fill(page, '#company', 'E2E Test Organisation');
  await fill(page, '#category', 'Technology');
  await fill(page, '#location', 'Jimma · On-site');
  await page.type('#deadline', '12312099');
  await fill(page, '#description', 'An automated browser test created this opportunity to check the coordinator flow.');
  await clickByText(page, 'button[type=submit]', 'Post opportunity');
  await waitPath(page, '/coordinator');
  await waitText(page, OPP_TITLE);
});

await step('The new opportunity is visible to everyone on the public page', async () => {
  await logout(page);
  await page.goto(`${BASE}/opportunities?search=${encodeURIComponent(OPP_TITLE)}`);
  await waitText(page, OPP_TITLE);
});

await step('Student applies to it', async () => {
  await login(page, student.email, PASSWORD);
  await page.goto(`${BASE}/opportunities?search=${encodeURIComponent(OPP_TITLE)}`);
  await page.waitForSelector('a.opportunity-card');
  await page.click('a.opportunity-card');
  await waitText(page, 'Apply Now');
  await clickByText(page, 'a', 'Apply Now');
  await page.waitForSelector('#coverLetter');
  await fill(page, '#coverLetter', 'I am a motivated student from Jimma and I would love to contribute to this test internship.');
  await clickByText(page, 'button[type=submit]', 'Submit Application');
  await waitText(page, 'Application submitted');
});

await step('Coordinator sees the applicant and accepts them', async () => {
  await logout(page);
  await login(page, 'coordinator@demo.campusbridge.local');
  await waitText(page, OPP_TITLE);
  await clickByText(page, 'a', OPP_TITLE);
  await waitText(page, 'Lensa Tolera');
  await clickByText(page, 'button', 'Accept');
  await page.waitForFunction(() => [...document.querySelectorAll('.badge')].some((b) => b.textContent.trim() === 'Accepted'));
});

await step('Student is notified and sees status "Accepted" (no withdraw button anymore)', async () => {
  await logout(page);
  await login(page, student.email, PASSWORD);
  await page.goto(`${BASE}/notifications`);
  await waitText(page, 'is now: Accepted');
  await clickByText(page, 'button', 'is now: Accepted');
  await page.waitForFunction(() => /^\/applications\/\d+$/.test(location.pathname));
  await waitTextCI(page, 'Accepted');
  ok(!(await text(page)).toLowerCase().includes('withdraw application'), 'withdraw offered after a decision');
});

await step('Withdrawing: student applies to another opportunity, withdraws it with confirmation', async () => {
  await page.goto(`${BASE}/apply/o1`);
  await page.waitForSelector('#coverLetter');
  await fill(page, '#coverLetter', 'I would like to apply for this role and I am ready to learn quickly and work hard.');
  await clickByText(page, 'button[type=submit]', 'Submit Application');
  await waitText(page, 'Application submitted');
  await clickByText(page, 'a', 'View application');
  await waitText(page, 'Withdraw application');
  await clickByText(page, 'button', 'Withdraw application');
  await waitText(page, 'Yes, withdraw');
  await clickByText(page, 'button', 'Yes, withdraw');
  await page.waitForFunction(() => [...document.querySelectorAll('.badge')].some((b) => b.textContent.trim() === 'Withdrawn'));
  ok(!(await text(page)).includes('Withdraw application'), 'withdraw still offered');
});

await step('Responsive: role navigation works in the mobile menu at 375px', async () => {
  const m = await browser.newPage();
  await m.setViewport({ width: 375, height: 800 });
  await m.evaluateOnNewDocument((t) => localStorage.setItem('campusbridge_token', t), await page.evaluate(() => localStorage.getItem('campusbridge_token')));
  await m.goto(`${BASE}/my-learning`);
  await waitText(m, 'My courses');
  await m.click('button[aria-label="Open menu"]');
  await waitText(m, 'Notifications');
  for (const p of ['/my-learning', '/leaderboard', '/notifications', '/applications']) {
    await m.goto(BASE + p);
    await m.waitForSelector('main');
    await new Promise((r) => setTimeout(r, 400));
    const over = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(over <= 0, `${p} overflows by ${over}px`);
  }
  await m.close();
});

await step('No JavaScript errors during the whole run', async () => {
  const unique = [...new Set(errors)];
  ok(unique.length === 0, unique.join(' | '));
});

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} multi-role browser steps passed.`);
process.exit(failed.length ? 1 : 0);
