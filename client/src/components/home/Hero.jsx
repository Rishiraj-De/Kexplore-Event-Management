import { ArrowRight, CalendarDays, MapPin, Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useEventList, useMeta } from '@/hooks/useQueries';
import { CATEGORIES } from '@/lib/constants';
import { compactNumber, formatShortDate } from '@/lib/format';
import { cn, imageAt } from '@/lib/utils';
import { MiniCountdown } from '../events/Countdown';
import { Button } from '../ui/Button';
import { Aurora, SplitText, TiltCard, WordRotate } from '../ui/Effects';
import { Avatar, Skeleton } from '../ui/Misc';

const ease = [0.16, 1, 0.3, 1];

function HeroSearch() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(q.trim() ? `/events?q=${encodeURIComponent(q.trim())}` : '/events');
      }}
      className="group flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-surface/80 p-1.5 pl-5 shadow-soft backdrop-blur-xl transition focus-within:border-fg/25 focus-within:ring-4 focus-within:ring-brand/20"
    >
      <Search className="size-5 shrink-0 text-muted transition group-focus-within:text-fg" aria-hidden />
      <label htmlFor="hero-search" className="sr-only">
        Search events
      </label>
      <input
        id="hero-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Hackathons, concerts, workshops…"
        className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted"
        autoComplete="off"
      />
      <Button type="submit" size="md" className="px-5">
        <span className="hidden sm:inline">Search</span> <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

/** Fanned stack of featured "tickets" that tilt in 3D on hover. */
function TicketStack() {
  const { data, isLoading } = useEventList({ featured: 'true', limit: 3 });
  const items = data?.items ?? [];
  const transforms = [
    'lg:-rotate-[9deg] lg:-translate-x-14 lg:translate-y-10',
    'lg:rotate-[2deg] lg:translate-x-2 lg:-translate-y-2 z-10',
    'lg:rotate-[11deg] lg:translate-x-16 lg:translate-y-16',
  ];

  if (isLoading) {
    return (
      <div className="relative mx-auto h-[420px] w-full max-w-sm">
        <Skeleton className="absolute inset-0 rounded-[28px]" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto grid h-[440px] w-full max-w-[340px] place-items-center [perspective:1200px]">
      {items.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 80, rotate: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5 + i * 0.12, ease }}
          className={cn('absolute w-full transition-transform duration-700 ease-out-expo hover:z-20', transforms[i], i !== 1 && 'hidden lg:block')}
        >
          <TiltCard max={10}>
            <Link to={`/events/${event.slug}`} className="block overflow-hidden rounded-[28px] border border-white/10 bg-[#101016] text-white shadow-2xl shadow-black/40">
              <div className="relative h-48 overflow-hidden">
                <img src={imageAt(event.coverImage, 700)} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-ink">
                  Featured
                </span>
              </div>
              <div className="ticket-notch bg-[#101016] px-5 pb-5 pt-2 [--notch-y:58%]">
                <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-white/70">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4" /> {formatShortDate(event.startDate)}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <MapPin className="size-4 shrink-0" /> {event.venue.city}
                  </p>
                </div>
                <div className="my-4 border-t border-dashed border-white/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Starts in</p>
                    <MiniCountdown target={event.startDate} className="text-sm font-semibold text-brand" />
                  </div>
                  <div className="flex h-8 items-end gap-[2px]" aria-hidden>
                    {Array.from({ length: 22 }, (_, k) => (
                      <span key={k} className="w-[2px] bg-white/80" style={{ height: `${40 + ((k * 37) % 60)}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}

export function Hero() {
  const { data: meta } = useMeta();
  const attendees = meta?.stats?.attendees ?? 16000;

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-28 sm:pt-36">
      <Aurora />
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <Link
            to="/events?when=week"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pl-1 pr-4 text-sm backdrop-blur transition hover:border-fg/20"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-fg px-2.5 py-1 text-xs font-semibold text-bg">
              <Sparkles className="size-3" /> New
            </span>
            <span className="text-muted transition group-hover:text-fg">{meta?.stats?.upcoming ?? 20}+ events this season</span>
            <ArrowRight className="size-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-fg" />
          </Link>
        </motion.div>

        <h1 className="mt-7 text-[clamp(2.6rem,11.2vw,8.25rem)] font-extrabold leading-[0.88] tracking-[-0.045em]">
          <SplitText text="Find your next" className="block" delay={0.1} />
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease }}
          >
            <WordRotate
              words={['big night out.', 'hackathon.', 'front row.', 'jam session.', 'obsession.']}
              className="text-gradient animate-gradient-pan pr-2"
            />
          </motion.span>
        </h1>

        <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1fr_400px]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease }} className="space-y-8">
            <p className="max-w-xl text-lg text-muted sm:text-xl">
              Hackathons, gigs, workshops and festivals — curated in one place. Register in under 30 seconds and walk in with a QR ticket on your phone.
            </p>
            <HeroSearch />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to={`/events?category=${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-fg/20"
                >
                  <c.icon className="size-3.5" style={{ color: c.color }} /> {c.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex -space-x-3">
                {['Ananya Mishra', 'Rohan Patnaik', 'Ishita Rao', 'Kabir Sen', 'Meera Iyer'].map((n) => (
                  <Avatar key={n} name={n} size={40} />
                ))}
              </div>
              <p className="text-sm text-muted">
                <span className="font-display text-lg font-bold text-fg">{compactNumber(attendees)}+</span> people already registered
              </p>
            </div>
          </motion.div>
          <TicketStack />
        </div>
      </div>
    </section>
  );
}
