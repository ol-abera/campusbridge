// Real-browser end-to-end test of the whole student journey:
//   register -> session survives reload -> profile -> search/filter -> apply -> view applications
//   -> duplicate protection -> logout -> privacy between two students -> login -> mobile menu.
//
// Before running, start PostgreSQL, the API (backend: npm run dev) and the frontend (root: npm run dev).
// Then:   cd e2e && npm install && npm test
//
// Optional environment variables:
//   E2E_URL      frontend address (default http://localhost:5173)
//   CHROME_PATH  use an already-installed Chrome/Chromium instead of the one Puppeteer downloads
//   CHROME_ARGS  extra launch flags, space separated (default: --no-sandbox)
//
// The test creates accounts ending in @test.campusbridge.local (see README for how to delete them).
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = process.env.E2E_URL || 'http://localhost:5173';
const SHOTS = process.env.E2E_SHOTS; // optional folder: saves a screenshot after each step
const stamp = Date.now();
const PASSWORD = 'E2ePass123';
const userA = { name: 'Abebe Kebede', email: `e2e.a.${stamp}@test.campusbridge.local` };
const userB = { name: 'Chaltu Bekele', email: `e2e.b.${stamp}@test.campusbridge.local` };

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  args: (process.env.CHROME_ARGS || '--no-sandbox').split(' ').filter(Boolean)
});
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

const pageErrors = [];
async function newPage(width = 1280, height = 900) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  page.setDefaultTimeout(8000);
  page.on('pageerror', (e) => pageErrors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    // Third-party resources (Google Fonts, the Unsplash hero photo) may be unreachable offline: that is not an app bug.
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) pageErrors.push(`console.error: ${m.text().slice(0, 200)}`);
  });
  page.on('requestfailed', (r) => {
    const u = new URL(r.url());
    if (['localhost', '127.0.0.1'].includes(u.hostname) && !/net::ERR_ABORTED/.test(r.failure()?.errorText || '')) pageErrors.push(`request failed: ${r.url()}`);
  });
  return page;
}

// ---- tiny helpers -------------------------------------------------------------------------------
const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err: err.message });
    console.log(`  FAIL  ${name}\n        -> ${err.message.split('\n')[0]}`);
  }
}
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
const text = (page) => page.evaluate(() => document.body.innerText);
const path = (page) => page.evaluate(() => location.pathname + location.search);
const waitText = (page, t, timeout = 8000) => page.waitForFunction((s) => document.body.innerText.includes(s), { timeout }, t);
const waitPath = (page, p, timeout = 8000) => page.waitForFunction((s) => location.pathname === s, { timeout }, p);
async function clickByText(page, selector, label) {
  const handles = await page.$$(selector);
  for (const h of handles) {
    const t = await h.evaluate((el) => el.textContent.trim());
    if (t.includes(label)) { await h.click(); return; }
  }
  throw new Error(`No ${selector} containing "${label}" found on ${await path(page)}`);
}
async function fill(page, selector, value) {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  if (value) await page.type(selector, value);
}
async function shot(page, name) { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }); }
async function register(page, u) {
  await page.goto(`${BASE}/register`);
  await fill(page, '#fullName', u.name);
  await fill(page, '#email', u.email);
  await fill(page, '#university', 'Mizan-Tepi University');
  await fill(page, '#password', PASSWORD);
  await fill(page, '#confirmPassword', PASSWORD);
  await clickByText(page, 'button[type=submit]', 'Sign up');
  await waitPath(page, '/dashboard');
}

let appId;
const page = await newPage();

console.log(`\nCampusBridge browser test against ${BASE}\n`);

await step('Landing page loads with the hero heading and no horizontal scroll', async () => {
  await page.goto(BASE);
  await waitText(page, 'starts here');
  ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, 'page scrolls sideways');
  await shot(page, '01-landing');
});

await step('Logged-out visitor is redirected from protected pages to /login', async () => {
  for (const p of ['/dashboard', '/applications', '/profile', '/apply/o1']) {
    await page.goto(BASE + p);
    await waitPath(page, '/login');
  }
});

await step('Register form shows validation errors and does NOT submit bad data', async () => {
  await page.goto(`${BASE}/register`);
  await fill(page, '#fullName', 'A');
  await fill(page, '#email', 'not-an-email');
  await fill(page, '#password', 'short');
  await fill(page, '#confirmPassword', 'different');
  await clickByText(page, 'button[type=submit]', 'Sign up');
  await waitText(page, 'Enter a valid email address');
  await waitText(page, 'at least 8 characters');
  ok((await path(page)) === '/register', 'left the register page');
  await shot(page, '02-register-errors');
});

await step('Student A registers and lands on the dashboard greeting them by name', async () => {
  await register(page, userA);
  await waitText(page, 'Welcome, Abebe');
  await shot(page, '03-dashboard');
});

