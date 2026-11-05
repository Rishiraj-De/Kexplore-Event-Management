import { LayoutDashboard, LogOut, Menu, Moon, Plus, Search, Sun, Ticket, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocalRegistrations } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Avatar, Kbd, Logo } from '../ui/Misc';
import { openCommandPalette } from './CommandPalette';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Explore' },
  { to: '/tickets', label: 'My Tickets' },
  { to: '/host', label: 'Host' },
];

export function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn('relative grid size-10 place-items-center overflow-hidden rounded-full text-fg transition hover:bg-surface-2', className)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="rounded-full transition hover:scale-105" aria-label="Account menu" aria-expanded={open}>
        <Avatar name={user.name} src={user.avatar} size={38} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-line bg-surface p-2 shadow-soft"
          >
            <div className="flex items-center gap-3 rounded-xl p-2.5">
              <Avatar name={user.name} src={user.avatar} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            {[
              { to: '/tickets', icon: Ticket, label: 'My tickets' },
              { to: '/host', icon: LayoutDashboard, label: 'Host dashboard' },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-2">
                <Icon className="size-4 text-muted" /> {label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger hover:bg-danger/10"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const { user, isLoading, openSignIn } = useAuth();
  const registrations = useLocalRegistrations();
  const upcomingTickets = registrations.filter((r) => r.status === 'confirmed' && new Date(r.event?.endDate) > new Date()).length;
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  // Hide on scroll-down / reveal on scroll-up — except on Explore, where the filter bar is pinned below it.
  const pinned = location.pathname === '/events';
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(!pinned && y > 400 && y > prev && !mobileOpen);
  });

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-ink">
        Skip to content
      </a>
      <motion.header
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4"
      >
        <nav
          className={cn(
            'mx-auto flex h-16 max-w-6xl items-center gap-2 rounded-full border px-2.5 pl-4 transition-all duration-500 ease-out-expo',
            scrolled || mobileOpen ? 'glass border-line shadow-soft' : 'glass border-line/60',
          )}
          aria-label="Primary"
        >
          <Logo />

          <ul className="mx-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className="relative block rounded-full px-4 py-2 text-sm font-medium">
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-fg"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={cn('relative z-10 transition-colors', isActive ? 'text-bg' : 'text-fg/70 hover:text-fg')}>
                        {l.label}
                        {l.to === '/tickets' && upcomingTickets > 0 && (
                          <span className="ml-1.5 inline-grid size-5 place-items-center rounded-full bg-brand font-mono text-[10px] font-bold text-brand-ink">
                            {upcomingTickets}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              onClick={openCommandPalette}
              className="hidden h-10 items-center gap-2 rounded-full border border-line bg-surface/70 pl-3 pr-2 text-sm text-muted transition hover:border-fg/20 hover:text-fg lg:flex"
              aria-label="Search events"
            >
              <Search className="size-4" />
              <span className="pr-4">Search…</span>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </button>
            <button onClick={openCommandPalette} className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden" aria-label="Search events">
              <Search className="size-[18px]" />
            </button>
            <ThemeToggle />
            {isLoading ? (
              <span className="skeleton size-10 rounded-full" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button size="sm" variant="dark" onClick={() => openSignIn()} className="hidden h-10 px-4 sm:inline-flex">
                Sign in
              </Button>
            )}
            <Button to="/events" size="sm" className="hidden h-10 px-4 xl:inline-flex">
              <Plus className="size-4" /> Get tickets
            </Button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="grid size-10 place-items-center rounded-full hover:bg-surface-2 md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass mx-auto mt-2 max-w-6xl rounded-[28px] border border-line p-3 shadow-soft md:hidden"
            >
              <ul className="space-y-1">
                {links.map((l, i) => (
                  <motion.li key={l.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                    <NavLink
                      to={l.to}
                      end={l.end}
                      className={({ isActive }) =>
                        cn('flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl font-semibold', isActive ? 'bg-fg text-bg' : 'hover:bg-surface-2')
                      }
                    >
                      {l.label}
                      {l.to === '/tickets' && upcomingTickets > 0 && (
                        <span className="grid size-7 place-items-center rounded-full bg-brand font-mono text-xs text-brand-ink">{upcomingTickets}</span>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              {!user && (
                <Button variant="dark" className="mt-3 w-full" onClick={() => openSignIn()}>
                  Sign in with Google
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
