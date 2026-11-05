import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, QrCode, Search, Sparkles, Star, Ticket } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useEventList, useMeta } from '@/hooks/useQueries';
import { CATEGORIES } from '@/lib/constants';
import { formatDateRange, formatPrice, monthOf } from '@/lib/format';
import { cn, imageAt } from '@/lib/utils';
import { Countdown } from '../events/Countdown';
import { EventCard, EventCardSkeleton } from '../events/EventCard';
import { Badge, CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CountUp, Marquee, Reveal, SpotlightCard } from '../ui/Effects';
import { Avatar, SectionHeading, Skeleton } from '../ui/Misc';

// ── Kinetic category band ─────────────────────────────────────────────────────
const BAND_WORDS = ['Hackathons', 'Concerts', 'Workshops', 'Esports', 'Festivals', 'Summits', 'Marathons', 'Comedy', 'Food fests'];

function BandRow({ dark = false }) {
  return (
    <Marquee duration={36} reverse={dark} pauseOnHover={false} gap="2.5rem" className="[mask-image:none]">
      {BAND_WORDS.map((w) => (
        <span key={w} className="flex items-center gap-10 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">
          {w}
          <span className={cn('text-3xl sm:text-5xl', dark ? 'text-brand' : 'text-violet')}>✳</span>
        </span>
      ))}
    </Marquee>
  );
}

export function MarqueeBand() {
  return (
    <section aria-label="Event types" className="relative my-10 overflow-hidden py-16">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[2.5deg] bg-fg py-4 text-bg">
        <BandRow dark />
      </div>
      <div className="relative -rotate-[2deg] bg-brand py-4 text-brand-ink shadow-2xl">
        <BandRow />
      </div>
    </section>
  );
}

// ── Featured bento grid ───────────────────────────────────────────────────────
function BentoCard({ event, big = false, className }) {
  return (
    <SpotlightCard className={cn('rounded-[28px] bg-black text-white', className)} spotlight="rgb(255 255 255 / 0.12)">
      <Link to={`/events/${event.slug}`} className="absolute inset-0 z-20" aria-label={event.title} />
      <img
        src={imageAt(event.coverImage, big ? 1400 : 800)}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-[1.4s] ease-out-expo group-hover/spot:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between">
          <CategoryBadge category={event.category} glass className="text-white" />
          <span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur transition-all duration-500 group-hover/spot:rotate-45 group-hover/spot:bg-brand group-hover/spot:text-brand-ink">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70">{formatDateRange(event.startDate, event.endDate)}</p>
          <h3 className={cn('font-bold leading-[0.95] tracking-tight', big ? 'text-4xl sm:text-6xl' : 'text-2xl')}>{event.title}</h3>
          {big && <p className="mt-3 max-w-lg text-white/75">{event.tagline}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {event.venue.city}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold backdrop-blur">{formatPrice(event.price)}</span>
          </div>
          {big && <Countdown target={event.startDate} onDark className="mt-6 max-w-md" />}
        </div>
      </div>
    </SpotlightCard>
  );
}

export function FeaturedBento() {
  const { data, isLoading } = useEventList({ featured: 'true', limit: 5 });
  const items = data?.items ?? [];

  return (
    <section className="container-x py-20" aria-labelledby="featured-title">
      <Reveal>
        <SectionHeading
          eyebrow="Featured this season"
          title={<span id="featured-title">The ones everyone’s talking about</span>}
          description="Hand-picked events with the biggest line-ups, the best prizes and the fastest-selling seats."
          action={
            <Button to="/events" variant="outline">
              All events <ArrowRight className="size-4" />
            </Button>
          }
        />
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:h-[680px] lg:grid-cols-4 lg:grid-rows-2">
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className={cn('min-h-64 rounded-[28px]', i === 0 && 'md:col-span-2 lg:row-span-2 min-h-[420px]')} />
            ))
          : items.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.08} className={cn('min-h-72', i === 0 && 'md:col-span-2 lg:row-span-2 min-h-[460px]')}>
                <BentoCard event={event} big={i === 0} className="h-full" />
              </Reveal>
            ))}
      </div>
    </section>
  );
}