await step('Session survives a full page reload (still logged in)', async () => {
  await page.reload();
  await waitText(page, 'Welcome, Abebe');
  ok((await path(page)) === '/dashboard', 'was sent away from the dashboard');
});

await step('Profile: edit, save, reload, values persisted in the database', async () => {
  await page.goto(`${BASE}/profile`);
  await page.waitForSelector('#field');
  await page.select('#yearOfStudy', '3rd Year');
  await fill(page, '#field', 'Software Engineering');
  await fill(page, '#phone', '+251 911 000 000');
  await clickByText(page, 'button[type=submit]', 'Save changes');
  await waitText(page, 'Your profile has been saved');
  await page.reload();
  await page.waitForSelector('#field');
  ok((await page.$eval('#field', (e) => e.value)) === 'Software Engineering', 'field not persisted');
  ok((await page.$eval('#yearOfStudy', (e) => e.value)) === '3rd Year', 'year not persisted');
  ok((await page.$eval('#email', (e) => e.disabled)), 'email must be read-only');
});

await step('Profile: invalid phone number is rejected with a message', async () => {
  await fill(page, '#phone', 'abc');
  await clickByText(page, 'button[type=submit]', 'Save changes');
  await waitText(page, 'Phone can only contain');
});

await step('Opportunities: list loads with sample scholarships and regional listings', async () => {
  await page.goto(`${BASE}/opportunities`);
  await waitText(page, 'Showing');
  const t = await text(page);
  ok(/Showing\s+\d+\s+opportunit/.test(t), 'no result count');
  ok(t.includes('Scholarship'), 'no scholarship filter/listing');
  await shot(page, '04-opportunities');
});

await step('Opportunities: search, type filter, empty state and clear filters all work', async () => {
  await page.type('input[type=search]', 'jimma');
  // wait for the NARROWED list (the unfiltered list also contains this title, so waiting for it alone proves nothing)
  await page.waitForFunction(() => document.body.innerText.includes('Community Health Research Assistant') && !document.body.innerText.includes('Frontend Developer Intern'));
  await page.click('button[aria-label="Clear search"]'); // the X inside the search box
  await waitText(page, 'Frontend Developer Intern');
  await fill(page, 'input[type=search]', 'zzzznothing');
  await waitText(page, 'No opportunities found');
  await clickByText(page, 'button', 'Clear search and filters');
  await waitText(page, 'Showing');
  await clickByText(page, 'button[aria-pressed]', 'Scholarship');
  await page.waitForFunction(() => /Showing\s+\d+\s+opportunit/.test(document.body.innerText) && !document.body.innerText.includes('Frontend Developer Intern'));
  ok((await path(page)).includes('type=Scholarship'), 'filter not reflected in the URL');
  const badges = await page.$$eval('a.opportunity-card .opportunity-type', (els) => els.map((e) => e.textContent.trim()));
  ok(badges.length >= 1 && badges.every((b) => b === 'Scholarship'), `filter showed: ${badges.join(', ')}`);
});

await step('Opportunity detail opens from a card and shows Apply Now', async () => {
  await page.waitForSelector('a.opportunity-card');
  await page.click('a.opportunity-card');
  await page.waitForFunction(() => location.pathname.startsWith('/opportunities/'));
  await waitText(page, 'About this opportunity');
  await waitText(page, 'Apply Now');
  await shot(page, '05-detail');
});

await step('Apply form: empty and too-short submissions are blocked with clear messages', async () => {
  await clickByText(page, 'a', 'Apply Now');
  await page.waitForSelector('#coverLetter');
  ok((await page.$eval('#fullName', (e) => e.value)) === userA.name, 'form was not pre-filled from the account');
  await clickByText(page, 'button[type=submit]', 'Submit Application');
  await waitText(page, 'Cover letter is required');
  await fill(page, '#coverLetter', 'Too short.');
  await clickByText(page, 'button[type=submit]', 'Submit Application');
  await waitText(page, 'at least 50 characters');
  await fill(page, '#portfolioUrl', 'not a link');
  await clickByText(page, 'button[type=submit]', 'Submit Application');
  await waitText(page, 'starting with http');
  await shot(page, '06-apply-errors');
});

await step('Apply form: valid submission is saved and the student sees a confirmation', async () => {
  await fill(page, '#portfolioUrl', 'https://github.com/example');
  await fill(page, '#coverLetter', 'I am a motivated third-year student and I would like to learn from this opportunity and contribute my skills.');
  await clickByText(page, 'button[type=submit]', 'Submit Application');
  await waitText(page, 'Application submitted');
  await shot(page, '07-confirmation');
});

await step('Application detail shows status "Submitted", cover letter and the submitted details', async () => {
  await clickByText(page, 'a', 'View application');
  await page.waitForFunction(() => /^\/applications\/\d+$/.test(location.pathname));
  appId = (await path(page)).split('/').pop();
  await waitText(page, 'Cover letter');
  const t = await text(page);
  ok(t.includes('Submitted'), 'status not shown');
  ok(t.includes('motivated third-year student'), 'cover letter not shown');
  ok(t.includes('github.com/example'), 'link not shown');
  await shot(page, '08-application-detail');
});

