import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import KageScene from '../components/landing/KageScene';
import '../styles/kage.css';

/* ═══════════════════════════════════════════════════════════════════════════
   CodeSentinel Landing Page — Kage Design Language
   Dark ink tones · Vermilion/ember accents · Onest typography
   Scroll-reveal animations · Three.js temple scene · Grain overlay
   ═══════════════════════════════════════════════════════════════════════════ */


// ─── Scroll Reveal Observer ──────────────────────────────────────────────
function useScrollReveal() {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('rv-in');
            observerRef.current?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.kage-rv');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);
}

// ─── Nav Scroll Behavior ─────────────────────────────────────────────────
function useNavScroll() {
  useEffect(() => {
    const nav = document.querySelector('.kage-nav');
    if (!nav) return;

    let lastY = 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 120) {
          nav.classList.add('stuck');
        } else {
          nav.classList.remove('stuck');
        }
        if (y > lastY && y > 300) {
          nav.classList.add('hide');
        } else {
          nav.classList.remove('hide');
        }
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

// ─── Section Rail Tracker ────────────────────────────────────────────────
function useRailTracker() {
  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    const buttons = document.querySelectorAll('.kage-rail button');
    if (!sections.length || !buttons.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = entry.target.dataset.section;
            buttons.forEach((b) => b.classList.remove('on'));
            buttons[idx]?.classList.add('on');
          }
        }
      },
      { threshold: 0.3 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);
}

// ─── Feature Data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'review',
    icon: '⛩',
    title: 'PR Reviewer',
    sub: 'Code Analysis',
    desc: 'Line-level code review with bug detection, style checks, and risk scoring — powered by multi-provider AI.',
    meta: ['NVIDIA NIM', 'Live'],
  },
  {
    id: 'docs',
    icon: '📜',
    title: 'Docs & Changelog',
    sub: 'Auto-generate',
    desc: 'Generate README sections and Keep-a-Changelog entries directly from your commit history.',
    meta: ['Gemini', 'Auto'],
  },
  {
    id: 'triage',
    icon: '🔥',
    title: 'Bug Triage',
    sub: 'Smart Labels',
    desc: 'Severity analysis, owner suggestions, and duplicate detection for every issue filed.',
    meta: ['Groq', 'Fast'],
  },
];

const STEPS = [
  { num: '01', title: 'Connect GitHub', desc: 'Sign in with GitHub OAuth and connect your repositories in one click.', label: 'SETUP' },
  { num: '02', title: 'Choose Your Tool', desc: 'Select from PR Review, Docs Generator, Bug Triage, or Test Scaffolding.', label: 'SELECT' },
  { num: '03', title: 'AI Analyzes Code', desc: 'Multi-provider AI chain processes your request with automatic fallback reliability.', label: 'PROCESS' },
  { num: '04', title: 'Act on Results', desc: 'Post reviews, commit docs, apply labels, or create test files — directly to GitHub.', label: 'DEPLOY' },
];

const STATS = [
  { value: '3', label: 'AI Providers' },
  { value: '4', label: 'Core Tools' },
  { value: '<1s', label: 'Avg Latency' },
  { value: '99.9%', label: 'Uptime SLA' },
];

