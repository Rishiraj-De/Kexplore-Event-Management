import { ArrowLeft, ArrowRight, Building2, CalendarDays, ChevronDown, Clock, ExternalLink, Globe, MapPin, Navigation, Ticket, Users } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Countdown } from '@/components/events/Countdown';
import { EventCard } from '@/components/events/EventCard';
import { AddToCalendar, BookmarkButton, SeatsMeter, ShareButton } from '@/components/events/EventBits';
import { Badge, CategoryBadge, LiveDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Effects';
import { Avatar, EmptyState, Skeleton } from '@/components/ui/Misc';
import { useEvent } from '@/hooks/useQueries';
import { useLocalRegistrations } from '@/hooks/useStores';
import { eventPhase, formatLongDate, formatNumber, formatPrice, formatTimeRange, fromNow, seatsLeft } from '@/lib/format';
import { pushRecent } from '@/lib/storage';
import { cn, imageAt } from '@/lib/utils';
import NotFound from './NotFound';

/** Render "**bold**" segments and paragraphs from the plain-text description. */
function RichText({ text }) {
  return text.split(/\n{2,}/).map((para, i) => (
    <p key={i}>
      {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
        chunk.startsWith('**') ? (
          <strong key={j} className="font-semibold text-fg">
            {chunk.slice(2, -2)}
          </strong>
        ) : (
          chunk
        ),
      )}
    </p>
  ));
}

