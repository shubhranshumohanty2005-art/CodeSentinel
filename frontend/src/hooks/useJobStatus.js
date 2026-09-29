import { useState, useEffect } from 'react';
import { subscribeToJobStatus } from '../firebase';

export function useJobStatus(repoId, jobId) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!repoId || !jobId) return;

    const unsubscribe = subscribeToJobStatus(repoId, jobId, (data) => {
      setStatus(data);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [repoId, jobId]);

  return status;
}
