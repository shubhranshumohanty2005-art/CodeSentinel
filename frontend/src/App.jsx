import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import BlackHoleBackground from './components/shared/BlackHoleBackground';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConnectRepo from './pages/ConnectRepo';
import PRReview from './pages/PRReview';
import DocsGenerator from './pages/DocsGenerator';
import BugTriage from './pages/BugTriage';
import TestScaffolding from './pages/TestScaffolding';
import Settings from './pages/Settings';
import Loader from './components/shared/Loader';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}



function AppRoutes() {
  const location = useLocation();

  // Show black hole background on all pages except Landing and Login
  const showBackground = location.pathname !== '/' && location.pathname !== '/login';

  return (
    <>
      {showBackground && <BlackHoleBackground />}
      <Navbar />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/connect-repo" element={<ProtectedRoute><ConnectRepo /></ProtectedRoute>} />
          <Route path="/pr-review" element={<ProtectedRoute><PRReview /></ProtectedRoute>} />
          <Route path="/docs" element={<ProtectedRoute><DocsGenerator /></ProtectedRoute>} />
          <Route path="/bug-triage" element={<ProtectedRoute><BugTriage /></ProtectedRoute>} />
          <Route path="/test-scaffold" element={<ProtectedRoute><TestScaffolding /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