function Faq({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold">
        {item.q}
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 transition-transform duration-300', open && 'rotate-180 bg-fg text-bg')}>
          <ChevronDown className="size-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <p className="pb-5 text-muted">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fact({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex gap-4 rounded-[22px] border border-line bg-surface p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2">
        <Icon className="size-5 text-accent" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
        <p className="mt-1 font-semibold leading-snug">{value}</p>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function RegisterCta({ event, registration, className, compact = false }) {
  const phase = eventPhase(event);
  const soldOut = seatsLeft(event) === 0;
  if (registration) {
    return (
      <Button to={`/tickets/${registration.ticketCode}`} variant="dark" size={compact ? 'md' : 'lg'} className={className}>
        <Ticket className="size-4" /> You’re going · View ticket
      </Button>
    );
  }
  if (phase === 'past') return <Button disabled variant="outline" size={compact ? 'md' : 'lg'} className={className}>Event has ended</Button>;
  if (soldOut) return <Button disabled variant="outline" size={compact ? 'md' : 'lg'} className={className}>Sold out</Button>;
  return (
    <Button to={`/register?event=${event.slug}`} size={compact ? 'md' : 'lg'} className={cn('group', className)}>
      Register now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}

function DetailSkeleton() {
  return (
    <div className="pt-24">
      <Skeleton className="mx-3 h-[60vh] rounded-[36px]" />
      <div className="container-x mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useEvent(slug);
  const registrations = useLocalRegistrations();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);

  const event = data?.event;
  useEffect(() => {
    if (event) pushRecent(event);
  }, [event]);

  if (isLoading) return <DetailSkeleton />;
  if (isError && error?.status === 404) return <NotFound title="This event doesn’t exist" />;
  if (isError) return <div className="container-x pt-40"><EmptyState title="Couldn’t load this event" description={error.message} action={<Button to="/events">Back to events</Button>} /></div>;

  const phase = eventPhase(event);
  const registration = registrations.find((r) => r.eventId === event.id && r.status === 'confirmed');
  const hasMap = event.mode !== 'online' && event.venue?.lat;
  const d = 0.008;
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${event.venue.lng - d}%2C${event.venue.lat - d / 1.6}%2C${event.venue.lng + d}%2C${event.venue.lat + d / 1.6}&layer=mapnik&marker=${event.venue.lat}%2C${event.venue.lng}`
    : null;
  const directions = hasMap ? `https://www.google.com/maps/dir/?api=1&destination=${event.venue.lat},${event.venue.lng}` : null;

  return (
    <>
      <title>{`${event.title} · Kexplore`}</title>
      <meta name="description" content={event.shortDescription} />

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="relative isolate flex min-h-[82svh] items-end overflow-hidden rounded-[32px] bg-night text-white sm:rounded-[40px]">
          <motion.img src={imageAt(event.coverImage, 2000)} alt="" style={{ y: imgY, scale: imgScale }} className="absolute inset-0 -z-10 size-full object-cover opacity-80" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/45 to-night/30" />
          <div className="container-x pb-10 pt-32 sm:pb-14">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              <Link to="/events" className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
                <ArrowLeft className="size-4" /> All events
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={event.category} glass className="text-white" />
                {phase === 'live' && (
                  <Badge tone="live">
                    <LiveDot /> Happening now
                  </Badge>
                )}
                {phase === 'past' && <Badge tone="glass" className="text-white">Ended</Badge>}
                {event.featured && <Badge tone="brand">★ Featured</Badge>}
                {phase === 'upcoming' && <Badge tone="glass" className="text-white">Starts {fromNow(event.startDate)}</Badge>}
              </div>
              <h1 className="mt-5 max-w-5xl text-5xl font-extrabold leading-[0.9] tracking-[-0.04em] sm:text-7xl lg:text-8xl">{event.title}</h1>
              {event.tagline && <p className="mt-5 max-w-2xl text-lg text-white/75 sm:text-xl">{event.tagline}</p>}
              <div className="mt-8 flex flex-wrap items-center gap-2 [&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:text-white [&_button]:backdrop-blur [&_button:hover]:bg-white/20">
                <BookmarkButton event={event} />
                <ShareButton event={event} />
                {phase !== 'past' && <AddToCalendar event={event} ticketCode={registration?.ticketCode} />}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container-x mt-12 grid gap-12 pb-28 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-16">
          <Reveal className="grid gap-3 sm:grid-cols-2">
            <Fact icon={CalendarDays} label="Date" value={formatLongDate(event.startDate)} sub={phase === 'upcoming' ? fromNow(event.startDate) : undefined} />
            <Fact icon={Clock} label="Time" value={formatTimeRange(event.startDate, event.endDate)} />
            <Fact
              icon={event.mode === 'online' ? Globe : MapPin}
              label={event.mode === 'online' ? 'Online' : event.mode === 'hybrid' ? 'Venue · also streamed' : 'Venue'}
              value={event.venue.name}
              sub={[event.venue.address, event.venue.city].filter(Boolean).join(', ')}
            />
            <Fact icon={Building2} label="Organised by" value={event.organizer.name} sub={`${formatNumber(event.registeredCount)} registered`} />
          </Reveal>

          <Reveal as="section" aria-labelledby="about">
            <h2 id="about" className="text-3xl font-bold tracking-tight sm:text-4xl">About this event</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-fg/80">
              <RichText text={event.description} />
            </div>
            {event.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((t) => (
                  <Link key={t} to={`/events?q=${encodeURIComponent(t)}&when=all`} className="rounded-full border border-line px-3 py-1 text-sm text-muted transition hover:border-fg/30 hover:text-fg">
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </Reveal>

          {event.agenda?.length > 0 && (
            <Reveal as="section" aria-labelledby="agenda">
              <h2 id="agenda" className="text-3xl font-bold tracking-tight sm:text-4xl">Schedule</h2>
              <ol className="relative mt-8 space-y-6 border-l-2 border-dashed border-line pl-8">
                {event.agenda.map((item, i) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className="relative"
                  >
                    <span className="absolute -left-[41px] top-1 grid size-5 place-items-center rounded-full border-2 border-bg bg-brand" />
                    <p className="font-mono text-sm text-accent">{item.time}</p>
                    <p className="mt-1 text-lg font-semibold">{item.title}</p>
                    {item.description && <p className="text-muted">{item.description}</p>}
                  </motion.li>
                ))}
              </ol>
            </Reveal>
          )}

          {event.speakers?.length > 0 && (
            <Reveal as="section" aria-labelledby="speakers">
              <h2 id="speakers" className="text-3xl font-bold tracking-tight sm:text-4xl">{event.category === 'Music' ? 'Line-up' : 'Speakers & hosts'}</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {event.speakers.map((s) => (
                  <div key={s.name} className="flex items-center gap-4 rounded-[22px] border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <Avatar name={s.name} size={52} />
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-muted">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {hasMap && (
            <Reveal as="section" aria-labelledby="venue">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="venue" className="text-3xl font-bold tracking-tight sm:text-4xl">Getting there</h2>
                  <p className="mt-2 text-muted">{[event.venue.name, event.venue.address, event.venue.city].filter(Boolean).join(' · ')}</p>
                </div>
                <Button href={directions} variant="outline" size="sm">
                  <Navigation className="size-4" /> Directions
                </Button>
              </div>
              <div className="mt-6 overflow-hidden rounded-[28px] border border-line">
                <iframe title={`Map of ${event.venue.name}`} src={mapSrc} loading="lazy" className="h-80 w-full dark:[filter:invert(0.92)_hue-rotate(180deg)_saturate(0.6)]" />
              </div>
            </Reveal>
          )}

          {event.faqs?.length > 0 && (
            <Reveal as="section" aria-labelledby="faq">
              <h2 id="faq" className="text-3xl font-bold tracking-tight sm:text-4xl">Good to know</h2>
              <div className="mt-4">
                {event.faqs.map((f, i) => (
                  <Faq key={f.q} item={f} index={i} />
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* ── Sticky sidebar ── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[30px] border border-line bg-surface p-6 shadow-soft">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Price</p>
                <p className="font-display text-4xl font-extrabold tracking-tight">{formatPrice(event.price)}</p>
              </div>
              {event.price > 0 && <p className="pb-1.5 text-sm text-muted">per ticket</p>}
            </div>

            {phase === 'upcoming' && (
              <div className="mt-6">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Starts in</p>
                <Countdown target={event.startDate} />
              </div>
            )}
            {phase === 'live' && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">
                <LiveDot /> This event is happening right now
              </div>
            )}

            {phase !== 'past' && <SeatsMeter event={event} className="mt-6" />}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {['Aarav S', 'Diya P', 'Kunal M', 'Sneha R'].map((n) => (
                  <Avatar key={n} name={n} size={32} />
                ))}
              </div>
              <p className="text-sm text-muted">
                <span className="font-semibold text-fg">{formatNumber(event.registeredCount)}</span> people are going
              </p>
            </div>

            <RegisterCta event={event} registration={registration} className="mt-6 w-full" />
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Users className="size-3.5" /> Up to 4 tickets per registration · Free cancellation
            </p>
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-[24px] border border-line bg-surface p-5">
            <Avatar name={event.organizer.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Organiser</p>
              <p className="truncate font-semibold">{event.organizer.name}</p>
            </div>
            {event.organizer.website && (
              <a href={event.organizer.website} target="_blank" rel="noreferrer" aria-label="Organiser website" className="grid size-9 place-items-center rounded-full border border-line hover:bg-surface-2">
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        </aside>
      </div>

      {data.related?.length > 0 && (
        <section className="container-x pb-10" aria-labelledby="related">
          <h2 id="related" className="text-3xl font-bold tracking-tight sm:text-4xl">More like this</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky action bar */}
      <div className="glass fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-full border border-line p-2 pl-5 shadow-soft lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-none">{formatPrice(event.price)}</p>
          <p className="truncate text-xs text-muted">{phase === 'past' ? 'Ended' : `${formatNumber(seatsLeft(event))} seats left`}</p>
        </div>
        <RegisterCta event={event} registration={registration} compact />
      </div>
    </>
  );
}
