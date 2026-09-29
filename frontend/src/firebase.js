import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_RTDB_URL,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('read:user');

export async function signInWithGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const githubToken = credential?.accessToken;
    const user = result.user;

    return {
      user,
      githubToken,
      firebaseToken: await user.getIdToken(),
    };
  } catch (error) {
    console.error('GitHub sign-in failed:', error);
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
}

export function getIdToken() {
  return auth.currentUser?.getIdToken();
}

// Realtime Database helpers
export function subscribeToJobStatus(repoId, jobId, callback) {
  const jobRef = ref(rtdb, `job_status/${repoId}/${jobId}`);
  return onValue(jobRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function setupPresence(repoId, uid) {
  const presenceRef = ref(rtdb, `presence/${repoId}/${uid}`);
  set(presenceRef, {
    online: true,
    lastActive: serverTimestamp(),
  });

  onDisconnect(presenceRef).remove();

  return () => {
    set(presenceRef, null);
  };
}

export function subscribeToPresence(repoId, callback) {
  const presenceRef = ref(rtdb, `presence/${repoId}`);
  return onValue(presenceRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}