await step('My Applications lists the application with its status badge', async () => {
  await page.goto(`${BASE}/applications`);
  await waitText(page, '1 application');
  const badge = await page.$eval('.card .badge', (e) => e.textContent.trim());
  ok(badge === 'Submitted', `badge was "${badge}"`);
});

await step('Dashboard shows the new application under "Recent applications"', async () => {
  await page.goto(`${BASE}/dashboard`);
  await waitText(page, 'Recent applications');
  ok(!(await text(page)).includes('You have not submitted any applications yet'), 'still shows the empty state');
  ok((await text(page)).includes('1 submitted'), 'application count is wrong');
});

await step('Duplicate protection: opportunity page and apply page both say "already applied"', async () => {
  await page.goto(`${BASE}/applications`);
  await page.waitForSelector('a.card');
  await page.click('a.card');
  await page.waitForFunction(() => /^\/applications\/\d+$/.test(location.pathname));
  await waitText(page, 'Details you submitted');
  await clickByText(page, 'a', 'View opportunity');
  await waitText(page, 'You have applied');
  const oppPath = await page.evaluate(() => location.pathname);
  await page.goto(`${BASE}/apply/${oppPath.split('/').pop()}`);
  await waitText(page, 'You have already applied');
});

await step('Logout returns to the home page and protected pages are locked again', async () => {
  await clickByText(page, 'button', 'Log out');
  await waitPath(page, '/');
  await waitText(page, 'Log in');
  await page.goto(`${BASE}/dashboard`);
  await waitPath(page, '/login');
  ok((await page.evaluate(() => localStorage.getItem('campusbridge_token'))) === null, 'token still stored after logout');
});

await step('Registering an existing email (any letter case) shows a duplicate-email error', async () => {
  await page.goto(`${BASE}/register`);
  await fill(page, '#fullName', userA.name);
  await fill(page, '#email', userA.email.toUpperCase());
  await fill(page, '#university', 'Mizan-Tepi University');
  await fill(page, '#password', PASSWORD);
  await fill(page, '#confirmPassword', PASSWORD);
  await clickByText(page, 'button[type=submit]', 'Sign up');
  await waitText(page, 'already exists');
});

await step("Privacy: student B cannot open student A's application (shown as not found)", async () => {
  await register(page, userB);
  await page.goto(`${BASE}/applications/${appId}`);
  await waitText(page, 'Application not found');
  ok(!(await text(page)).includes('motivated third-year student'), "A's cover letter leaked to B");
  await page.goto(`${BASE}/applications`);
  await waitText(page, 'No applications yet');
  await clickByText(page, 'button', 'Log out');
  await waitPath(page, '/');
});

await step('Login: wrong password shows an error, correct password reaches the dashboard', async () => {
  await page.goto(`${BASE}/login`);
  await fill(page, '#email', userA.email);
  await fill(page, '#password', 'WrongPassword9');
  await clickByText(page, 'button[type=submit]', 'Log in');
  await waitText(page, 'Incorrect email or password');
  await fill(page, '#password', PASSWORD);
  await clickByText(page, 'button[type=submit]', 'Log in');
  await waitPath(page, '/dashboard');
  await waitText(page, 'Welcome, Abebe');
});

await step('Expired/invalid token: user is logged out automatically instead of seeing broken pages', async () => {
  await page.evaluate(() => localStorage.setItem('campusbridge_token', 'not.a.real.token'));
  await page.goto(`${BASE}/applications`);
  await waitPath(page, '/login');
});

await step('Unknown page shows the "Page not found" screen with a way home', async () => {
  await page.goto(`${BASE}/this-page-does-not-exist`);
  await waitText(page, 'Page not found');
  await waitText(page, 'Go home');
});

await step('Mobile (375px): hamburger menu opens, navigates, and no page scrolls sideways', async () => {
  const m = await newPage(375, 800);
  await m.goto(BASE);
  await m.click('button[aria-label="Open menu"]');
  await clickByText(m, 'nav[aria-label="Mobile"] a', 'Opportunities');
  await waitPath(m, '/opportunities');
  for (const p of ['/', '/opportunities', '/courses', '/login', '/register']) {
    await m.goto(BASE + p);
    await m.waitForSelector('main');
    const over = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(over <= 0, `${p} overflows by ${over}px at 375px`);
  }
  await shot(m, '09-mobile');
  await m.close();
});

await step('No JavaScript errors or failed local requests during the whole run', async () => {
  const unique = [...new Set(pageErrors)];
  ok(unique.length === 0, unique.join(' | '));
});

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} browser steps passed.`);
process.exit(failed.length ? 1 : 0);
