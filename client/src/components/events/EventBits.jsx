import { CalendarPlus, Check, Copy, Download, Share2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import PeekRating from '@/components/reactbits/PeekRating';
import PulseHeart from '@/components/reactbits/PulseHeart';
import SlideCommit from '@/components/reactbits/SlideCommit';
import { useTheme } from '@/context/ThemeContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRatings } from '@/hooks/useRatings';
import { downloadICS, googleCalendarUrl } from '@/lib/calendar';
import { useEventStats } from '@/lib/eventStats';
import { availability } from '@/lib/format';
import { cn } from '@/lib/utils';
import { GoogleIcon } from '../ui/BrandIcons';

/** Capacity bar: green → amber → red as the event fills up. */
export function SeatsMeter({ event, className, showLabel = true }) {
  const { label, tone, ratio } = availability(event);
  const color = { ok: 'bg-brand', warn: 'bg-warn', danger: 'bg-danger' }[tone];
  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={cn('font-medium', tone === 'danger' ? 'text-danger' : tone === 'warn' ? 'text-warn' : 'text-muted')}>
            {label}
          </span>
          <span className="font-mono text-muted">{Math.round(ratio * 100)}% full</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Seats filled">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(4, ratio * 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/**
 * Wishlist heart: React Bits <PulseHeart>. Shows how many people saved the event; saving is
 * stored on this device and synced to the account.
 */
export function BookmarkButton({ event, className, variant = 'glass', size = 20 }) {
  const { isSaved, toggle } = useBookmarks();
  const { savesCount } = useEventStats(event);
  const { theme } = useTheme();
  const saved = isSaved(event.id);
  const onImage = variant === 'glass';
  // The list response can be a few seconds old; never show "0" next to a heart you've filled.
  const count = Math.max(savesCount, saved ? 1 : 0);

  return (
    <span className={cn('inline-flex', className)}>
      <PulseHeart
        liked={saved}
        count={count}
        onChange={() => toggle(event)}
        size={size}
        corner={size}
        likedColor="#da6d58"
        idleColor={onImage ? 'rgb(255 255 255 / 0.9)' : theme === 'dark' ? '#9db6b1' : '#587079'}
        pillColor={onImage ? 'rgb(21 38 48 / 0.55)' : theme === 'dark' ? '#233c48' : '#f3e2cf'}
        textColor={onImage ? '#ffffff' : theme === 'dark' ? '#f7e8da' : '#213843'}
        label={saved ? `Remove ${event.title} from your wishlist` : `Add ${event.title} to your wishlist`}
        className={cn('summit-heart', onImage && 'summit-heart--glass')}
      />
    </span>
  );
}

const RATING_LABELS = ['Not for me', 'Okay', 'Good', 'Great', 'Unmissable'];

/**
 * Star rating: React Bits <PeekRating> for the signed-in user's own rating, next to the
 * event's average. Clicking your current star again clears it.
 */
export function EventRating({ event, size = 18, showLabels = false, className }) {
  const { ratingOf, rate } = useRatings();
  const { rating, ratingCount } = useEventStats(event);
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const mine = ratingOf(String(event.id));
  const lift = Math.round(size / 4);
  // PeekRating reserves space above the stars for its hover tip; pull that space back out of the
  // layout so the stars line up with the text beside them (the tip simply floats over the content above).
  const room = lift + Math.round(size * 0.9);

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      <div style={{ marginTop: -room }}>
        <PeekRating
          value={mine}
          onChange={(value) => rate(String(event.id), value)}
          size={size}
          lift={lift}
          labels={showLabels ? RATING_LABELS : []}
          activeColor="#feaf76"
          idleColor={dark ? '#3a5562' : '#e0cdb8'}
          tipColor={dark ? '#f7e8da' : '#213843'}
          tipTextColor={dark ? '#213843' : '#fffaf4'}
          ariaLabel={`Rate ${event.title}`}
        />
      </div>
      <span className="text-xs text-muted">
        {ratingCount ? (
          <>
            <span className="font-semibold text-fg">{rating?.toFixed(1)}</span> · {ratingCount.toLocaleString('en-IN')} rating
            {ratingCount === 1 ? '' : 's'}
          </>
        ) : (
          'No ratings yet'
        )}
      </span>
    </div>
  );
}

const SLIDE_HEIGHT = 56;

/**
 * Booking confirmation: React Bits <SlideCommit>. It needs a pixel width, so the container
 * is measured and the slider re-renders when it resizes.
 */
export function BookingSlider({ label, errorLabel, onConfirm, onDone, disabled, className }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.round(el.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('w-full', className)} style={{ minHeight: SLIDE_HEIGHT }}>
      {width > 0 && (
        <SlideCommit
          width={width}
          height={SLIDE_HEIGHT}
          radius={SLIDE_HEIGHT / 2}
          label={label}
          doneLabel="You’re in!"
          errorLabel={errorLabel}
          onConfirm={onConfirm}
          onDone={onDone}
          disabled={disabled}
          trackColor={dark ? '#233c48' : '#f3e2cf'}
          handleColor="#feaf76"
          successColor={dark ? '#468d8b' : '#2f7a73'}
          dangerColor={dark ? '#e57d67' : '#bf4f3b'}
          speed={55}
          holdMs={1600}
          className="summit-slide"
        />
      )}
    </div>
  );
}

/** Uses the native share sheet on mobile, falls back to copying the link. */
export function ShareButton({ event, className }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.tagline ?? event.shortDescription, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={share}
      className={cn('inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:bg-surface-2', className)}
    >
      {copied ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}

/** "Add to calendar" menu: Google Calendar link or downloadable .ics file. */
export function AddToCalendar({ event, ticketCode, className, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:bg-surface-2"
      >
        <CalendarPlus className="size-4" /> Add to calendar
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            className={cn('absolute z-30 mt-2 w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-soft', align === 'right' ? 'right-0' : 'left-0')}
          >
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-2"
            >
              <GoogleIcon className="size-4" /> Google Calendar
            </a>
            <button
              type="button"
              onClick={() => {
                downloadICS(event, ticketCode);
                setOpen(false);
                toast.success('Calendar file downloaded');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-2"
            >
              <Download className="size-4" /> Apple / Outlook (.ics)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CopyCode({ code, className }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={cn('inline-flex items-center gap-1.5 font-mono text-sm font-semibold tracking-wider hover:text-accent', className)}
      aria-label={`Copy ticket code ${code}`}
    >
      {code}
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 opacity-60" />}
    </button>
  );
}
