import { Link, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import Apply from './pages/Apply';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyLearning from './pages/MyLearning';
import AssignmentDetail from './pages/AssignmentDetail';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorCourse from './pages/InstructorCourse';
import InstructorAssignment from './pages/InstructorAssignment';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CoordinatorNew from './pages/CoordinatorNew';
import CoordinatorApplicants from './pages/CoordinatorApplicants';
import { ROLE_HOME } from './utils/format';

// Pages that need a logged-in user. Visitors are sent to /login and returned here afterwards.
// `roles` (optional) limits a page to some roles, e.g. roles={['instructor']}. Other roles see a "no permission" page.
// The server enforces the same rules: hiding a page here is for convenience, not security.
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, checking, user } = useAuth();
  const location = useLocation();
  if (checking) return <LoadingSpinner size="lg" text="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>You do not have access to this page</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>This page is for a different type of account.</p>
        <Link to={ROLE_HOME[user.role] || '/'} className="btn btn-primary btn-sm">Go to my dashboard</Link>
      </div>
    );
  }
  return children;
}

// Login/Register are only for visitors: logged-in users are sent to their dashboard.
function GuestRoute({ children }) {
  const { isAuthenticated, checking, user } = useAuth();
  const location = useLocation();
  if (checking) return <LoadingSpinner size="lg" text="Checking your session..." />;
  return isAuthenticated ? <Navigate to={location.state?.from || ROLE_HOME[user.role] || '/dashboard'} replace /> : children;
}

function NotFound() {
  return (
    <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary btn-sm">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute roles={['student']}><Leaderboard /></ProtectedRoute>} />

          {/* Students */}
          <Route path="/apply/:id" element={<ProtectedRoute roles={['student']}><Apply /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute roles={['student']}><Applications /></ProtectedRoute>} />
          <Route path="/applications/:id" element={<ProtectedRoute roles={['student']}><ApplicationDetail /></ProtectedRoute>} />
          <Route path="/my-learning" element={<ProtectedRoute roles={['student']}><MyLearning /></ProtectedRoute>} />
          <Route path="/assignments/:id" element={<ProtectedRoute roles={['student']}><AssignmentDetail /></ProtectedRoute>} />

          {/* Instructors */}
          <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id" element={<ProtectedRoute roles={['instructor']}><InstructorCourse /></ProtectedRoute>} />
          <Route path="/instructor/assignments/:id" element={<ProtectedRoute roles={['instructor']}><InstructorAssignment /></ProtectedRoute>} />

          {/* Internship coordinators */}
          <Route path="/coordinator" element={<ProtectedRoute roles={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
          <Route path="/coordinator/new" element={<ProtectedRoute roles={['coordinator']}><CoordinatorNew /></ProtectedRoute>} />
          <Route path="/coordinator/opportunities/:id" element={<ProtectedRoute roles={['coordinator']}><CoordinatorApplicants /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
