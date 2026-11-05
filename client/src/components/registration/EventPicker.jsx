import { CalendarDays, Check, ChevronsUpDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatPrice, formatShortDate, seatsLeft } from '@/lib/format';
import { cn, imageAt } from '@/lib/utils';
import { FieldMessage } from './FormFields';

/**
 * Searchable combobox for choosing the event to register for.
 * Sold-out events are listed but disabled. Keyboard: type to filter, ↑/↓, Enter, Esc.
 */
export function EventPicker({ events, value, onChange, onBlur, error, buttonRef, loading }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const id = useId();
  const selected = events.find((e) => e.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? events.filter((e) => `${e.title} ${e.venue?.city} ${e.category}`.toLowerCase().includes(q)) : events;
  }, [events, query]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open, onBlur]);

  useEffect(() => setActive(0), [query]);

  const pick = (event) => {
    if (seatsLeft(event) === 0) return;
    onChange(event.id);
    setOpen(false);
    setQuery('');
    buttonRef?.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      buttonRef?.current?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <p id={`${id}-label`} className="mb-2 pl-1 text-sm font-medium">
        Select event
      </p>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-msg` : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-[72px] w-full items-center gap-3 rounded-2xl border bg-surface p-2.5 text-left transition-all',
          error ? 'border-coral ring-4 ring-coral/10' : open ? 'border-fg/30 ring-4 ring-brand/20' : 'border-line hover:border-fg/25',
        )}
      >
        {selected ? (
          <>
            <img src={imageAt(selected.coverImage, 200)} alt="" className="size-[52px] shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{selected.title}</p>
              <p className="truncate text-sm text-muted">
                {formatShortDate(selected.startDate)} · {selected.venue?.city} · {formatPrice(selected.price)}
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="grid size-[52px] shrink-0 place-items-center rounded-xl bg-surface-2">
              <CalendarDays className="size-5 text-muted" />
            </span>
            <span className="flex-1 text-muted">{loading ? 'Loading events…' : 'Choose an event to attend'}</span>
          </>
        )}
        <ChevronsUpDown className="mr-2 size-4 shrink-0 text-muted" />
      </button>
      <FieldMessage id={`${id}-msg`} error={error} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft"
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search className="size-4 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search upcoming events…"
                aria-label="Search events"
                aria-controls={`${id}-list`}
                aria-activedescendant={filtered[active] ? `${id}-opt-${filtered[active].id}` : undefined}
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <ul id={`${id}-list`} role="listbox" data-lenis-prevent className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No upcoming events match “{query}”.</li>}
              {filtered.map((e, i) => {
                const soldOut = seatsLeft(e) === 0;
                return (
                  <li
                    key={e.id}
                    id={`${id}-opt-${e.id}`}
                    role="option"
                    aria-selected={e.id === value}
                    aria-disabled={soldOut}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => pick(e)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-2',
                      soldOut ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                      i === active && !soldOut && 'bg-surface-2',
                    )}
                  >
                    <img src={imageAt(e.coverImage, 160)} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{e.title}</p>
                      <p className="truncate text-xs text-muted">
                        {formatShortDate(e.startDate)} · {e.venue?.city} · {soldOut ? 'Sold out' : `${seatsLeft(e)} left`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold">{formatPrice(e.price)}</span>
                    {e.id === value && <Check className="size-4 shrink-0 text-accent" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
