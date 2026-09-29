import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import Loader from '../components/shared/Loader';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { useRepos } from '../hooks/useRepos';

export default function ConnectRepo() {
  const { repos, loading, error, connect, disconnect } = useRepos();

  return (
    <PageShell title="Repositories" subtitle="Connect your GitHub repos to CodeSentinel">
      <div className="mb-6">
        <Link to="/dashboard" className="text-accent hover:underline text-sm font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
      {loading ? (
        <Loader text="Loading your repositories..." />
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Failed to load repos"
          message={error}
        />
      ) : repos.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No repositories found"
          message="Make sure your GitHub account has repositories."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <GlassCard key={repo.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{repo.full_name}</h3>
                  <p className="text-xs text-white/40 truncate mt-1">{repo.description || 'No description'}</p>
                </div>
                {repo.private && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-2">
                    Private
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
                {repo.language && (
                  <span className="text-xs text-white/30">{repo.language}</span>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => repo.connected ? disconnect(repo.id) : connect(repo.id, repo.full_name)}
                  className={repo.connected
                    ? 'text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition'
                    : 'text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition'
                  }
                >
                  {repo.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
