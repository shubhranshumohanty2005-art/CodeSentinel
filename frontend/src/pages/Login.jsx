import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/shared/Loader';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // While Firebase is resolving the auth state, show a loader
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading..." size="lg" />
      </div>
    );
  }

  // If already logged in, redirect declaratively
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login();
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 sm:p-12 max-w-md w-full text-center"
      >
        <div className="text-5xl mb-6">🛡️</div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-white/50 mb-8">Sign in to CodeSentinel with your GitHub account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <label className="flex items-start gap-3 mb-6 text-left cursor-pointer group">
          <input
            type="checkbox"
            checked={consentAgreed}
            onChange={(e) => setConsentAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-accent bg-white/5 border-white/20"
          />
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            I agree to the <Link to="/terms" className="text-accent hover:underline">Terms &amp; Conditions</Link> and{' '}
            <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
          </span>
        </label>

        <button
          onClick={handleLogin}
          disabled={loading || !consentAgreed}
          className="btn-accent w-full text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
          {loading ? 'Signing in...' : 'Sign in with GitHub'}
        </button>

        <p className="mt-6 text-xs text-white/30">
          By signing in, you grant CodeSentinel read access to your repositories.
        </p>
      </motion.div>
    </div>
  );
}
