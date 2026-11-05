import { useQueryClient } from '@tanstack/react-query';
import { Ban, Cloud, Download, Eye, FileJson, FileSpreadsheet, HardDrive, Heart, RefreshCw, Ticket, Trash2, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { MiniCountdown } from '@/components/events/Countdown';
import { AddToCalendar } from '@/components/events/EventBits';
import { EventCard } from '@/components/events/EventCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Aurora } from '@/components/ui/Effects';
import { EmptyState } from '@/components/ui/Misc';
import { useAuth } from '@/context/AuthContext';
import { useLocalRegistrations, useSavedEvents } from '@/hooks/useStores';
import { endpoints } from '@/lib/api';
import { eventPhase, fromNow } from '@/lib/format';
import { eventSnapshot, parseRegistrationBackup, registrationsToCSV, registrationStore, toLocalRegistration } from '@/lib/storage';
import { downloadTicketImage } from '@/lib/ticket';
import { cn, downloadFile } from '@/lib/utils';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'saved', label: 'Saved' },
];

function bucket(reg) {
  if (reg.status === 'cancelled') return 'cancelled';
  return reg.event?.endDate && new Date(reg.event.endDate) < new Date() ? 'past' : 'upcoming';
}

/** Reconcile Local Storage with the server: refresh statuses and pull account tickets. */
async function syncWithServer(user) {
  const local = registrationStore.getAll();
  const codes = local.map((r) => r.ticketCode);
  const tasks = [];
  if (codes.length) tasks.push(endpoints.syncRegistrations(codes.slice(0, 100)).then(({ items }) => items));
  if (user) tasks.push(endpoints.myRegistrations().then(({ items }) => items));
  const results = (await Promise.all(tasks)).flat();

  const byCode = new Map(local.map((r) => [r.ticketCode, r]));
  const merged = results.map((server) => {
    const existing = byCode.get(server.ticketCode) ?? {};
    return {
      ...existing,
      ...toLocalRegistration({ ...existing, ...server, event: server.event ?? existing.event }),
      // /sync omits personal details — keep the ones stored on this device.
      name: server.name ?? existing.name,
      email: server.email ?? existing.email,
      phone: server.phone ?? existing.phone,
    };
  });
  registrationStore.upsertMany(merged);
  return merged.length;
}

