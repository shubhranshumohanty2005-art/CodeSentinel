import { Link } from 'react-router-dom';

/**
 * Footer — shown on all authenticated and legal pages.
 *
 * Includes:
 *   • Legal section: Privacy, Terms, Cookies, Refund, Data & Privacy
 *   • "Cookie settings" button to reopen consent banner
 *   • External links with rel="noopener noreferrer"
 */
export default function Footer({ onOpenCookieSettings }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 mt-16 print:mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🛡️</span>
              <span className="text-sm font-bold text-gradient">CodeSentinel</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed max-w-[28ch]">
              AI-powered code review &amp; DevOps co-pilot. Built with NVIDIA NIM, Gemini, and Groq.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
              Product
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/dashboard" className="text-xs text-white/50 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/pr-review" className="text-xs text-white/50 hover:text-white transition-colors">PR Review</Link></li>
              <li><Link to="/docs" className="text-xs text-white/50 hover:text-white transition-colors">Docs Generator</Link></li>
              <li><Link to="/bug-triage" className="text-xs text-white/50 hover:text-white transition-colors">Bug Triage</Link></li>
              <li><Link to="/test-scaffold" className="text-xs text-white/50 hover:text-white transition-colors">Test Scaffold</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
              Legal
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/privacy" className="text-xs text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-xs text-white/50 hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/cookies" className="text-xs text-white/50 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/refund" className="text-xs text-white/50 hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/data" className="text-xs text-white/50 hover:text-white transition-colors">Data &amp; Privacy</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
              Connect
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                   className="text-xs text-white/50 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
            </ul>

            {onOpenCookieSettings && (
              <button
                onClick={onOpenCookieSettings}
                className="mt-4 text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-accent transition-colors cursor-pointer"
              >
                🍪 Cookie settings
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/20">
            © {currentYear} CodeSentinel — AI Co-Pilot
          </span>
          <span className="text-[10px] text-white/20">
            Made in India 🇮🇳
          </span>
        </div>
      </div>
    </footer>
  );
}
