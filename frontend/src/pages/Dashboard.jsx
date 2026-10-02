import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { useRepos } from '../hooks/useRepos';
import { runHealthAgent } from '../api/client';

const tools = [
  { to: '/pr-review', icon: '🔍', title: 'PR Reviewer', description: 'Analyze pull requests for bugs, style, and security issues', color: '#00D4FF' },
  { to: '/docs', icon: '📝', title: 'Docs & Changelog', description: 'Generate README sections and changelog entries', color: '#8B5CF6' },
  { to: '/bug-triage', icon: '🐛', title: 'Bug Triage', description: 'Smart issue labeling, severity, and owner suggestion', color: '#F59E0B' },
  { to: '/test-scaffold', icon: '🧪', title: 'Test Generator', description: 'Scaffold unit tests in your existing framework', color: '#10B981' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthReport, setHealthReport] = useState(null);

  const { repos, loading: reposLoading, error: reposError } = useRepos();
  // Show all repos, connected ones first
  const sortedRepos = [...repos].sort((a, b) => (b.connected ? 1 : 0) - (a.connected ? 1 : 0));
  const [selectedRepo, setSelectedRepo] = useState('');

  const handleRunHealth = async () => {
    if (!selectedRepo) return;
    setHealthLoading(true);
    try {
      const res = await runHealthAgent(selectedRepo);
      setHealthReport(res.data.report);
    } catch (e) {
      alert(e.message || 'Health agent failed');
    } finally {
      setHealthLoading(false);
    }
  };

  const renderRepoControls = () => {
    if (reposLoading) {
      return <span className="text-xs text-white/40 animate-pulse">Loading repos...</span>;
    }
    if (reposError) {
      return <span className="text-xs text-red-400">Failed to load repos — is the backend running?</span>;
    }
    if (sortedRepos.length === 0) {
      return (
        <Link to="/connect-repo" className="text-xs text-accent hover:underline">
          No repos found — connect one →
        </Link>
      );
    }
    return (
      <>
        <select 
          value={selectedRepo} 
          onChange={e => setSelectedRepo(e.target.value)}
          className="glass-input text-sm py-1.5 px-3"
        >
          <option value="">Select a repo...</option>
          {sortedRepos.map(r => (
            <option key={r.id} value={r.full_name}>{r.full_name}</option>
          ))}
        </select>
        <button
          onClick={handleRunHealth}
          disabled={healthLoading || !selectedRepo}
          className="btn-accent text-sm py-1.5 px-4 disabled:opacity-50"
        >
          {healthLoading ? 'Running...' : 'Run Health Check'}
        </button>
      </>
    );
  };

  return (
    <PageShell
      title={user?.displayName ? `Welcome back, ${user.displayName}` : 'Welcome back'}
      subtitle="Your AI-powered code review dashboard"
    >
      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={tool.to}>
              <GlassCard hover className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30` }}
                >
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{tool.title}</h3>
                  <p className="text-sm text-white/50">{tool.description}</p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Repo Health Agent card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                🤖 Repo Health Agent
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Autonomous agent that reviews all open PRs and triages all issues
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {renderRepoControls()}
            </div>
          </div>

          {healthReport && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{healthReport.openPRCount}</div>
                  <div className="text-xs text-white/40">Open PRs Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{healthReport.openIssueCount}</div>
                  <div className="text-xs text-white/40">Open Issues</div>
                </div>
              </div>
              <div className="text-sm text-white/70 whitespace-pre-wrap">
                {healthReport.healthSummary}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Quick links */}
      <div className="flex gap-4">
        <Link to="/connect-repo" className="btn-ghost text-sm">
          📁 Manage Repositories
        </Link>
        <Link to="/settings" className="btn-ghost text-sm">
          ⚙️ Settings
        </Link>
      </div>
    </PageShell>
  );
}