// ─── Main Component ──────────────────────────────────────────────────────
export default function Landing() {
  useScrollReveal();
  useNavScroll();
  useRailTracker();

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="kage-page">
      {/* ── Canvas ── */}
      <KageScene />

      {/* ── Grain ── */}
      <div className="kage-grain" />

      {/* ── Vignette ── */}
      <div className="kage-vignette" />

      {/* ── Navigation ── */}
      <nav className="kage-nav">
        <Link to="/" className="kage-brand">
          <svg className="kage-brand-icon" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="8" fill="#0a0e12" />
            <circle cx="17" cy="18" r="7" fill="#e0231c" opacity="0.9" />
            <rect x="5" y="9" width="24" height="2.4" rx="1.2" fill="#dfe7e0" />
            <rect x="8" y="14" width="18" height="1.8" rx="0.9" fill="#dfe7e0" opacity="0.6" />
          </svg>
          <div className="kage-brand-text">
            <b>CODESENTINEL</b>
            <i>AI CO-PILOT</i>
          </div>
        </Link>
        <ul className="kage-nav-links">
          <li><a className="kage-nav-link on" onClick={() => scrollTo('hero')}>Home</a></li>
          <li><a className="kage-nav-link" onClick={() => scrollTo('gate')}>About</a></li>
          <li><a className="kage-nav-link" onClick={() => scrollTo('pathways')}>Tools</a></li>
          <li><a className="kage-nav-link" onClick={() => scrollTo('craft')}>Workflow</a></li>
          <li><a className="kage-nav-link" onClick={() => scrollTo('eternity')}>Get Started</a></li>
        </ul>
      </nav>

      {/* ── Progress Rail ── */}
      <div className="kage-rail">
        <button className="on" onClick={() => scrollTo('hero')}><i /></button>
        <button onClick={() => scrollTo('gate')}><i /></button>
        <button onClick={() => scrollTo('pathways')}><i /></button>
        <button onClick={() => scrollTo('craft')}><i /></button>
        <button onClick={() => scrollTo('eternity')}><i /></button>
      </div>

      {/* ── Page Content ── */}
      <div className="kage-content">

        {/* ═══════ HERO ═══════ */}
        <section className="kage-hero" id="hero" data-section="0">
          <div className="kage-hero-top">
            <div className="kage-eyebrow kage-rv kage-rv-fade" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="kage-dot" />
              AI-POWERED CODE INTELLIGENCE
            </div>
            <h1 className="kage-display kage-h-hero kage-rv kage-rv-up" data-delay="1">
              Where Stillness<br />Reveals the Unseen
            </h1>
            <p className="kage-body-lg kage-hero-sub kage-rv kage-rv-up" data-delay="2">
              CodeSentinel watches your codebase so you don't have to. Review PRs,
              generate docs, triage bugs, and scaffold tests — all from one dashboard.
            </p>
            <Link to="/login" className="kage-arrowlink kage-rv kage-rv-up" data-delay="3">
              <span>Sign in with GitHub</span>
              <span className="kage-ar">
                <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M1 12L12 1M12 1H4M12 1v8" />
                </svg>
              </span>
            </Link>
          </div>

          <div className="kage-hero-spacer" />

          <div className="kage-hero-foot">
            <div className="kage-hero-cue kage-rv kage-rv-fade" data-delay="4">
              SCROLL TO EXPLORE
              <span className="kage-cue-track"><i /></span>
            </div>
            <div className="kage-chips kage-rv kage-rv-up" data-delay="4">
              {[
                { num: 'I', title: 'PR Review', desc: 'Line-level analysis' },
                { num: 'II', title: 'Docs Gen', desc: 'Auto documentation' },
                { num: 'III', title: 'Bug Triage', desc: 'Smart severity' },
                { num: 'IV', title: 'Test Scaffold', desc: 'Framework-aware' },
              ].map((chip) => (
                <div key={chip.num} className="kage-chip" onClick={() => scrollTo('pathways')}>
                  <span className="kage-num">{chip.num}</span>
                  <div className="kage-chip-tx">
                    <b>{chip.title}</b>
                    <p>{chip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CHAPTER I — THE GATE (About) ═══════ */}
        <section className="kage-sec" id="gate" data-section="1">
          <div className="kage-sec-head kage-rv kage-rv-fade">
            <span className="kage-k"><b>I</b> — THE GATE</span>
            <span className="kage-rule" />
          </div>

          <div className="kage-gate-grid">
            <h2 className="kage-display kage-h-sec kage-rv kage-rv-up">
              Intelligence<br />at the Gate
            </h2>
            <div className="kage-gate-copy kage-rv kage-rv-up" data-delay="1">
              <p className="kage-lead">
                Every pull request is a gate. CodeSentinel stands watch — catching bugs before
                they enter, scoring risk before you merge, and generating the documentation
                your team needs but never writes.
              </p>
              <p className="kage-body" style={{ marginTop: 20 }}>
                Built on a three-provider AI fallback chain — NVIDIA NIM, Google Gemini, and Groq —
                so your workflow never breaks, even when a single provider goes down. Every analysis
                is stored in Firestore with full provider attribution.
              </p>
              <Link to="/login" className="kage-arrowlink">
                <span>Start reviewing</span>
                <span className="kage-ar">
                  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M1 12L12 1M12 1H4M12 1v8" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          <div className="kage-stats kage-rv kage-rv-up" data-delay="2">
            {STATS.map((s) => (
              <div key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ CHAPTER II — PATHWAYS (Tools) ═══════ */}
        <section className="kage-sec" id="pathways" data-section="2">
          <div className="kage-sec-head kage-rv kage-rv-fade">
            <span className="kage-k"><b>II</b> — PATHWAYS</span>
            <span className="kage-rule" />
          </div>

          <div className="kage-cards">
            {FEATURES.map((feat, i) => (
              <div key={feat.id} className="kage-card kage-rv kage-rv-up" data-delay={String(i + 1)}>
                <div className="kage-card-fr">
                  <span className="kage-card-icon">{feat.icon}</span>
                  <div className="kage-card-glow" />
                  <div className="kage-card-lab">
                    <div>
                      <b>{feat.title}</b>
                      <div className="kage-card-sub">{feat.sub}</div>
                    </div>
                  </div>
                </div>
                <div className="kage-card-meta">
                  <span>{feat.meta[0]}</span>
                  <span>{feat.meta[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ CHAPTER III — SACRED CRAFT (Workflow) ═══════ */}
        <section className="kage-sec" id="craft" data-section="3">
          <div className="kage-sec-head kage-rv kage-rv-fade">
            <span className="kage-k"><b>III</b> — SACRED CRAFT</span>
            <span className="kage-rule" />
          </div>

          <div className="kage-cur-head kage-rv kage-rv-up">
            <h2 className="kage-display kage-h-sec">
              The Path<br />of Mastery
            </h2>
            <p className="kage-body-lg">
              Four steps. One command. From connecting your repository to shipping
              better code — every step is designed for flow.
            </p>
          </div>

          <div className="kage-cur">
            {STEPS.map((step, i) => (
              <div key={step.num} className="kage-les kage-rv kage-rv-fade" data-delay={String(i + 1)}>
                <span className="kage-step">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <span className="kage-t">{step.label}</span>
                <span className="kage-bar" />
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ CHAPTER IV — ETERNITY (CTA) ═══════ */}
        <section className="kage-fin" id="eternity" data-section="4">
          <div className="kage-eyebrow kage-rv kage-rv-fade">
            <span className="kage-dot" style={{ marginRight: 10 }} />
            JOIN THE WATCH
          </div>
          <h2 className="kage-display kage-rv kage-rv-up" data-delay="1">
            Ship Better<br />Code Today
          </h2>
          <p className="kage-body-lg kage-rv kage-rv-up" data-delay="2">
            Join developers who use CodeSentinel to review PRs, generate docs,
            triage bugs, and scaffold tests — all powered by AI with a
            three-provider fallback chain.
          </p>
          <Link to="/login" className="kage-cta kage-rv kage-rv-up" data-delay="3">
            <i />
            <span>Sign in with GitHub</span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1 12L12 1M12 1H4M12 1v8" />
            </svg>
          </Link>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="kage-foot kage-sec">
          <div className="kage-foot-grid kage-rv kage-rv-up">
            <div className="kage-foot-brand">
              <svg width="42" height="42" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="8" fill="#0a0e12" />
                <circle cx="17" cy="18" r="7" fill="#e0231c" opacity="0.9" />
                <rect x="5" y="9" width="24" height="2.4" rx="1.2" fill="#dfe7e0" />
                <rect x="8" y="14" width="18" height="1.8" rx="0.9" fill="#dfe7e0" opacity="0.6" />
              </svg>
              <p>
                AI co-pilot for software teams. Review PRs, generate docs,
                triage bugs, and scaffold tests — from one dashboard.
              </p>
            </div>
            <div>
              <h4>Tools</h4>
              <ul>
                <li><Link to="/pr-review">PR Review</Link></li>
                <li><Link to="/docs">Docs Generator</Link></li>
                <li><Link to="/bug-triage">Bug Triage</Link></li>
                <li><Link to="/test-scaffold">Test Scaffold</Link></li>
              </ul>
            </div>
            <div>
              <h4>Platform</h4>
              <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/connect-repo">Repositories</Link></li>
                <li><Link to="/settings">Settings</Link></li>
              </ul>
            </div>
            <div>
              <h4>Powered By</h4>
              <ul>
                <li><a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer">NVIDIA NIM</a></li>
                <li><a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">Google Gemini</a></li>
                <li><a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq</a></li>
                <li><a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase</a></li>
              </ul>
            </div>
          </div>
          <div className="kage-foot-base">
            <span>© 2024 CODESENTINEL</span>
            <span>AI · GITHUB · FIREBASE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
