import { CalendarPlus, Check, Copy, Download, Heart, Share2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBookmarks } from '@/hooks/useBookmarks';
import { downloadICS, googleCalendarUrl } from '@/lib/calendar';
import { availability } from '@/lib/format';
import { cn } from '@/lib/utils';
import { GoogleIcon } from '../ui/BrandIcons';

/** Capacity bar: green → amber → red as the event fills up. */
export function SeatsMeter({ event, className, showLabel = true }) {
  const { label, tone, ratio } = availability(event);
  const color = { ok: 'bg-brand', warn: 'bg-amber', danger: 'bg-coral' }[tone];
  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={cn('font-medium', tone === 'danger' ? 'text-coral' : tone === 'warn' ? 'text-amber-600 dark:text-amber' : 'text-muted')}>
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

/** Heart toggle with a burst animation. */
export function BookmarkButton({ event, className, variant = 'glass' }) {
  const { isSaved, toggle } = useBookmarks();
  const saved = isSaved(event.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(event);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
      className={cn(
        'relative grid size-10 place-items-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95',
        variant === 'glass' ? 'glass border border-white/20 text-white' : 'border border-line bg-surface text-fg hover:bg-surface-2',
        className,
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
        <Heart className={cn('size-[18px]', saved && 'fill-pink text-pink')} />
      </motion.span>
      <AnimatePresence>
        {saved && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-pink"
            initial={{ scale: 0.6, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </button>
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
      {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
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
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 opacity-60" />}
    </button>
  );
}
