import { CalendarDays, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Navigate, useSearchParams } from 'react-router';
import { GoogleButton, OneTap } from '@/components/auth/SignIn';
import { LoginForm, SmokeyBackground } from '@/components/twentyfirst/LoginForm';
import { SummitMark } from '@/components/ui/Misc';
import { useAuth } from '@/context/AuthContext';
import { useEventList } from '@/hooks/useQueries';
import { categoryById } from '@/lib/constants';
import { dayOfMonth, formatPrice, monthOf } from '@/lib/format';

/** Only send people back to a page on this site (never `//evil.example`). */
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/login') ? value : '/');

/** "Now boarding": the next few real events, so the gate already feels like an event site. */
function ComingUp() {
  const { data } = useEventList({ when: 'upcoming', sort: 'date', limit: 3 });
  const events = data?.items ?? [];
  if (!events.length) return null;

  return (
    <div className="mt-10 max-w-md">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">Coming up on Summit</p>
      <ul className="mt-4 space-y-3">
        {events.map((event, i) => (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.06] p-3 backdrop-blur-md"
          >
            <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-white/10 py-1.5">
              <span className="font-display text-xl font-bold leading-none">{dayOfMonth(event.startDate)}</span>
              <span className="font-mono text-[10px] tracking-[0.18em] text-white/70">{monthOf(event.startDate)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{event.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/60">
                {event.mode === 'online' ? <CalendarDays className="size-3.5 shrink-0" /> : <MapPin className="size-3.5 shrink-0" />}
                {event.mode === 'online' ? 'Online' : event.venue?.city} · {categoryById(event.category).label}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-apricot">{formatPrice(event.price)}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function Login() {
  const { user, isLoading, passwordAuth, isSigningIn, googleEnabled } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  if (user) return <Navigate to={next} replace />;

  return (
    <main className="dark relative isolate min-h-svh overflow-hidden bg-[#152630] text-white">
      <title>Sign in · Summit</title>
      <SmokeyBackground color="#da6d58" baseColor="#13222b" backdropBlurAmount="sm" className="-z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#13222b]/80 via-[#13222b]/30 to-transparent" />

      <div className="container-x grid min-h-svh items-center gap-12 py-10 lg:grid-cols-[1fr_auto] lg:gap-20">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-apricot text-deep">
              <SummitMark className="size-10" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">summit</span>
          </div>
          <h1 className="mt-8 max-w-xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Your next great event starts at the door.
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/70">
            Sign in to browse hackathons, gigs, workshops and festivals, save the ones you love and book your seat in seconds.
          </p>
          <div className="hidden lg:block">
            <ComingUp />
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 28, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <LoginForm
            onSubmit={passwordAuth}
            busy={isSigningIn || isLoading}
            googleButton={
              googleEnabled ? (
                <GoogleButton label="Sign in with Google" className="h-12 rounded-xl border-transparent bg-white/90 text-[#213843] hover:bg-white" />
              ) : null
            }
          />
        </motion.div>
      </div>
      {googleEnabled && <OneTap />}
    </main>
  );
}
