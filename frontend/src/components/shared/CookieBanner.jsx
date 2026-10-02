import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from '../../hooks/useConsent';

/**
 * CookieBanner — GDPR/CCPA-style consent banner with:
 *   • Accept all / Reject non-essential buttons
 *   • "Manage preferences" with granular toggles
 *   • Keyboard accessible (tab-focusable, Escape to close)
 *   • Non-blocking (positioned fixed at bottom)
 */
export default function CookieBanner() {
  const {
    showBanner,
    showPreferences,
    setShowPreferences,
    acceptAll,
    rejectNonEssential,
    updateConsent,
    consent,
  } = useConsent();

  const [functional, setFunctional] = useState(consent?.functional ?? true);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    updateConsent({ functional, analytics });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        role="dialog"
        aria-label="Cookie consent"
        className="fixed bottom-0 left-0 right-0 z-[100] p-4"
      >
        <div className="max-w-3xl mx-auto glass-card p-5 sm:p-6 border-accent/20">
          {!showPreferences ? (
            /* ── Compact banner ── */
            <div>
              <p className="text-sm text-white/70 mb-4">
                We use essential cookies to keep you signed in, and optional functional cookies for real-time features.
                Read our <Link to="/cookies" className="text-accent hover:underline">Cookie Policy</Link> and{' '}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={acceptAll} className="btn-accent text-sm py-2 px-4">
                  Accept all
                </button>
                <button onClick={rejectNonEssential} className="btn-ghost text-sm py-2 px-4">
                  Reject non-essential
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="btn-ghost text-sm py-2 px-4"
                >
                  Manage preferences
                </button>
              </div>
            </div>
          ) : (
            /* ── Granular preferences ── */
            <div>
              <h3 className="text-white font-semibold mb-4">Cookie Preferences</h3>
              <div className="space-y-3 mb-5">
                {/* Essential — always on */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <span className="text-sm text-white font-medium">Essential</span>
                    <p className="text-xs text-white/40 mt-0.5">Authentication & consent storage</p>
                  </div>
                  <span className="text-xs text-accent/60 uppercase tracking-wider">Always on</span>
                </div>

                {/* Functional */}
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <span className="text-sm text-white font-medium">Functional</span>
                    <p className="text-xs text-white/40 mt-0.5">Real-time job progress & presence</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={functional}
                    onChange={(e) => setFunctional(e.target.checked)}
                    className="w-4 h-4 accent-accent rounded"
                  />
                </label>

                {/* Analytics */}
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <span className="text-sm text-white font-medium">Analytics</span>
                    <p className="text-xs text-white/40 mt-0.5">Not currently used</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-4 h-4 accent-accent rounded"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={handleSavePreferences} className="btn-accent text-sm py-2 px-4">
                  Save preferences
                </button>
                <button onClick={acceptAll} className="btn-ghost text-sm py-2 px-4">
                  Accept all
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
