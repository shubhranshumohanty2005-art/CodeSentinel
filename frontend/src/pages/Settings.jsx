import PageShell from '../components/layout/PageShell';
import GlassCard from '../components/layout/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();

  return (
    <PageShell title="⚙️ Settings" subtitle="Manage your CodeSentinel preferences">
      <div className="mb-6">
        <Link to="/dashboard" className="text-accent hover:underline text-sm font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
      <GlassCard className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'U'}&background=0B0E1A&color=00D4FF`}
            alt="avatar"
            className="w-16 h-16 rounded-full border-2 border-white/10"
          />
          <div>
            <p className="text-white font-medium">{user?.displayName || 'User'}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
            <p className="text-xs text-white/20 mt-1">UID: {user?.uid}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Provider Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-white/70">NVIDIA NIM</span>
            </div>
            <span className="text-xs text-white/30">Primary</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-white/70">Google Gemini</span>
            </div>
            <span className="text-xs text-white/30">Fallback #1</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-white/70">Groq</span>
            </div>
            <span className="text-xs text-white/30">Fallback #2</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">About</h3>
        <p className="text-sm text-white/50">
          CodeSentinel v1.0.0 — Powered by NVIDIA NIM, Google Gemini, and Groq.
        </p>
      </GlassCard>
    </PageShell>
  );
}
