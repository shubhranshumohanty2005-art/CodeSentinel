import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import Loader, { ProgressBar } from '../components/shared/Loader';
import Badge from '../components/shared/Badge';
import RiskScoreGauge from '../components/shared/RiskScoreGauge';
import EmptyState from '../components/shared/EmptyState';
import { analyzePR, postPRToGithub } from '../api/client';
import { useJobStatus } from '../hooks/useJobStatus';
import { useRepos } from '../hooks/useRepos';

export default function PRReview() {
  const { repos, loading: reposLoading, error: reposError } = useRepos();
  const [repo, setRepo] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [posting, setPosting] = useState(false);

  const repoId = repo.replace('/', '_');
  const jobStatus = useJobStatus(repoId, jobId);

  const handleAnalyze = async () => {
    if (!repo || !prNumber) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await analyzePR(repo, parseInt(prNumber));
      setReport(res.data.report);
      setJobId(res.data.job_id);
    } catch (e) {
      setError(e.message || 'PR analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostToGithub = async () => {
    setPosting(true);
    try {
      await postPRToGithub(repo, parseInt(prNumber));
      alert('Review posted to GitHub successfully!');
    } catch (e) {
      alert(e.message || 'Failed to post review');
    } finally {
      setPosting(false);
    }
  };

  return (
    <PageShell title="🔍 PR Reviewer" subtitle="Analyze pull requests for bugs, style issues, and security vulnerabilities">
      {/* Input form */}
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
            <label className="text-xs text-white/40 mb-1 block">PR Number</label>
            <input
              type="number"
              placeholder="#123"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              className="glass-input w-full"
            />
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !repo || !prNumber}
          className="btn-accent mt-4 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze PR'}
        </button>
      </GlassCard>

      {/* Progress bar */}
      {jobStatus && jobStatus.status !== 'done' && (
        <GlassCard className="mb-6">
          <ProgressBar
            percent={jobStatus.percent || 0}
            status={jobStatus.status}
            message={jobStatus.message}
          />
        </GlassCard>
      )}

      {/* Error */}
      {error && (
        <GlassCard className="mb-6 border-red-500/30">
          <p className="text-red-400">{error}</p>
        </GlassCard>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="flex justify-center">
              <RiskScoreGauge score={report.riskScore || 0} />
            </GlassCard>
            <GlassCard className="md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
              <p className="text-sm text-white/60 leading-relaxed">{report.summary}</p>
              <div className="flex gap-2 mt-4">
                <span className="text-xs text-white/30">
                  {report.filesAnalyzed} files analyzed • {report.comments?.length || 0} issues found
                  • AI: {report.aiProvider}
                </span>
              </div>
            </GlassCard>
          </div>

          {/* Comments */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Review Comments</h3>
              <button
                onClick={handlePostToGithub}
                disabled={posting}
                className="btn-ghost text-sm disabled:opacity-50"
              >
                {posting ? 'Posting...' : '📤 Post to GitHub'}
              </button>
            </div>
            {report.comments?.length === 0 ? (
              <EmptyState icon="✅" title="No issues found" message="This PR looks clean!" />
            ) : (
              <div className="space-y-3">
                {report.comments?.map((comment, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge type={comment.severity}>{comment.severity}</Badge>
                      <span className="text-xs font-mono text-white/40">{comment.file}</span>
                      {comment.line > 0 && (
                        <span className="text-xs text-white/30">line {comment.line}</span>
                      )}
                    </div>
                    <p className="text-sm text-white/70">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {!report && !loading && !error && (
        <EmptyState
          icon="🔍"
          title="Enter a PR to review"
          message="Provide a repository and PR number to start an AI-powered code review."
        />
      )}
    </PageShell>
  );
}
