# CampusBridge

A premium, modern student platform for discovering courses, internships, and tracking applications.

**Design:** Soft lavender, pastel purple, cream white, pale pink & light blue · Rounded cards · Elegant typography · Smooth animations · Fully responsive.

---

## Features

- **Landing page** – Beautiful hero, features, and stats
- **Student dashboard** – Quick overview of courses, opportunities & applications
- **Course browsing** – Search, filter by category & level, course detail pages
- **Internship & opportunity listings** – Search, filter, detail pages
- **Application system** – Submit applications with validation + track status
- **Loading / empty / error states** throughout
- **Responsive navigation** for desktop and mobile
- **Configurable API base URL** ready for an Express backend

> **Note:** The frontend currently uses realistic mock data with simulated network delays. When your Express backend is ready, set `VITE_API_BASE_URL` and the same API calls will hit your server. Applications submitted in demo mode are stored only for the current browser session and are **not** persisted to a real database.

---

## Requirements

- **Node.js** 18 or newer (recommended: 20+)
- **npm** 9+ (comes with Node)

---

## Windows Installation & Run Instructions

### 1. Install Node.js (if you don't have it)

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version
3. Run the installer and accept the defaults
4. Open a **new** PowerShell or Command Prompt and verify:

```powershell
node --version
npm --version
```

### 2. Extract the project

Unzip `CampusBridge.zip` to a folder of your choice, for example:

```
C:\Users\YourName\Projects\CampusBridge
```

### 3. Install dependencies

Open PowerShell (or Command Prompt), navigate to the project folder, and run:

```powershell
cd C:\Users\YourName\Projects\CampusBridge
npm install
```

This may take 1–2 minutes the first time.

### 4. Start the development server

```powershell
npm run dev
```

Vite will start the app (usually at **http://localhost:5173**).  
Your browser should open automatically. If not, open the URL shown in the terminal.

### 5. Build for production (optional)

```powershell
npm run build
npm run preview
```

---

## Connecting to a Real Backend

By default the app talks to `http://localhost:5000/api`.

You can change this in two ways:

1. **Environment variable (recommended)**  
   Create a file named `.env` in the project root:

   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

2. **Or edit** `src/config.js` directly.

Expected API endpoints (for your Express backend):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List courses (supports `?search=&category=&level=`) |
| GET | `/courses/:id` | Single course |
| GET | `/opportunities` | List opportunities |
| GET | `/opportunities/:id` | Single opportunity |
| POST | `/applications` | Submit an application |
| GET | `/applications` | List user's applications |

If the backend is unreachable, the frontend gracefully falls back to mock data so the UI remains fully usable.

---

## Project Structure

```
CampusBridge/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── CourseCard.jsx
│   │   ├── OpportunityCard.jsx
│   │   ├── ApplicationCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterChips.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   └── ErrorState.jsx
│   ├── data/
│   │   └── mockData.js      # Sample courses & opportunities
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── Opportunities.jsx
│   │   ├── OpportunityDetail.jsx
│   │   ├── Apply.jsx
│   │   └── Applications.jsx
│   ├── services/
│   │   └── api.js           # API layer (mock + real backend ready)
│   ├── App.jsx
│   ├── config.js            # API_BASE_URL & app constants
│   ├── main.jsx
│   └── index.css            # Design system & global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Tech Stack

- **React 18** + **Vite**
- **React Router v6**
- **Lucide React** (icons)
- Pure CSS design system (no Tailwind required)
- JavaScript (no TypeScript)

---

## License

MIT — feel free to use and extend for your own projects.
