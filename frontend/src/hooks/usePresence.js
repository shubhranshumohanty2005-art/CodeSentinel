import { useState, useEffect } from 'react';
import { setupPresence, subscribeToPresence } from '../firebase';
import { useAuth } from './useAuth';

export function usePresence(repoId) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!repoId || !user) return;

    // Set up presence for current user
    const cleanup = setupPresence(repoId, user.uid);

    // Subscribe to presence updates
    const unsubscribe = subscribeToPresence(repoId, (data) => {
      setOnlineUsers(data);
    });

    return () => {
      cleanup();
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [repoId, user]);

  return onlineUsers;
}
