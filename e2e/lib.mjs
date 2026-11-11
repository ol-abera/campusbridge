// Small helpers shared by the browser tests.
import puppeteer from 'puppeteer';

export const BASE = process.env.E2E_URL || 'http://localhost:5173';
export const DEMO_PASSWORD = 'Demo12345';

export async function launch() {
  return puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || undefined,
    args: (process.env.CHROME_ARGS || '--no-sandbox').split(' ').filter(Boolean)
  });
}
export const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
export const text = (page) => page.evaluate(() => document.body.innerText);
export const path = (page) => page.evaluate(() => location.pathname + location.search);
export const waitText = (page, t, timeout = 8000) => page.waitForFunction((s) => document.body.innerText.includes(s), { timeout }, t);
// Badges are shown in UPPERCASE by CSS (innerText reflects that), so badge text is matched ignoring case.
export const waitTextCI = (page, t, timeout = 8000) => page.waitForFunction((s) => document.body.innerText.toLowerCase().includes(s.toLowerCase()), { timeout }, t);
export const waitPath = (page, p, timeout = 8000) => page.waitForFunction((s) => location.pathname === s, { timeout }, p);
export async function clickByText(page, selector, label) {
  for (const h of await page.$$(selector)) {
    if ((await h.evaluate((el) => el.textContent.trim())).includes(label)) { await h.click(); return; }
  }
  throw new Error(`No ${selector} containing "${label}" on ${await path(page)}`);
}
export async function fill(page, selector, value) {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  if (value) await page.type(selector, value);
}
export async function login(page, email, password = DEMO_PASSWORD) {
  await page.goto(`${BASE}/login`);
  await fill(page, '#email', email);
  await fill(page, '#password', password);
  await clickByText(page, 'button[type=submit]', 'Log in');
  await page.waitForFunction(() => location.pathname !== '/login');
}
export async function logout(page) {
  await clickByText(page, 'button', 'Log out');
  await waitPath(page, '/');
}
export function makeRunner() {
  const results = [];
  return {
    results,
    async step(name, fn) {
      try { await fn(); results.push({ name, ok: true }); console.log(`  PASS  ${name}`); }
      catch (err) { results.push({ name, ok: false }); console.log(`  FAIL  ${name}\n        -> ${err.message.split('\n')[0]}`); }
    }
  };
}