// ── Browse by category ────────────────────────────────────────────────────────
export function CategoryGrid() {
  const { data: meta } = useMeta();
  const counts = Object.fromEntries((meta?.categories ?? []).map((c) => [c.name, c.count]));

  return (
    <section className="container-x py-20" aria-labelledby="cats-title">
      <Reveal>
        <SectionHeading eyebrow="Browse by vibe" title={<span id="cats-title">Pick a scene, any scene</span>} align="center" />
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.06}>
            <Link
              to={`/events?category=${c.id}`}
              className="group relative flex h-full min-h-36 flex-col justify-between overflow-hidden rounded-[24px] border border-line bg-surface p-5 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-soft sm:min-h-44 sm:p-6"
              style={{ '--c': c.color }}
            >
              <span
                aria-hidden
                className="absolute -right-10 -top-10 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
                style={{ background: c.color }}
              />
              <div className="relative flex items-start justify-between">
                <span
                  className="grid size-12 place-items-center rounded-2xl transition-transform duration-500 ease-out-expo group-hover:-rotate-12 group-hover:scale-110"
                  style={{ background: `color-mix(in oklab, ${c.color} 18%, transparent)`, color: c.color }}
                >
                  <c.icon className="size-6" />
                </span>
                <span className="font-mono text-xs text-muted">{String(counts[c.id] ?? 0).padStart(2, '0')} events</span>
              </div>
              <div className="relative mt-6">
                <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                  {c.label}
                  <ArrowRight className="size-5 -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-1 hidden text-sm text-muted sm:block">{c.blurb}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Upcoming, grouped by month ───────────────────────────────────────────────
export function UpcomingSection() {
  const { data, isLoading } = useEventList({ when: 'upcoming', limit: 30 });
  const [month, setMonth] = useState('ALL');
  const events = useMemo(() => data?.items ?? [], [data]);
  const months = useMemo(() => [...new Set(events.map((e) => monthOf(e.startDate)))], [events]);
  const visible = (month === 'ALL' ? events : events.filter((e) => monthOf(e.startDate) === month)).slice(0, 6);

  return (
    <section className="container-x py-20" aria-labelledby="upcoming-title">
      <Reveal>
        <SectionHeading
          eyebrow="On the calendar"
          title={<span id="upcoming-title">Coming up next</span>}
          description="Every upcoming event, sorted by date. Seats update live."
        />
      </Reveal>

      <div role="tablist" aria-label="Filter by month" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-1">
        {['ALL', ...months].map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={month === m}
            onClick={() => setMonth(m)}
            className="relative shrink-0 rounded-full border border-line px-5 py-2 font-mono text-xs font-semibold tracking-[0.15em]"
          >
            {month === m && <motion.span layoutId="month-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className={cn('relative', month === m ? 'text-bg' : 'text-muted')}>{m === 'ALL' ? 'ALL' : m}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)
        ) : (
          <AnimatePresence mode="popLayout">
            {visible.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
      <div className="mt-12 flex justify-center">
        <Button to="/events" size="lg" variant="dark">
          Explore all events <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
const steps = [
  { icon: Search, title: 'Discover', text: 'Search, filter by category or date, and save the ones you love.' },
  { icon: Ticket, title: 'Register in 30s', text: 'Name, email, phone — validated as you type. No account needed.' },
  { icon: QrCode, title: 'Show your QR', text: 'Your ticket lives on your device. Scan in, add to calendar, done.' },
];

export function HowItWorks() {
  return (
    <section className="container-x py-20" aria-labelledby="how-title">
      <div className="relative overflow-hidden rounded-[36px] border border-line bg-surface p-6 sm:p-12">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50 mask-radial" />
        <Reveal className="relative">
          <SectionHeading eyebrow="How it works" title={<span id="how-title">From “ooh” to “I’m in” in three steps</span>} />
        </Reveal>
        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div aria-hidden className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-line md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.title} as="li" delay={i * 0.12} className="relative">
              <div className="relative z-10 mb-6 flex items-center gap-4">
                <span className="grid size-16 place-items-center rounded-2xl bg-fg text-bg shadow-soft">
                  <s.icon className="size-7" />
                </span>
                <span className="font-mono text-sm text-muted">0{i + 1}</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ── Stats + testimonials ─────────────────────────────────────────────────────
const testimonials = [
  { name: 'Ananya Mishra', role: 'CSE, 3rd year', text: 'Registered for HackKalinga in literally 20 seconds. The QR ticket on my phone got me straight through the gate.' },
  { name: 'Rohan Patnaik', role: 'Event organiser', text: 'Hosting on Kexplore was painless. I could see who registered in real time and the page looked better than our own website.' },
  { name: 'Ishita Rao', role: 'Design student', text: 'The dark mode is gorgeous and the countdowns make me way too excited for every event I save.' },
  { name: 'Kabir Sen', role: 'Photographer', text: 'Found the Old Town photo walk through the search bar. Now I check the “this week” filter every Monday.' },
  { name: 'Meera Iyer', role: 'Product manager', text: 'Add-to-calendar plus reminders means I actually show up to the things I sign up for. Revolutionary.' },
  { name: 'Arjun Mehta', role: 'Esports captain', text: 'Our whole team registered for Pixel Clash from the same page — no forms lost in WhatsApp groups.' },
];

function Quote({ t }) {
  return (
    <figure className="w-[340px] shrink-0 rounded-[24px] border border-line bg-surface p-6">
      <div className="flex gap-0.5 text-amber" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 text-[0.95rem] leading-relaxed">“{t.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar name={t.name} size={36} />
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function SocialProof() {
  const { data: meta } = useMeta();
  const stats = meta?.stats;
  const items = [
    { value: stats?.events ?? 24, suffix: '', label: 'events listed' },
    { value: stats?.attendees ?? 16000, suffix: '+', label: 'registrations' },
    { value: stats?.cities ?? 5, suffix: '', label: 'cities' },
    { value: 4.9, suffix: '★', label: 'average rating', decimals: true },
  ];
  return (
    <section className="py-20" aria-label="Kexplore in numbers">
      <div className="container-x grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-line bg-line lg:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="bg-bg p-6 sm:p-8">
            <p className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
              <CountUp value={s.value} format={(n) => (s.decimals ? n.toFixed(1) : Math.round(n).toLocaleString('en-IN'))} />
              <span className="text-accent">{s.suffix}</span>
            </p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-14 space-y-4">
        <Marquee duration={55} gap="1rem">
          {testimonials.slice(0, 3).map((t) => (
            <Quote key={t.name} t={t} />
          ))}
          {testimonials.slice(3).map((t) => (
            <Quote key={`${t.name}-b`} t={t} />
          ))}
        </Marquee>
        <Marquee duration={60} gap="1rem" reverse>
          {[...testimonials].reverse().map((t) => (
            <Quote key={t.name} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

// ── Host CTA ──────────────────────────────────────────────────────────────────
export function HostCta() {
  const { user, openSignIn } = useAuth();
  return (
    <section className="container-x py-10" aria-labelledby="cta-title">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[40px] bg-[#0b0b10] px-6 py-16 text-white sm:px-14 sm:py-24">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute -left-20 -top-32 size-[520px] rounded-full bg-violet/50 blur-[120px] animate-aurora" />
            <div className="absolute -bottom-40 right-0 size-[520px] rounded-full bg-brand/30 blur-[120px] animate-aurora [animation-delay:-8s]" />
            <div className="absolute inset-0 bg-grid opacity-[0.15] mask-radial [--fg:#fff]" />
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <Badge tone="glass" className="border-white/15 text-white">
                <Sparkles className="size-3.5 text-brand" /> For organisers
              </Badge>
              <h2 id="cta-title" className="mt-5 text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl">
                Got an event? <span className="text-brand">Fill the room.</span>
              </h2>
              <p className="mt-5 max-w-lg text-lg text-white/70">
                Publish in two minutes, share one link, and watch registrations roll in — with live seat tracking and an attendee list.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {user ? (
                  <Button to="/host" size="lg">
                    Open host dashboard <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => openSignIn('Sign in with Google to publish your own events.')}>
                    Start hosting — it’s free <ArrowRight className="size-4" />
                  </Button>
                )}
                <Button to="/events" size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Browse events
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block" aria-hidden>
              <div className="rotate-3 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Registrations</span>
                  <span className="font-mono text-brand">+128 today</span>
                </div>
                <div className="mt-5 flex h-36 items-end gap-2">
                  {[35, 52, 44, 68, 59, 80, 74, 92, 86, 100].map((h, i) => (
                    <motion.span
                      key={i}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-violet to-brand"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <CalendarDays className="size-5 text-brand" />
                  <div className="text-sm">
                    <p className="font-semibold">Your Event · 412 / 600 seats</p>
                    <p className="text-white/50">Sells out in ~3 days at this rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
