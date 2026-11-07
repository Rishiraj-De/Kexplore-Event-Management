import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clock, Download, MapPin, Printer, Ticket } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { Countdown } from '@/components/events/Countdown';
import { AddToCalendar, CopyCode } from '@/components/events/EventBits';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Aurora } from '@/components/ui/Effects';
import { EmptyState, Skeleton } from '@/components/ui/Misc';
import { queryKeys } from '@/hooks/useQueries';
import { endpoints } from '@/lib/api';
import { eventPhase, formatLongDate, formatTimeRange } from '@/lib/format';
import { registrationStore, toLocalRegistration } from '@/lib/storage';
import { downloadTicketImage } from '@/lib/ticket';

/** Shareable ticket page (the QR code links here). Falls back to the Local Storage copy when offline. */
export default function TicketView() {
  const { code } = useParams();
  const ticketCode = code.toUpperCase();
  const local = registrationStore.get(ticketCode);
  const ref = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.ticket(ticketCode),
    queryFn: async () => {
      const { registration } = await endpoints.ticket(ticketCode);
      // Keep the device copy fresh (but never overwrite unmasked details with masked ones).
      if (local) registrationStore.upsert({ ...local, status: registration.status, cancelledAt: registration.cancelledAt });
      return toLocalRegistration(registration);
    },
    retry: 1,
  });

  const reg = local ? { ...data, ...local, status: data?.status ?? local.status } : data;

  if (isLoading && !local) {
    return (
      <div className="container-x grid gap-10 pt-36 lg:grid-cols-2">
        <Skeleton className="h-[460px] rounded-[28px]" />
        <Skeleton className="h-72 rounded-[28px]" />
      </div>
    );
  }
  if (!reg) {
    return (
      <div className="container-x pt-40">
        <EmptyState icon={Ticket} title="Ticket not found" description={isError ? error.message : `We couldn’t find a ticket with code ${ticketCode}.`} action={<Button to="/tickets">My tickets</Button>} />
      </div>
    );
  }

  const event = reg.event ?? {};
  const phase = event.startDate ? eventPhase(event) : 'upcoming';

  return (
    <>
      <title>{`Ticket ${ticketCode} · Eventon`}</title>
      <section className="relative isolate overflow-hidden pb-16 pt-32 sm:pt-40">
        <Aurora intensity={0.6} />
        <div className="container-x">
          <Link to="/tickets" className="no-print mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> My tickets
          </Link>
          <div className="grid items-start gap-12 lg:grid-cols-[420px_1fr]">
            <motion.div initial={{ opacity: 0, y: 40, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              <TicketCard ref={ref} registration={reg} />
            </motion.div>

            <div className="space-y-8">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={reg.status === 'cancelled' ? 'danger' : 'ok'}>{reg.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}</Badge>
                  <Badge>
                    Code: <CopyCode code={ticketCode} className="text-xs" />
                  </Badge>
                </div>
                <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">{event.title}</h1>
                <ul className="mt-6 space-y-3 text-fg/85">
                  {event.startDate && (
                    <>
                      <li className="flex items-center gap-3"><CalendarDays className="size-5 text-muted" /> {formatLongDate(event.startDate)}</li>
                      <li className="flex items-center gap-3"><Clock className="size-5 text-muted" /> {formatTimeRange(event.startDate, event.endDate)}</li>
                    </>
                  )}
                  <li className="flex items-center gap-3"><MapPin className="size-5 text-muted" /> {event.mode === 'online' ? 'Online — join link sent before the event' : [event.venue?.name, event.venue?.city].filter(Boolean).join(', ')}</li>
                </ul>
              </div>

              {reg.status === 'confirmed' && phase === 'upcoming' && (
                <div className="max-w-md">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Doors open in</p>
                  <Countdown target={event.startDate} />
                </div>
              )}

              <div className="no-print flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  loading={downloading}
                  onClick={async () => {
                    setDownloading(true);
                    try {
                      await downloadTicketImage(ref.current, ticketCode);
                    } catch {
                      toast.error('Couldn’t export the image');
                    } finally {
                      setDownloading(false);
                    }
                  }}
                >
                  {!downloading && <Download className="size-4" />} Save image
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="size-4" /> Print
                </Button>
                {reg.status === 'confirmed' && phase !== 'past' && <AddToCalendar event={event} ticketCode={ticketCode} className="[&>button]:h-11" />}
                {event.slug && (
                  <Button to={`/events/${event.slug}`} variant="ghost">
                    Event details
                  </Button>
                )}
              </div>
              {!local && (
                <p className="text-sm text-muted">Viewing a shared ticket — personal details are partially hidden for privacy.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
