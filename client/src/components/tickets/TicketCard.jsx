import { QRCodeSVG } from 'qrcode.react';
import { forwardRef } from 'react';
import { categoryById } from '@/lib/constants';
import { formatShortDate, formatTime } from '@/lib/format';
import { cn, imageAt } from '@/lib/utils';
import { SummitMark } from '../ui/Misc';

const Label = ({ children }) => <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">{children}</p>;

/**
 * The ticket — always rendered "dark" like a physical pass, in every theme.
 * Used for the live preview while registering, the success dialog, My Tickets and the
 * shareable ticket page. `preview` hides the QR until the registration is confirmed.
 */
export const TicketCard = forwardRef(function TicketCard({ registration, preview = false, className, compact = false }, ref) {
  const { event = {}, name, tickets = 1, ticketCode, status } = registration;
  const cat = categoryById(event.category);
  const cancelled = status === 'cancelled';
  const qrValue = ticketCode ? `${window.location.origin}/tickets/${ticketCode}` : window.location.origin;

  return (
    <div
      ref={ref}
      className={cn('relative w-full overflow-hidden rounded-[28px] bg-night text-white shadow-2xl shadow-black/30', className)}
      style={{ '--cat': cat.color }}
    >
      {/* Header art */}
      <div className={cn('relative overflow-hidden', compact ? 'h-28' : 'h-40')}>
        {event.coverImage ? (
          <img src={imageAt(event.coverImage, 900)} alt="" crossOrigin="anonymous" className="size-full object-cover" />
        ) : (
          <div className="size-full bg-gradient-to-br from-teal via-terracotta to-brand" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
        <div className="absolute inset-x-5 top-4 flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
            <span className="grid size-6 place-items-center rounded-md bg-brand text-brand-ink">
              <SummitMark className="size-6" />
            </span>
            summit
          </span>
          <span className="rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
            Admit {tickets}
          </span>
        </div>
      </div>

      <div className="relative px-5 pb-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: cat.color }}>
          {cat.label}
        </p>
        <h3 className={cn('mt-1 font-display font-bold leading-[1.05] tracking-tight', compact ? 'text-xl' : 'text-2xl')}>
          {event.title || 'Choose an event'}
        </h3>
      </div>

      {/* Perforation */}
      <div className="relative my-3 h-6" aria-hidden>
        <span className="absolute -left-3 top-0 size-6 rounded-full bg-[var(--notch-bg,var(--bg))]" />
        <span className="absolute -right-3 top-0 size-6 rounded-full bg-[var(--notch-bg,var(--bg))]" />
        <span className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-white/15" />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-5 px-5 pb-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="col-span-2 min-w-0">
            <Label>Attendee</Label>
            <p className={cn('truncate font-semibold', !name && 'text-white/35')}>{name || 'Your name'}</p>
          </div>
          <div>
            <Label>Date</Label>
            <p className="font-semibold">{event.startDate ? formatShortDate(event.startDate) : '—'}</p>
          </div>
          <div>
            <Label>Time</Label>
            <p className="font-semibold">{event.startDate ? formatTime(event.startDate) : '—'}</p>
          </div>
          <div className="col-span-2 min-w-0">
            <Label>{event.mode === 'online' ? 'Where' : 'Venue'}</Label>
            <p className="truncate font-semibold">{event.mode === 'online' ? 'Online · link via email' : [event.venue?.name, event.venue?.city].filter(Boolean).join(', ') || '—'}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={cn('relative rounded-2xl bg-white p-2 transition-all duration-700', preview && 'blur-[3px]')}>
            <QRCodeSVG value={qrValue} size={compact ? 76 : 92} bgColor="#ffffff" fgColor="#213843" level="M" />
            {preview && <span className="absolute inset-0 grid place-items-center rounded-2xl bg-white/40 text-[10px] font-bold uppercase tracking-widest text-black">Preview</span>}
          </div>
          <p className="font-mono text-[11px] font-semibold tracking-wider text-brand">{ticketCode || 'KX-····-····'}</p>
        </div>
      </div>

      {cancelled && (
        <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[1px]" aria-label="Cancelled ticket">
          <span className="-rotate-12 rounded-xl border-4 border-danger px-5 py-2 font-display text-3xl font-extrabold uppercase tracking-widest text-danger">
            Cancelled
          </span>
        </div>
      )}
    </div>
  );
});
