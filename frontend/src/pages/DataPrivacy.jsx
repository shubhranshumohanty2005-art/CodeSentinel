import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import { useAuth } from '../hooks/useAuth';
import LEGAL_CONFIG from '../content/legal/config';
import { downloadMyData, deleteMyAccount, disconnectGitHub } from '../api/client';

const C = LEGAL_CONFIG;

const DATA_ITEMS = [
  {
    category: 'Account Info',
    what: 'Name, email, avatar, UID',
    why: 'Authentication & profile display',
    where: 'Firebase Auth + Firestore',
    whoSees: 'You, CodeSentinel backend',
    retention: 'Until account deletion',
  },
  {
    category: 'GitHub Token',
    what: 'Encrypted OAuth access token',
    why: 'Accessing your repos, PRs, issues',
    where: 'Firestore (AES-encrypted)',
    whoSees: 'CodeSentinel backend only',
    retention: 'Until disconnection or deletion',
  },
  {
    category: 'Repository Metadata',
    what: 'Repo names, branch names, collaborator lists',
    why: 'Displaying connected repos, running tools',
    where: 'Firestore',
    whoSees: 'You, CodeSentinel backend',
    retention: `${C.reviewRetentionDays} days after disconnection`,
  },
  {
    category: 'Code Content',
    what: 'PR diffs, file snippets, issues, commits',
    why: 'Running the 5 AI tools',
    where: 'Sent to AI provider, results in Firestore',
    whoSees: 'CodeSentinel + 1 AI provider per request',
    retention: `${C.reviewRetentionDays} days`,
  },
  {
    category: 'Analysis Results',
    what: 'PR reviews, docs, triage, tests, health reports',
    why: 'Displaying results to you',
    where: 'Firestore',
    whoSees: 'You',
    retention: `${C.reviewRetentionDays} days`,
  },
  {
    category: 'Usage Logs',
    what: 'Timestamps, tool used, AI provider, errors',
    why: 'Service reliability & debugging',
    where: 'Server logs',
    whoSees: 'CodeSentinel operators',
    retention: `${C.logsRetentionDays} days`,
  },
];

const NEVER_COLLECTED = [
  'We do not store full repository contents permanently — only the snippets you submit for analysis.',
  'We do not sell your data to third parties.',
  'We do not use your code to train AI models.',
  'We do not track you across other websites.',
  'We do not use advertising or marketing cookies.',
];

export default function DataPrivacy() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null); // 'download' | 'delete' | 'disconnect'
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    document.title = 'Data & Privacy — CodeSentinel';
  }, []);

  const handleDownload = async () => {
    setLoading('download');
    setMessage(null);
    try {
      const res = await downloadMyData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codesentinel-data-${user?.uid || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Your data has been downloaded.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Download failed.' });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    setLoading('delete');
    setMessage(null);
    try {
      await deleteMyAccount();
      setMessage({ type: 'success', text: 'Your account and data have been scheduled for deletion.' });
      // Sign out after short delay
      setTimeout(() => window.location.href = '/', 3000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Deletion failed.' });
    } finally {
      setLoading(null);
      setConfirmDelete(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading('disconnect');
    setMessage(null);
    try {
      await disconnectGitHub();
      setMessage({ type: 'success', text: 'GitHub has been disconnected. Your token has been removed.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Disconnect failed.' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <PageShell title="🔒 Data & Privacy" subtitle="Understand and control your data">
      <Link to="/dashboard" className="text-accent hover:underline text-sm font-medium">
        &larr; Back to Dashboard
      </Link>

      {/* Toast message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* ── Data table ── */}
      <GlassCard className="mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-4">What We Collect</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/40 font-medium text-xs uppercase tracking-wider">Category</th>
                <th className="text-left py-2 px-3 text-white/40 font-medium text-xs uppercase tracking-wider">What</th>
                <th className="text-left py-2 px-3 text-white/40 font-medium text-xs uppercase tracking-wider">Why</th>
                <th className="text-left py-2 px-3 text-white/40 font-medium text-xs uppercase tracking-wider">Where Stored</th>
                <th className="text-left py-2 px-3 text-white/40 font-medium text-xs uppercase tracking-wider">Who Sees It</th>
                <th className="text-left py-2 px-3 text-white/40 font-medium text-xs uppercase tracking-wider">Retention</th>
              </tr>
            </thead>
            <tbody>
              {DATA_ITEMS.map((item, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3 px-3 text-accent font-medium">{item.category}</td>
                  <td className="py-3 px-3 text-white/70">{item.what}</td>
                  <td className="py-3 px-3 text-white/50">{item.why}</td>
                  <td className="py-3 px-3 text-white/50">{item.where}</td>
                  <td className="py-3 px-3 text-white/50">{item.whoSees}</td>
                  <td className="py-3 px-3 text-white/50">{item.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ── Data flow diagram ── */}
      <GlassCard className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Flow</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-lg">You</span>
          <span className="text-white/30">→</span>
          <span className="bg-white/5 border border-white/10 text-white/70 px-3 py-1.5 rounded-lg">CodeSentinel API</span>
          <span className="text-white/30">→</span>
          <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg">NVIDIA NIM</span>
          <span className="text-white/20 text-xs">or</span>
          <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg">Gemini</span>
          <span className="text-white/20 text-xs">or</span>
          <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-lg">Groq</span>
          <span className="text-white/30">→</span>
          <span className="bg-white/5 border border-white/10 text-white/70 px-3 py-1.5 rounded-lg">Results to You</span>
        </div>
        <p className="text-xs text-white/30 mt-3">
          Only one AI provider processes each request. The fallback chain is: NVIDIA NIM → Gemini → Groq.
        </p>
      </GlassCard>

      {/* ── What we never collect ── */}
      <GlassCard className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">What We Never Do</h3>
        <ul className="space-y-2">
          {NEVER_COLLECTED.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-green-400 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* ── Controls ── */}
      {user && (
        <GlassCard className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Controls</h3>
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              disabled={loading === 'download'}
              className="btn-ghost w-full sm:w-auto text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-50"
            >
              {loading === 'download' ? '⏳ Downloading...' : '📥 Download my data'}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={loading === 'disconnect'}
              className="btn-ghost w-full sm:w-auto text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-50"
            >
              {loading === 'disconnect' ? '⏳ Disconnecting...' : '🔌 Disconnect GitHub'}
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost w-full sm:w-auto text-sm py-2.5 px-5 flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                🗑️ Delete my account and data
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400 mb-3">
                  <strong>This is permanent.</strong> Your account, all connected repos, analysis results, and stored data will be deleted. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={loading === 'delete'}
                    className="bg-red-500/20 border border-red-500/40 text-red-400 text-sm py-2 px-4 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {loading === 'delete' ? 'Deleting...' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="btn-ghost text-sm py-2 px-4"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Links */}
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
        <Link to="/terms" className="text-accent hover:underline">Terms & Conditions</Link>
        <Link to="/cookies" className="text-accent hover:underline">Cookie Policy</Link>
      </div>
    </PageShell>
  );
}
