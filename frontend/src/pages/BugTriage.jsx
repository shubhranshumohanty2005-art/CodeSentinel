import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import Loader, { ProgressBar } from '../components/shared/Loader';
import Badge from '../components/shared/Badge';
import EmptyState from '../components/shared/EmptyState';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { analyzeIssue, applyLabels } from '../api/client';
import { useJobStatus } from '../hooks/useJobStatus';
import { useRepos } from '../hooks/useRepos';

export default function BugTriage() {
  const { repos, loading: reposLoading, error: reposError } = useRepos();
  const [repo, setRepo] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [applying, setApplying] = useState(false);

  const repoId = repo.replace('/', '_');
  const jobStatus = useJobStatus(repoId, jobId);

  const handleAnalyze = async () => {
    if (!repo || !issueNumber) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await analyzeIssue(repo, parseInt(issueNumber));
      setReport(res.data.report);
      setJobId(res.data.job_id);
    } catch (e) {
      setError(e.message || 'Triage failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLabels = async () => {
    if (!report?.labels) return;
    setApplying(true);
    try {
      await applyLabels(repo, parseInt(issueNumber), report.labels);
      alert('Labels applied to GitHub issue!');
    } catch (e) {
      alert(e.message || 'Failed to apply labels');
    } finally {
      setApplying(false);
    }
  };

  const severityColors = {
    P0: 'critical',
    P1: 'critical',
    P2: 'warning',
    P3: 'info',
  };

  return (
    <PageShell title="🐛 Bug Triage" subtitle="Smart label, severity, and owner suggestions for GitHub issues">
      {/* Input */}
      <GlassCard className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
            <label className="text-xs text-white/40 mb-1 block">Issue Number</label>
            <input
              type="number"
              placeholder="#42"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              className="glass-input w-full"
            />
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !repo || !issueNumber}
          className="btn-accent mt-4 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Triage Issue'}
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

      {/* Results */}
      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Severity */}
            <GlassCard className="text-center">
              <h4 className="text-xs text-white/40 mb-2">Severity</h4>
              <div className="text-4xl font-bold mb-1">
                <Badge type={severityColors[report.severity] || 'info'}>
                  {report.severity}
                </Badge>
              </div>
            </GlassCard>

            {/* Likely Owner */}
            <GlassCard className="text-center">
              <h4 className="text-xs text-white/40 mb-2">Likely Owner</h4>
              <div 
                className="text-xl font-semibold text-accent truncate"
                title={report.likelyOwner || 'Unknown'}
              >
                {report.likelyOwner || 'Unknown'}
              </div>
            </GlassCard>

            {/* Labels */}
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs text-white/40">Suggested Labels</h4>
                <button
                  onClick={handleApplyLabels}
                  disabled={applying}
                  className="text-xs text-accent hover:text-accent-light disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply to GitHub'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.labels?.map((label) => (
                  <Badge key={label} type="info">{label}</Badge>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Reasoning */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-3">AI Reasoning</h3>
            <p className="text-sm text-white/60 leading-relaxed">{report.reasoning}</p>
            <p className="text-xs text-white/30 mt-4">AI Provider: {report.aiProvider}</p>
          </GlassCard>

          {/* Duplicates */}
          {report.potentialDuplicates?.length > 0 && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-3">Potential Duplicates</h3>
              <div className="space-y-2">
                {report.potentialDuplicates.map((dup) => (
                  <div key={dup.number} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-white/70">#{dup.number}: {dup.title}</span>
                    <span className="text-xs text-accent">{Math.round(dup.similarity * 100)}% match</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {loading && !report && (
        <GlassCard>
          <SkeletonLoader />
        </GlassCard>
      )}

      {!report && !loading && !error && (
        <EmptyState icon="🐛" title="Enter an issue to triage" message="Provide a repository and issue number for AI-powered triage." />
      )}
    </PageShell>
  );
}
