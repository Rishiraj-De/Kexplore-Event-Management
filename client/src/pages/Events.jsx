import { ArrowUpDown, CalendarDays, LayoutGrid, List, RefreshCw, Search, SearchX, SlidersHorizontal, Wallet, Wifi, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Dropdown } from '@/components/ui/Dropdown';
import { Aurora } from '@/components/ui/Effects';
import { EmptyState } from '@/components/ui/Misc';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteEvents, useMeta } from '@/hooks/useQueries';
import { CATEGORIES, categoryById, MODE_OPTIONS, PRICE_OPTIONS, SORT_OPTIONS, WHEN_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const DEFAULTS = { q: '', category: '', when: 'upcoming', price: '', mode: '', sort: 'date' };
const VIEW_KEY = 'kexplore:view';

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) ?? 'grid';
  } catch {
    return 'grid';
  }
}

/** Filters live in the URL so results are shareable and survive refresh/back. */
function useFilters() {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(Object.entries(DEFAULTS).map(([k, d]) => [k, params.get(k) ?? d]));
  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (!v || v === DEFAULTS[k]) next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });
  return { filters, update, reset };
}

function CategoryPills({ value, onChange, counts }) {
  const all = [{ id: '', label: 'All', icon: null, color: undefined }, ...CATEGORIES];
  return (
    <div role="radiogroup" aria-label="Category" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {all.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id || 'all'}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              active ? 'border-transparent' : 'border-line hover:border-fg/20',
            )}
          >
            {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className={cn('relative flex items-center gap-2', active ? 'text-bg' : 'text-fg/80')}>
              {c.icon && <c.icon className="size-4" style={{ color: active ? undefined : c.color }} />}
              {c.label}
              {c.id && counts[c.id] !== undefined && <span className={cn('font-mono text-xs', active ? 'text-bg/60' : 'text-muted')}>{counts[c.id]}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FilterControls({ filters, update, stacked = false }) {
  return (
    <div className={cn('grid gap-2', stacked ? 'grid-cols-1' : 'grid-cols-4')}>
      <Dropdown label="When" icon={CalendarDays} value={filters.when} onChange={(when) => update({ when })} options={WHEN_OPTIONS} />
      <Dropdown label="Price" icon={Wallet} value={filters.price} onChange={(price) => update({ price })} options={PRICE_OPTIONS} />
      <Dropdown label="Format" icon={Wifi} value={filters.mode} onChange={(mode) => update({ mode })} options={MODE_OPTIONS} />
      <Dropdown label="Sort" icon={ArrowUpDown} value={filters.sort} onChange={(sort) => update({ sort })} options={SORT_OPTIONS} align="right" />
    </div>
  );
}

export default function Events() {
  const { filters, update, reset } = useFilters();
  const [search, setSearch] = useState(filters.q);
  const [view, setView] = useState(readView);
  const [sheetOpen, setSheetOpen] = useState(false);
  const debounced = useDebounce(search, 350);
  const { data: meta } = useMeta();

  // Keep the input in sync when the URL changes from elsewhere (e.g. command palette).
  useEffect(() => setSearch(filters.q), [filters.q]);
  useEffect(() => {
    if (debounced !== filters.q) update({ q: debounced.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const query = useInfiniteEvents({ ...filters, limit: 9 });
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;
  const counts = Object.fromEntries((meta?.categories ?? []).map((c) => [c.name, c.count]));

  const active = [
    filters.q && { key: 'q', label: `“${filters.q}”` },
    filters.category && { key: 'category', label: categoryById(filters.category).label },
    filters.when !== 'upcoming' && { key: 'when', label: WHEN_OPTIONS.find((o) => o.value === filters.when)?.label },
    filters.price && { key: 'price', label: PRICE_OPTIONS.find((o) => o.value === filters.price)?.label },
    filters.mode && { key: 'mode', label: MODE_OPTIONS.find((o) => o.value === filters.mode)?.label },
  ].filter(Boolean);

  const heading = filters.category ? categoryById(filters.category).label : filters.when === 'past' ? 'Past events' : 'Explore events';

  return (
    <>
      <title>{`${heading} · Eventon`}</title>
      <section className="relative isolate overflow-hidden pb-10 pt-32 sm:pt-40">
        <Aurora intensity={0.6} />
        <div className="container-x">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'event' : 'events'} found`}
          </p>
          <h1 className="mt-3 text-6xl font-extrabold leading-[0.9] tracking-[-0.04em] sm:text-8xl">{heading}</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">Search by name, venue, city or tag — then narrow it down by date, price and format.</p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[84px] z-30 border-y border-line bg-bg/80 backdrop-blur-xl">
        <div className="container-x space-y-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 transition focus-within:border-fg/30 focus-within:ring-4 focus-within:ring-brand/15 lg:max-w-sm">
              <Search className="size-4 shrink-0 text-muted" aria-hidden />
              <label htmlFor="event-search" className="sr-only">
                Search events
              </label>
              <input
                id="event-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, venues, tags…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
                autoComplete="off"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Clear search" className="grid size-6 place-items-center rounded-full bg-surface-2 text-muted hover:text-fg">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="hidden flex-1 lg:block">
              <FilterControls filters={filters} update={update} />
            </div>
            <Button variant="outline" className="lg:hidden" onClick={() => setSheetOpen(true)} aria-label="Open filters">
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {active.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand font-mono text-[10px] text-brand-ink">{active.length}</span>}
            </Button>
            <div className="flex rounded-full border border-line bg-surface p-1" role="group" aria-label="Layout">
              {[
                ['grid', LayoutGrid],
                ['list', List],
              ].map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => changeView(v)}
                  aria-pressed={view === v}
                  aria-label={`${v} view`}
                  className={cn('grid size-9 place-items-center rounded-full transition', view === v ? 'bg-fg text-bg' : 'text-muted hover:text-fg')}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
          <CategoryPills value={filters.category} onChange={(category) => update({ category })} counts={counts} />
        </div>
      </div>

      <section className="container-x pt-8" aria-live="polite">
        <AnimatePresence>
          {active.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex flex-wrap items-center gap-2 overflow-hidden">
              <span className="text-sm text-muted">Active:</span>
              {active.map((f) => (
                <button
                  key={f.key}
                  onClick={() => (f.key === 'q' ? setSearch('') : update({ [f.key]: '' }))}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pl-3 pr-2 text-sm transition hover:bg-danger/15 hover:text-danger"
                >
                  {f.label}
                  <X className="size-3.5 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
              <button
                onClick={() => {
                  setSearch('');
                  reset();
                }}
                className="ml-1 text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {query.isError ? (
          <EmptyState
            icon={RefreshCw}
            title="Couldn’t load events"
            description={query.error.message}
            action={
              <Button onClick={() => query.refetch()}>
                <RefreshCw className="size-4" /> Try again
              </Button>
            }
          />
        ) : query.isLoading ? (
          <div className={cn('grid gap-5', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 6 }, (_, i) => (
              <EventCardSkeleton key={i} layout={view} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No events match those filters"
            description="Try a broader search, a different date range or another category."
            action={
              <Button
                onClick={() => {
                  setSearch('');
                  reset();
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <>
            <motion.div
              layout
              className={cn('grid gap-5 transition-opacity', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1', query.isFetching && !query.isFetchingNextPage && 'opacity-60')}
            >
              <AnimatePresence mode="popLayout">
                {items.map((event, i) => (
                  <EventCard key={event.id} event={event} layout={view} index={i % 9} />
                ))}
              </AnimatePresence>
            </motion.div>
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-sm text-muted">
                Showing {items.length} of {total}
              </p>
              <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-fg transition-all duration-700" style={{ width: `${(items.length / Math.max(total, 1)) * 100}%` }} />
              </div>
              {query.hasNextPage && (
                <Button variant="outline" size="lg" className="mt-3" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
                  Load more events
                </Button>
              )}
            </div>
          </>
        )}
      </section>

      <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters" size="sm">
        <div className="mt-6 space-y-3">
          <FilterControls filters={filters} update={update} stacked />
        </div>
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSearch('');
              reset();
            }}
          >
            Reset
          </Button>
          <Button className="flex-1" onClick={() => setSheetOpen(false)}>
            Show {total} results
          </Button>
        </div>
      </Dialog>
    </>
  );
}
