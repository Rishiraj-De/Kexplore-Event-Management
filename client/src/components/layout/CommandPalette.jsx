import { useQuery } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { ArrowRight, CalendarDays, Compass, History, Home, LayoutDashboard, Moon, Search, Ticket } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '@/context/ThemeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecentEvents } from '@/hooks/useStores';
import { endpoints } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { formatShortDate } from '@/lib/format';
import { imageAt } from '@/lib/utils';
import { Kbd } from '../ui/Misc';

const OPEN_EVENT = 'kexplore:command-palette';
export const openCommandPalette = () => window.dispatchEvent(new Event(OPEN_EVENT));

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-fg/80 data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg';

/** ⌘K / Ctrl+K command palette: live event search, recent events, navigation and actions. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim(), 200);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const recent = useRecentEvents();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ['palette', debounced],
    queryFn: ({ signal }) => endpoints.events({ q: debounced, when: 'all', limit: 6 }, signal),
    enabled: open && debounced.length > 1,
    staleTime: 60_000,
  });

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center px-3 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-night/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl"
          >
            <Command
              label="Search Eventon"
              shouldFilter={false}
              loop
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
              className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-soft"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="size-5 text-muted" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search events, venues, cities…"
                  className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
                />
                {isFetching ? <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent" /> : <Kbd>Esc</Kbd>}
              </div>
              <Command.List data-lenis-prevent className="max-h-[60vh] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-muted">
                {debounced.length > 1 && !isFetching && data?.items?.length === 0 && (
                  <Command.Empty className="px-3 py-10 text-center text-sm text-muted">No events match “{debounced}”.</Command.Empty>
                )}

                {debounced.length > 1 && data?.items?.length > 0 && (
                  <Command.Group heading="Events">
                    {data.items.map((e) => (
                      <Command.Item key={e.id} value={e.slug} onSelect={() => go(`/events/${e.slug}`)} className={itemClass}>
                        <img src={imageAt(e.coverImage, 120)} alt="" className="size-10 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-fg">{e.title}</p>
                          <p className="truncate text-xs text-muted">
                            {formatShortDate(e.startDate)} · {e.venue?.city}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-muted" />
                      </Command.Item>
                    ))}
                    <Command.Item value="see-all" onSelect={() => go(`/events?q=${encodeURIComponent(debounced)}`)} className={itemClass}>
                      <Search className="size-4 text-muted" /> See all results for “{debounced}”
                    </Command.Item>
                  </Command.Group>
                )}

                {debounced.length <= 1 && (
                  <>
                    {recent.length > 0 && (
                      <Command.Group heading="Recently viewed">
                        {recent.slice(0, 4).map((e) => (
                          <Command.Item key={e.slug} value={`recent-${e.slug}`} onSelect={() => go(`/events/${e.slug}`)} className={itemClass}>
                            <History className="size-4 text-muted" /> {e.title}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                    <Command.Group heading="Go to">
                      {[
                        ['/', Home, 'Home'],
                        ['/events', Compass, 'Explore all events'],
                        ['/tickets', Ticket, 'My tickets'],
                        ['/host', LayoutDashboard, 'Host an event'],
                      ].map(([to, Icon, label]) => (
                        <Command.Item key={to} value={label} onSelect={() => go(to)} className={itemClass}>
                          <Icon className="size-4 text-muted" /> {label}
                        </Command.Item>
                      ))}
                    </Command.Group>
                    <Command.Group heading="Categories">
                      {CATEGORIES.map((c) => (
                        <Command.Item key={c.id} value={`cat-${c.id}`} onSelect={() => go(`/events?category=${c.id}`)} className={itemClass}>
                          <c.icon className="size-4" style={{ color: c.color }} /> {c.label}
                        </Command.Item>
                      ))}
                    </Command.Group>
                    <Command.Group heading="Actions">
                      <Command.Item value="this-week" onSelect={() => go('/events?when=week')} className={itemClass}>
                        <CalendarDays className="size-4 text-muted" /> Happening this week
                      </Command.Item>
                      <Command.Item
                        value="toggle-theme"
                        onSelect={() => {
                          setOpen(false);
                          toggleTheme();
                        }}
                        className={itemClass}
                      >
                        <Moon className="size-4 text-muted" /> Toggle dark / light mode
                      </Command.Item>
                    </Command.Group>
                  </>
                )}
              </Command.List>
              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-muted">
                <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
                <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> open</span>
                <span className="ml-auto hidden sm:block">Tip: press <Kbd>/</Kbd> anywhere</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
