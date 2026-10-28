
import { useState } from "react";
import "./App.css";

const courses = [
  {
    category: "DEVELOPMENT",
    title: "Full-Stack Web Development",
    description: "Build modern websites from frontend to backend.",
    progress: 65,
    lessons: "12 lessons",
    color: "purple",
    level: "Intermediate",
  },
  {
    category: "DESIGN",
    title: "UI/UX Design Fundamentals",
    description: "Learn to design digital experiences people love.",
    progress: 30,
    lessons: "8 lessons",
    color: "orange",
    level: "Beginner",
  },
  {
    category: "DATA",
    title: "Python for Beginners",
    description: "Start programming and working with data.",
    progress: 0,
    lessons: "10 lessons",
    color: "green",
    level: "Beginner",
  },
];

const internships = [
  {
    company: "TechNova",
    initials: "TN",
    role: "Frontend Developer Intern",
    type: "Remote",
    duration: "3 months",
  },
  {
    company: "PixelWorks",
    initials: "PW",
    role: "UI/UX Design Intern",
    type: "Hybrid",
    duration: "2 months",
  },
  {
    company: "DataNest",
    initials: "DN",
    role: "Junior Python Intern",
    type: "Remote",
    duration: "3 months",
  },
];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  function navigate(page) {
    setActivePage(page);
    setSelectedCourse(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openCourse(course) {
    setSelectedCourse(course);
    setActivePage("course-details");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyForInternship(internship) {
    const alreadyApplied = applications.some(
      (item) => item.company === internship.company
    );

    if (alreadyApplied) {
      setMessage(`You've already applied to ${internship.company} in this preview.`);
      return;
    }

    setApplications((previous) => [
      ...previous,
      { ...internship, status: "Pending" },
    ]);
    setMessage(`Your demo application to ${internship.company} was added.`);
  }

  function renderCourseCard(course) {
    return (
      <article className="course-card" key={course.title}>
        <div className={`course-art ${course.color}`}>
          <span className="course-art-symbol">
            {course.color === "purple"
              ? "</>"
              : course.color === "orange"
                ? "✳"
                : "Py"}
          </span>
          <span className="course-category">{course.category}</span>
        </div>

        <div className="course-body">
          <span className="course-lessons">{course.lessons}</span>
          <h3>{course.title}</h3>
          <p>{course.description}</p>

          <div className="progress-label">
            <span>Progress</span>
            <strong>{course.progress}%</strong>
          </div>

          <div className="progress-track">
            <span style={{ width: `${course.progress}%` }} />
          </div>

          <button
            className="course-button"
            onClick={() => openCourse(course)}
          >
            {course.progress > 0 ? "Continue course" : "Explore course"}{" "}
            <span>→</span>
          </button>
        </div>
      </article>
    );
  }

  function renderInternshipCard(internship) {
    const applied = applications.some(
      (item) => item.company === internship.company
    );

    return (
      <article className="internship-card" key={internship.company}>
        <div className="company-logo">{internship.initials}</div>

        <div className="internship-info">
          <h3>{internship.role}</h3>
          <p>
            {internship.company} <span>·</span> {internship.duration}
          </p>
        </div>

        <span className="work-type">{internship.type}</span>

        <button
          className="apply-button"
          onClick={() => applyForInternship(internship)}
        >
          {applied ? "Applied ✓" : "Apply"} <span>→</span>
        </button>
      </article>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigate("home");
          }}
        >
          <span className="brand-icon">C</span>
          <span>
            Campus<span className="brand-light">Bridge</span>
          </span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">
          <a
            className={`nav-link ${activePage === "home" ? "active" : ""}`}
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              navigate("home");
            }}
          >
            <span>⌂</span> Overview
          </a>

          <a
            className={`nav-link ${
              ["courses", "course-details"].includes(activePage) ? "active" : ""
            }`}
            href="#courses"
            onClick={(event) => {
              event.preventDefault();
              navigate("courses");
            }}
          >
            <span>▤</span> My learning
          </a>

          <a
            className={`nav-link ${
              activePage === "internships" ? "active" : ""
            }`}
            href="#internships"
            onClick={(event) => {
              event.preventDefault();
              navigate("internships");
            }}
          >
            <span>⌕</span> Internships
          </a>

          <a
            className={`nav-link ${
              activePage === "applications" ? "active" : ""
            }`}
            href="#applications"
            onClick={(event) => {
              event.preventDefault();
              navigate("applications");
            }}
          >
            <span>▣</span> Applications
            {applications.length > 0 && (
              <span className="nav-count">{applications.length}</span>
            )}
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">✳</span>
            <strong>Your future starts here.</strong>
            <p>Keep learning. Keep building.</p>
          </div>

          <div className="profile">
            <div className="avatar">O</div>
            <div className="profile-info">
              <strong>Student</strong>
              <span>CampusBridge learner</span>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER</p>
            <h1>
              {activePage === "home" && "Student dashboard"}
              {activePage === "courses" && "Explore your courses"}
              {activePage === "course-details" && "Course details"}
              {activePage === "internships" && "Explore internships"}
              {activePage === "applications" && "My applications"}
            </h1>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setMessage("You're all caught up!")}
            >
              ♧
            </button>
            <div className="top-avatar">O</div>
          </div>
        </header>

        {message && (
          <div className="notice" role="status">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {activePage === "home" && (
          <>
            <section className="welcome-banner">
              <div className="welcome-copy">
                <span className="welcome-tag">YOUR SPACE TO GROW</span>
                <h2>
                  Small steps.
                  <br />
                  Big futures.
                </h2>
                <p>
                  Learn new skills, explore opportunities, and take your next
                  step forward.
                </p>
                <button
                  className="primary-button"
                  onClick={() => navigate("courses")}
                >
                  Continue learning <span>→</span>
                </button>
              </div>

              <div className="welcome-art" aria-hidden="true">
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <div className="art-spark spark-one">✳</div>
                <div className="art-spark spark-two">✦</div>
                <div className="art-book">✧</div>
                <div className="art-note">
                  Keep going
                  <br />
                  you're doing great.
                </div>
              </div>
            </section>

            <section className="stats-grid" aria-label="Learning summary">
              <article className="stat-card">
                <span className="stat-icon lavender">▤</span>
                <p>Enrolled courses</p>
                <strong>03</strong>
                <span className="stat-note">Your learning journey</span>
              </article>

              <article className="stat-card">
                <span className="stat-icon mint">✓</span>
                <p>Lessons completed</p>
                <strong>12</strong>
                <span className="stat-note">Keep the momentum</span>
              </article>

              <article className="stat-card">
                <span className="stat-icon peach">⌕</span>
                <p>Internships saved</p>
                <strong>05</strong>
                <span className="stat-note">Opportunities to explore</span>
              </article>

              <article className="stat-card">
                <span className="stat-icon blue">↗</span>
                <p>Learning progress</p>
                <strong>
                  48<span className="percent">%</span>
                </strong>
                <div className="mini-progress">
                  <span />
                </div>
              </article>
            </section>

            <section className="content-section" id="courses">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">BUILD YOUR SKILLS</p>
                  <h2>Pick up where you left off</h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate("courses")}
                >
                  Explore courses <span>→</span>
                </button>
              </div>

              <div className="course-grid">
                {courses.map(renderCourseCard)}
              </div>
            </section>

            <section className="content-section internship-section" id="internships">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
                  <h2>Internships worth exploring</h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate("internships")}
                >
                  View all <span>→</span>
                </button>
              </div>

              <div className="internship-list">
                {internships.map(renderInternshipCard)}
              </div>
            </section>
          </>
        )}

        {activePage === "courses" && (
          <section className="content-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">LEARN AT YOUR OWN PACE</p>
                <h2>All courses</h2>
                <p>Choose a skill and keep building your future.</p>
              </div>
            </div>

            <div className="course-grid">
              {courses.map(renderCourseCard)}
            </div>
          </section>
        )}

        {activePage === "course-details" && selectedCourse && (
          <section className="content-section">
            <button
              className="text-link"
              onClick={() => navigate("courses")}
            >
              ← Back to courses
            </button>

            <article className="course-detail-card">
              <div className={`course-art ${selectedCourse.color}`}>
                <span className="course-art-symbol">
                  {selectedCourse.color === "purple"
                    ? "</>"
                    : selectedCourse.color === "orange"
                      ? "✳"
                      : "Py"}
                </span>
                <span className="course-category">
                  {selectedCourse.category}
                </span>
              </div>

              <div className="course-detail-body">
                <p className="eyebrow">COURSE OVERVIEW</p>
                <h2>{selectedCourse.title}</h2>
                <p>{selectedCourse.description}</p>
                <p>
                  <strong>Level:</strong> {selectedCourse.level}
                </p>
                <p>
                  <strong>Course content:</strong> {selectedCourse.lessons}
                </p>

                <div className="progress-label">
                  <span>Your progress</span>
                  <strong>{selectedCourse.progress}%</strong>
                </div>

                <div className="progress-track">
                  <span style={{ width: `${selectedCourse.progress}%` }} />
                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    setMessage(
                      "Lesson content will be added in a future CampusBridge update."
                    )
                  }
                >
                  {selectedCourse.progress > 0
                    ? "Continue learning"
                    : "Start learning"}{" "}
                  <span>→</span>
                </button>
              </div>
            </article>
          </section>
        )}

        {activePage === "internships" && (
          <section className="content-section internship-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TAKE YOUR NEXT STEP</p>
                <h2>Available internships</h2>
                <p>Explore opportunities that match your interests.</p>
              </div>
            </div>

            <div className="internship-list">
              {internships.map(renderInternshipCard)}
            </div>
          </section>
        )}

        {activePage === "applications" && (
          <section className="content-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR CAREER JOURNEY</p>
                <h2>My applications</h2>
                <p>Track the demo applications you've submitted.</p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">▣</span>
                <h3>No applications yet</h3>
                <p>
                  When you apply for an internship, it will appear here.
                </p>
                <button
                  className="primary-button"
                  onClick={() => navigate("internships")}
                >
                  Explore internships <span>→</span>
                </button>
              </div>
            ) : (
              <div className="internship-list">
                {applications.map((application) => (
                  <article
                    className="internship-card"
                    key={application.company}
                  >
                    <div className="company-logo">{application.initials}</div>
                    <div className="internship-info">
                      <h3>{application.role}</h3>
                      <p>
                        {application.company} <span>·</span>{" "}
                        {application.duration}
                      </p>
                    </div>
                    <span className="work-type">{application.status}</span>
                  </article>
                ))}
              </div>
            )}

            <p className="demo-note">
              These applications are temporary demo data and will reset when
              the page is refreshed. Backend storage will be added later.
            </p>
          </section>
        )}

        <footer className="footer">
          <a
            className="footer-brand"
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              navigate("home");
            }}
          >
            CampusBridge
          </a>
          <span>Learn something. Build something. Become something.</span>
          <span>Student dashboard preview</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
