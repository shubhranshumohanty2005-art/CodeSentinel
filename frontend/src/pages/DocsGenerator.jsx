import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import Loader, { ProgressBar } from '../components/shared/Loader';
import EmptyState from '../components/shared/EmptyState';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { generateDocs, commitDocs } from '../api/client';
import { useJobStatus } from '../hooks/useJobStatus';
import { useRepos } from '../hooks/useRepos';

export default function DocsGenerator() {
  const { repos, loading: reposLoading, error: reposError } = useRepos();
  const [repo, setRepo] = useState('');
  const [mode, setMode] = useState('readme');
  const [baseRef, setBaseRef] = useState('');
  const [headRef, setHeadRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [committing, setCommitting] = useState(false);

  const repoId = repo.replace('/', '_');
  const jobStatus = useJobStatus(repoId, jobId);

  const handleGenerate = async () => {
    if (!repo) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateDocs(repo, mode, baseRef || undefined, headRef || undefined);
      setResult(res.data.result);
      setJobId(res.data.job_id);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!result) return;
    setCommitting(true);
    try {
      const filePath = mode === 'changelog' ? 'CHANGELOG.md' : 'README.md';
      await commitDocs(repo, filePath, result.content, `docs: update ${filePath}`);
      alert(`${filePath} committed to ${repo}!`);
    } catch (e) {
      alert(e.message || 'Failed to commit');
    } finally {
      setCommitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result?.content || '');
    alert('Copied to clipboard!');
  };

  return (
    <PageShell title="📝 Docs & Changelog" subtitle="Generate README sections and changelog entries from your repository">
      {/* Input form */}
      <GlassCard className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Repository</label>
            {reposLoading ? (
              <div className="glass-input w-full text-white/40 text-sm animate-pulse">Loading repos...</div>
            ) : reposError ? (
              <div className="glass-input w-full text-red-400 text-sm">Failed to load repos</div>
            ) : (
              <select
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="glass-input w-full"
              >
                <option value="">Select a repository...</option>
                {repos.map((r) => (
                  <option key={r.id} value={r.full_name}>{r.full_name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="glass-input w-full"
            >
              <option value="readme">README Generation</option>
              <option value="changelog">Changelog Generation</option>
            </select>
          </div>
        </div>

        {mode === 'changelog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Base Ref</label>
              <input
                type="text"
                placeholder="main~10 or v1.0.0"
                value={baseRef}
                onChange={(e) => setBaseRef(e.target.value)}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Head Ref</label>
              <input
                type="text"
                placeholder="main or HEAD"
                value={headRef}
                onChange={(e) => setHeadRef(e.target.value)}
                className="glass-input w-full"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !repo}
          className="btn-accent disabled:opacity-50"
        >
          {loading ? 'Generating...' : `Generate ${mode === 'changelog' ? 'Changelog' : 'README'}`}
        </button>
      </GlassCard>

      {/* Progress */}
      {jobStatus && jobStatus.status !== 'done' && (
        <GlassCard className="mb-6">
          <ProgressBar percent={jobStatus.percent || 0} status={jobStatus.status} message={jobStatus.message} />
        </GlassCard>
      )}

      {error && (
        <GlassCard className="mb-6 border-red-500/30">
          <p className="text-red-400">{error}</p>
        </GlassCard>
      )}

      {/* Result */}
      {result && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Generated {mode === 'changelog' ? 'Changelog' : 'README'}</h3>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="btn-ghost text-sm">📋 Copy</button>
              <button onClick={handleCommit} disabled={committing} className="btn-accent text-sm disabled:opacity-50">
                {committing ? 'Committing...' : '📤 Commit to Repo'}
              </button>
            </div>
          </div>
          <div className="p-4 bg-navy-800 rounded-xl border border-white/5 prose prose-invert prose-sm max-w-none overflow-auto max-h-[600px]">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
          <p className="text-xs text-white/30 mt-2">AI Provider: {result.aiProvider}</p>
        </GlassCard>
      )}

      {loading && !result && (
        <GlassCard>
          <SkeletonLoader />
        </GlassCard>
      )}

      {!result && !loading && !error && (
        <EmptyState icon="📝" title="Generate documentation" message="Enter a repository to auto-generate a README or changelog." />
      )}
    </PageShell>
  );
}
