import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import Apply from './pages/Apply';
import Applications from './pages/Applications';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/apply/:id" element={<Apply />} />
          <Route path="/applications" element={<Applications />} />
          <Route
            path="*"
            element={
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Page not found</h1>
                <p style={{ color: '#6b7280', marginBottom: '1.25rem' }}>
                  The page you're looking for doesn't exist.
                </p>
                <a href="/" className="btn btn-primary btn-sm">
                  Go Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
