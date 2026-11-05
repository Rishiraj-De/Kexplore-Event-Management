// All events take place in India, so dates are always shown in IST regardless of the viewer's clock.
const TZ = 'Asia/Kolkata';

const fmt = (options) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, ...options });

const weekdayDayMonth = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
const dayMonthYear = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const longDate = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const time = fmt({ hour: 'numeric', minute: '2-digit', hour12: true });
const dayNum = fmt({ day: '2-digit' });
const monthShort = fmt({ month: 'short' });
const dateKey = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' });

const toDate = (d) => (d instanceof Date ? d : new Date(d));

export const formatShortDate = (d) => weekdayDayMonth.format(toDate(d));
export const formatDate = (d) => dayMonthYear.format(toDate(d));
export const formatLongDate = (d) => longDate.format(toDate(d));
export const formatTime = (d) => time.format(toDate(d)).replace(/\s?(am|pm)$/i, (m) => m.toUpperCase());
export const dayOfMonth = (d) => dayNum.format(toDate(d));
export const monthOf = (d) => monthShort.format(toDate(d)).toUpperCase();

const sameDay = (a, b) => dateKey.format(toDate(a)) === dateKey.format(toDate(b));

/** "Sat, 21 Nov · 9:00 AM" or "21 Nov – 22 Nov" for multi-day events. */
export function formatDateRange(start, end) {
  if (!end || sameDay(start, end)) return `${formatShortDate(start)} · ${formatTime(start)}`;
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export const formatTimeRange = (start, end) => `${formatTime(start)} – ${formatTime(end)} IST`;

export function formatPrice(price, currency = 'INR') {
  if (!price) return 'Free';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(n ?? 0);

export const compactNumber = (n) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n ?? 0);

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "in 3 days", "tomorrow", "2 hours ago" */
export function fromNow(d) {
  const diff = toDate(d).getTime() - Date.now();
  const abs = Math.abs(diff);
  const units = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === 'minute') return rtf.format(Math.round(diff / ms), unit);
  }
  return '';
}

/** Lifecycle of an event relative to now. */
export function eventPhase(event, now = Date.now()) {
  const start = toDate(event.startDate).getTime();
  const end = toDate(event.endDate).getTime();
  if (now > end) return 'past';
  if (now >= start) return 'live';
  return 'upcoming';
}

export const seatsLeft = (event) => Math.max(0, (event.capacity ?? 0) - (event.registeredCount ?? 0));

export function availability(event) {
  const left = seatsLeft(event);
  const ratio = event.capacity ? event.registeredCount / event.capacity : 0;
  if (left <= 0) return { label: 'Sold out', tone: 'danger', ratio: 1 };
  if (ratio >= 0.85) return { label: `Only ${left} left`, tone: 'warn', ratio };
  return { label: `${formatNumber(left)} seats left`, tone: 'ok', ratio };
}
