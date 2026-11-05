import { ArrowUpRight, CalendarDays, Clock, MapPin, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useLocalRegistrations } from '@/hooks/useStores';
import { categoryById } from '@/lib/constants';
import { dayOfMonth, eventPhase, formatDateRange, formatPrice, monthOf, seatsLeft } from '@/lib/format';
import { cn, imageAt } from '@/lib/utils';
import { Badge, CategoryBadge, LiveDot } from '../ui/Badge';
import { SpotlightCard } from '../ui/Effects';
import { Skeleton } from '../ui/Misc';
import { MiniCountdown } from './Countdown';
import { BookmarkButton, SeatsMeter } from './EventBits';

function StatusBadge({ event, registered }) {
  const phase = eventPhase(event);
  if (registered) return <Badge tone="brand">✓ You’re going</Badge>;
  if (phase === 'live')
    return (
      <Badge tone="live">
        <LiveDot /> Live now
      </Badge>
    );
  if (phase === 'past') return <Badge tone="glass">Ended</Badge>;
  if (seatsLeft(event) === 0) return <Badge tone="danger" className="bg-danger text-white">Sold out</Badge>;
  return null;
}

const venueLabel = (event) => (event.mode === 'online' ? 'Online event' : `${event.venue?.name}, ${event.venue?.city}`);

/**
 * Event card used across the site. `layout="grid"` (vertical) or `layout="list"` (horizontal).
 * The whole card is a link; the bookmark button stops propagation.
 */
export function EventCard({ event, layout = 'grid', index = 0, className }) {
  const registrations = useLocalRegistrations();
  const registered = registrations.some((r) => r.eventId === event.id && r.status === 'confirmed');
  const cat = categoryById(event.category);
  const phase = eventPhase(event);
  const isList = layout === 'list';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn('h-full', className)}
    >
      <SpotlightCard
        className={cn(
          'flex h-full rounded-[26px] border border-line bg-surface transition-[transform,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-fg/15 hover:shadow-soft',
          isList ? 'flex-col sm:flex-row' : 'flex-col',
          phase === 'past' && 'opacity-80',
        )}
        spotlight={`${cat.color}22`}
      >
        <Link to={`/events/${event.slug}`} className="absolute inset-0 z-20" aria-label={`View ${event.title}`} />

        {/* Media */}
        <div className={cn('relative overflow-hidden', isList ? 'aspect-[16/10] sm:aspect-auto sm:w-[38%] sm:shrink-0' : 'aspect-[16/11]', 'rounded-[22px] m-1.5')}>
          <img
            src={imageAt(event.coverImage, 900)}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover/spot:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/0 to-night/25" />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <CategoryBadge category={event.category} glass className="text-white" />
              <StatusBadge event={event} registered={registered} />
            </div>
            <BookmarkButton event={event} className="relative z-30" />
          </div>

          {/* Date tile */}
          <div className="absolute bottom-3 left-3 flex items-end gap-2">
            <div className="glass flex flex-col items-center rounded-2xl border border-white/20 px-3 py-1.5 text-white">
              <span className="font-display text-2xl font-bold leading-none">{dayOfMonth(event.startDate)}</span>
              <span className="font-mono text-[10px] tracking-[0.2em]">{monthOf(event.startDate)}</span>
            </div>
            {phase === 'upcoming' && (
              <span className="glass mb-0.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-[11px] text-white">
                <Clock className="size-3" />
                <MiniCountdown target={event.startDate} />
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className={cn('flex flex-1 flex-col gap-3 p-5 pt-3', isList && 'sm:py-5 sm:pl-3')}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[1.35rem] font-bold leading-tight tracking-tight">{event.title}</h3>
            <ArrowUpRight className="mt-1 size-5 shrink-0 -translate-x-1 translate-y-1 text-muted opacity-0 transition-all duration-500 group-hover/spot:translate-x-0 group-hover/spot:translate-y-0 group-hover/spot:text-accent group-hover/spot:opacity-100" />
          </div>
          <p className={cn('text-sm text-muted', isList ? 'line-clamp-3' : 'line-clamp-2')}>{event.shortDescription}</p>

          <ul className="mt-auto space-y-1.5 pt-1 text-sm">
            <li className="flex items-center gap-2 text-fg/80">
              <CalendarDays className="size-4 shrink-0 text-muted" />
              <span className="truncate">{formatDateRange(event.startDate, event.endDate)}</span>
            </li>
            <li className="flex items-center gap-2 text-fg/80">
              {event.mode === 'online' ? <Wifi className="size-4 shrink-0 text-muted" /> : <MapPin className="size-4 shrink-0 text-muted" />}
              <span className="truncate">{venueLabel(event)}</span>
            </li>
          </ul>

          <div className="flex items-center gap-4 border-t border-line pt-4">
            <span className={cn('font-display text-lg font-bold', !event.price && 'text-success')}>
              {formatPrice(event.price)}
            </span>
            {phase !== 'past' && <SeatsMeter event={event} showLabel={false} className="flex-1" />}
            {phase === 'past' && <span className="text-xs text-muted">Event ended</span>}
          </div>
        </div>
      </SpotlightCard>
    </motion.article>
  );
}

export function EventCardSkeleton({ layout = 'grid' }) {
  return (
    <div className={cn('flex rounded-[26px] border border-line bg-surface p-1.5', layout === 'list' ? 'flex-col sm:flex-row' : 'flex-col')}>
      <Skeleton className={cn('rounded-[22px]', layout === 'list' ? 'aspect-[16/10] sm:aspect-auto sm:h-56 sm:w-[38%]' : 'aspect-[16/11]')} />
      <div className="flex-1 space-y-3 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-6 h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