function TicketItem({ reg, onCancel }) {
  const ref = useRef(null);
  const phase = reg.event ? eventPhase(reg.event) : 'upcoming';
  return (
    <motion.li layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-3">
      <Link to={`/tickets/${reg.ticketCode}`} className="block transition-transform duration-500 ease-out-expo hover:-translate-y-1 hover:rotate-[-0.6deg]">
        <TicketCard ref={ref} registration={reg} compact />
      </Link>
      <div className="flex items-center justify-between px-1 text-xs text-muted">
        <span>Booked {fromNow(reg.createdAt)}</span>
        {reg.status === 'confirmed' && phase === 'upcoming' && (
          <span>
            Starts in <MiniCountdown target={reg.event.startDate} className="font-semibold text-fg" />
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button to={`/tickets/${reg.ticketCode}`} variant="outline" size="sm">
          <Eye className="size-4" /> View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadTicketImage(ref.current, reg.ticketCode).catch(() => toast.error('Couldn’t export the image'))}
          aria-label="Download ticket as image"
        >
          <Download className="size-4" />
        </Button>
        {reg.status === 'confirmed' && phase !== 'past' && (
          <>
            <AddToCalendar event={reg.event} ticketCode={reg.ticketCode} className="[&>button]:h-9 [&>button]:text-xs" />
            <Button variant="danger" size="sm" onClick={() => onCancel(reg)} aria-label={`Cancel ${reg.event?.title}`}>
              <Ban className="size-4" />
            </Button>
          </>
        )}
      </div>
    </motion.li>
  );
}

export default function Tickets() {
  const registrations = useLocalRegistrations();
  const saved = useSavedEvents();
  const { user, openSignIn } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('upcoming');
  const [syncing, setSyncing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const fileRef = useRef(null);

  const groups = { upcoming: [], past: [], cancelled: [] };
  for (const r of [...registrations].sort((a, b) => new Date(a.event?.startDate) - new Date(b.event?.startDate))) groups[bucket(r)].push(r);
  groups.past.reverse();
  const counts = { ...Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])), saved: saved.length };
  const totalTickets = groups.upcoming.reduce((n, r) => n + (r.tickets ?? 1), 0);

  const sync = async (silent = false) => {
    setSyncing(true);
    try {
      const n = await syncWithServer(user);
      if (!silent) toast.success('Tickets synced', { description: `${n} ticket(s) checked against the server.` });
    } catch (err) {
      if (!silent) toast.error('Sync failed', { description: err.message });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    sync(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const { registration } = await endpoints.cancelRegistration(cancelTarget.ticketCode, cancelTarget.email);
      registrationStore.upsert({ ...cancelTarget, ...toLocalRegistration(registration), event: eventSnapshot(registration.event) ?? cancelTarget.event });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      toast.success('Registration cancelled', { description: 'Your seat has been released.' });
      setCancelTarget(null);
    } catch (err) {
      toast.error('Couldn’t cancel', { description: err.message });
    } finally {
      setCancelling(false);
    }
  };

  const exportJSON = () => {
    downloadFile(`kexplore-tickets-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: 'kexplore', exportedAt: new Date().toISOString(), registrations }, null, 2), 'application/json');
    toast.success('Backup downloaded');
  };
  const exportCSV = () => {
    downloadFile(`kexplore-tickets-${new Date().toISOString().slice(0, 10)}.csv`, registrationsToCSV(registrations), 'text/csv');
    toast.success('CSV downloaded');
  };
  const importJSON = async (file) => {
    try {
      const list = parseRegistrationBackup(await file.text());
      registrationStore.upsertMany(list);
      toast.success(`Imported ${list.length} ticket(s)`);
      sync(true);
    } catch (err) {
      toast.error('Import failed', { description: err.message });
    }
  };

  const list = tab === 'saved' ? saved : groups[tab];

  return (
    <>
      <title>My Tickets · Kexplore</title>
      <section className="relative isolate overflow-hidden pb-8 pt-32 sm:pt-40">
        <Aurora intensity={0.5} />
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">
                  <HardDrive className="size-3.5" /> Saved in Local Storage
                </Badge>
                {user ? (
                  <Badge tone="ok">
                    <Cloud className="size-3.5" /> Synced to {user.email}
                  </Badge>
                ) : (
                  <button onClick={() => openSignIn('Sign in to sync your tickets across devices.')} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-2.5 py-1 text-xs font-medium text-muted hover:text-fg">
                    <Cloud className="size-3.5" /> Sign in to sync across devices
                  </button>
                )}
              </div>
              <h1 className="mt-4 text-6xl font-extrabold leading-[0.9] tracking-[-0.04em] sm:text-8xl">My Tickets</h1>
              <p className="mt-4 text-lg text-muted">
                {counts.upcoming ? `${totalTickets} ticket${totalTickets === 1 ? '' : 's'} for ${counts.upcoming} upcoming event${counts.upcoming === 1 ? '' : 's'}.` : 'Your registrations will show up here.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => sync()} loading={syncing}>
                {!syncing && <RefreshCw className="size-4" />} Sync
              </Button>
              <Button variant="outline" size="sm" onClick={exportJSON} disabled={!registrations.length}>
                <FileJson className="size-4" /> Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={!registrations.length}>
                <FileSpreadsheet className="size-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> Import
              </Button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importJSON(file);
                  e.target.value = '';
                }}
              />
              <Button variant="danger" size="sm" onClick={() => setClearOpen(true)} disabled={!registrations.length}>
                <Trash2 className="size-4" /> Clear
              </Button>
            </div>
          </div>

          <div role="tablist" aria-label="Ticket groups" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto border-b border-line">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn('relative flex shrink-0 items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition', tab === t.id ? 'text-fg' : 'text-muted hover:text-fg')}>
                {t.id === 'saved' && <Heart className="size-4" />}
                {t.label}
                <span className={cn('rounded-full px-2 py-0.5 font-mono text-[11px]', tab === t.id ? 'bg-brand text-brand-ink' : 'bg-surface-2')}>{counts[t.id]}</span>
                {tab === t.id && <motion.span layoutId="tickets-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-fg" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-10 pt-6" role="tabpanel">
        {list.length === 0 ? (
          <EmptyState
            icon={tab === 'saved' ? Heart : Ticket}
            title={tab === 'saved' ? 'No saved events yet' : tab === 'upcoming' ? 'No upcoming tickets' : `No ${tab} tickets`}
            description={tab === 'saved' ? 'Tap the heart on any event to keep it here.' : 'Find something you love and register in under 30 seconds.'}
            action={<Button to="/events">Browse events</Button>}
          />
        ) : tab === 'saved' ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {saved.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((reg) => (
                <TicketItem key={reg.ticketCode} reg={reg} onCancel={setCancelTarget} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Cancel this registration?" description={cancelTarget ? `${cancelTarget.event?.title} · ${cancelTarget.tickets} ticket(s) · ${cancelTarget.ticketCode}` : ''} size="sm">
        <p className="mt-4 text-sm text-muted">Your seat will be released for someone else. You can register again later if seats are still available.</p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)}>
            Keep ticket
          </Button>
          <Button variant="danger" className="flex-1 bg-danger text-white" onClick={confirmCancel} loading={cancelling}>
            Yes, cancel
          </Button>
        </div>
      </Dialog>

      <Dialog open={clearOpen} onClose={() => setClearOpen(false)} title="Clear tickets from this device?" size="sm">
        <p className="mt-3 text-sm text-muted">
          This removes {registrations.length} ticket(s) from Local Storage on this browser only. Your registrations stay confirmed on the server{user ? ' and will re-sync from your account' : ' — export a backup first if you want to restore them later'}.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={exportJSON}>
            <FileJson className="size-4" /> Backup first
          </Button>
          <Button
            variant="danger"
            className="flex-1 bg-danger text-white"
            onClick={() => {
              registrationStore.clear();
              setClearOpen(false);
              toast('Local tickets cleared');
            }}
          >
            Clear
          </Button>
        </div>
      </Dialog>
    </>
  );
}
