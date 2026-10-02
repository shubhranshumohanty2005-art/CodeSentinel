import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ConsentProvider, useConsent } from './hooks/useConsent';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/shared/CookieBanner';
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
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Refund from './pages/Refund';
import DataPrivacy from './pages/DataPrivacy';
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
  const { openPreferences } = useConsent();

  // Show black hole background on all pages except Landing and Login
  const showBackground = location.pathname !== '/' && location.pathname !== '/login';
  // Hide default navbar on Landing page (Kage has its own nav)
  const showNavbar = location.pathname !== '/';
  // Show footer only on the Landing page
  const showFooter = location.pathname === '/';

  return (
    <>
      {showBackground && <BlackHoleBackground />}
      {showNavbar && <Navbar />}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow">
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
            
            {/* Legal Pages */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/data" element={<ProtectedRoute><DataPrivacy /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        {showFooter && <Footer onOpenCookieSettings={openPreferences} />}
      </div>
      <CookieBanner />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConsentProvider>
        <AppRoutes />
      </ConsentProvider>
    </AuthProvider>
  );
}
