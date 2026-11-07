import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { EventonMark } from '../ui/Misc';

function Splash({ error, onRetry }) {
  return (
    <div className="grid min-h-svh place-items-center bg-bg px-6 text-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center">
        <motion.span
          className="grid size-14 place-items-center rounded-2xl bg-brand text-brand-ink"
          animate={error ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <EventonMark className="size-14" />
        </motion.span>
        {error ? (
          <>
            <p className="mt-6 font-semibold">We couldn’t reach Eventon</p>
            <p className="mt-1 max-w-xs text-sm text-muted">The server may still be waking up. Check your connection and try again.</p>
            <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
              <RefreshCw className="size-4" /> Try again
            </button>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted">Checking your pass…</p>
        )}
      </div>
    </div>
  );
}

/** The whole site is members-only: signed-out visitors are sent to /login and brought back afterwards. */
export function RequireAuth({ children }) {
  const { user, isLoading, isError, retry } = useAuth();
  const location = useLocation();

  if (isLoading) return <Splash />;
  if (isError && !user) return <Splash error onRetry={() => retry()} />;
  if (!user) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
}
