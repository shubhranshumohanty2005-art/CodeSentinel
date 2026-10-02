import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

/**
 * LegalLayout — reusable chrome for all legal/policy pages.
 *
 * Props:
 *   title        – page heading
 *   lastUpdated  – ISO date string shown under the title
 *   sections     – array of { id, title, body } objects
 *
 * Features:
 *   • Table of contents with anchor links
 *   • Smooth-scroll to section on click
 *   • Print-friendly styling (see index.css @media print block)
 *   • SEO: sets document.title
 */
export default function LegalLayout({ title, lastUpdated, sections = [] }) {
  useEffect(() => {
    document.title = `${title} — CodeSentinel`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto legal-page"
    >
      {/* Back link */}
      <Link to="/" className="text-accent hover:underline text-sm font-medium">
        &larr; Back to home
      </Link>

      {/* Header */}
      <div className="mt-6 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
        {lastUpdated && (
          <p className="mt-2 text-sm text-white/40">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Table of contents */}
      {sections.length > 1 && (
        <nav className="glass-card p-5 mb-10" aria-label="Table of contents">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
            Contents
          </h2>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-accent/80 hover:text-accent transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="text-xl font-semibold text-white mb-4">{s.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none text-white/70
                            prose-headings:text-white prose-strong:text-white/90
                            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                            prose-table:text-sm prose-th:text-white/60 prose-th:font-medium
                            prose-th:border-white/10 prose-td:border-white/10
                            prose-blockquote:border-accent/40 prose-blockquote:text-white/60
                            prose-li:marker:text-accent/50">
              <ReactMarkdown>{s.body}</ReactMarkdown>
            </div>
          </section>
        ))}
      </div>

      {/* Print hint */}
      <p className="mt-12 text-xs text-white/20 print:hidden">
        You can print this page for your records using Ctrl+P / ⌘+P.
      </p>
    </motion.div>
  );
}
