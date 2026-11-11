# CampusBridge: Presentation notes (Brolf Tech Challenge, Project 4)

**One line:** a university learning and internship platform. Students take courses, submit assignments and earn points and badges, then apply for internships, scholarships and research opportunities. Instructors grade. Coordinators review applicants.

**Problem:** learning and opportunities live in different places, progress is not tracked, and instructors and organisations have no simple tool. (Motivation, not survey data.)

**Users and roles:** student, instructor, internship coordinator. Public sign-up creates students only; staff roles are granted by an administrator (`npm run set-role`) or the demo accounts.

**Architecture:** React single-page app -> REST/JSON API (Express, JWT, role checks) -> PostgreSQL. The browser never talks to the database. All permission rules live in the API.

**Why this stack:** React/Vite for fast UI work; Express because it is small and easy to explain; PostgreSQL for relational integrity (foreign keys, UNIQUE and CHECK constraints); JWT for stateless login with a separate frontend and API.

**Database (8 tables):** users, courses, enrollments, assignments, submissions, opportunities, applications, notifications. One application per student and opportunity, one submission per student and assignment, one enrolment per student and course, all enforced by the database.

**Security:** roles enforced on the server; ownership checked in SQL (someone else's record answers 404); bcrypt; JWT with expiry; parameterised SQL; validation; rate limits (failed logins, sign-ups, submissions); a role field in sign-up is ignored.

**Testing (all passing in the final runs):** 15 unit, 46 API tests against real PostgreSQL, 42 steps in a real Chrome browser (103 checks). Removing a security fix makes its test fail. Not tested: Safari, Firefox, real phones, any deployment.

## Before you present
```bash
cd backend
npm run demo:reset      # clean demo state (needs SEED_DEMO_ACCOUNTS=true in .env)
npm run dev             # terminal 1
# terminal 2, project root:
npm run dev
```
Demo accounts (password `Demo12345`): `student@`, `instructor@`, `coordinator@` + `demo.campusbridge.local`. Use a private window per role, or log out between roles.

## Live demo (about 6 minutes)
1. **Student** (`student@demo...`): My learning shows 90 points, three badges earned, 50% progress. Open *Introduction to Web Development*, open the second assignment, submit the form (show the validation message first).
2. **Instructor** (`instructor@demo...`): dashboard shows "to grade". Open the course, then the assignment, enter a grade above the maximum (rejected), then a valid grade with feedback.
3. **Student again:** the bell has a notification. Open it: grade and feedback are shown. My learning now shows more points.
4. **Coordinator** (`coordinator@demo...`): Post an opportunity (show the validation, a past deadline is rejected). It appears on the public Opportunities page.
5. **Student:** apply for it. **Coordinator:** open the applicant and click Accept. **Student:** notification, status Accepted, no Withdraw button any more.
6. **Security moment:** as the student open `/instructor` in the address bar: "You do not have access". Mention that the server enforces this too, not only the page.

## Likely questions (short answers)
- *Can a student make themselves an instructor?* No. Sign-up always creates a student and ignores any role field; there is a test for exactly this attack.
- *How do you stop one student seeing another's work?* Every query filters by the logged-in user's id taken from the verified token, never from the request. Others' records answer 404.
- *Why PostgreSQL?* Relational data with rules the database itself enforces, so bugs in code cannot create duplicates.
- *What was the hardest bug?* A hidden NUL character crashed five endpoints with HTTP 500 because PostgreSQL cannot store it. Now rejected with 400.
- *What is missing?* AI assistant, deployment, file upload, email notifications, admin screen.

## Honest limitations
No AI feature yet; not deployed (runs locally); text and link submissions only; in-app notifications only; no admin screen (courses are defined in the seed file; roles via `set-role`); sample data throughout.
