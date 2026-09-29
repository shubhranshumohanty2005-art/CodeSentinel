import { useState, useEffect } from 'react';
import { listRepos, connectRepo, disconnectRepo } from '../api/client';

export function useRepos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRepos();
      setRepos(res.data.repos || []);
    } catch (e) {
      setError(e.message || 'Failed to load repos');
    } finally {
      setLoading(false);
    }
  };

  const connect = async (repoId, fullName) => {
    try {
      await connectRepo(repoId, fullName);
      setRepos(prev =>
        prev.map(r => r.id === repoId ? { ...r, connected: true } : r)
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const disconnect = async (repoId) => {
    try {
      await disconnectRepo(repoId);
      setRepos(prev =>
        prev.map(r => r.id === repoId ? { ...r, connected: false } : r)
      );
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return { repos, loading, error, fetchRepos, connect, disconnect };
}
