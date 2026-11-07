import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BadgeCheck, Building2, Download, Lock, Mail, PartyPopper, Ticket, User, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { AddToCalendar, BookingSlider } from '@/components/events/EventBits';
import { EventPicker } from '@/components/registration/EventPicker';
import { PhoneField, TextField, TicketStepper } from '@/components/registration/FormFields';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Aurora } from '@/components/ui/Effects';
import { useAuth } from '@/context/AuthContext';
import { useEventList } from '@/hooks/useQueries';
import { endpoints } from '@/lib/api';
import { seatsLeft } from '@/lib/format';
import { findActiveRegistration, registrationStore, toLocalRegistration } from '@/lib/storage';
import { celebrate, downloadTicketImage } from '@/lib/ticket';
import { cn } from '@/lib/utils';
import { formatPhoneInput, MAX_TICKETS, suggestEmail, toE164, validateRegistration } from '@/lib/validators';

const PROFILE_KEY = 'kexplore:profile';
const FIELD_ORDER = ['eventId', 'name', 'email', 'phone', 'tickets', 'organization', 'agree'];

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) ?? {};
  } catch {
    return {};
  }
}

const initialValues = (eventId, user) => {
  const profile = loadProfile();
  return {
    eventId: eventId ?? '',
    name: user?.name ?? profile.name ?? '',
    email: user?.email ?? profile.email ?? '',
    country: profile.country ?? 'IN',
    phone: profile.phone ?? '',
    organization: profile.organization ?? '',
    tickets: 1,
    agree: false,
  };
};

function SuccessDialog({ registration, onClose }) {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  if (!registration) return null;

  const download = async () => {
    setDownloading(true);
    try {
      await downloadTicketImage(ticketRef.current, registration.ticketCode);
    } catch {
      toast.error('Couldn’t create the image — try a screenshot instead.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={Boolean(registration)} onClose={onClose} size="md" className="[--notch-bg:var(--surface)]">
      <div className="text-center">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }} className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-brand text-brand-ink">
          <PartyPopper className="size-8" />
        </motion.div>
        <h2 className="text-3xl font-extrabold tracking-tight">You’re in, {registration.name.split(' ')[0]}!</h2>
        <p className="mt-2 text-muted">
          Registration confirmed. Your ticket is saved on this device{' '}
          <span className="whitespace-nowrap">— show the QR at the entrance.</span>
        </p>
      </div>
      <motion.div initial={{ opacity: 0, y: 30, rotateX: 30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mx-auto mt-6 max-w-sm [perspective:1000px]">
        <TicketCard ref={ticketRef} registration={registration} />
      </motion.div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button variant="outline" onClick={download} loading={downloading}>
          {!downloading && <Download className="size-4" />} Save as image
        </Button>
        <AddToCalendar event={registration.event} ticketCode={registration.ticketCode} className="[&>button]:h-11 [&>button]:w-full [&>button]:justify-center" />
        <Button to="/tickets" className="sm:col-span-2">
          <Ticket className="size-4" /> Go to My Tickets
        </Button>
      </div>
    </Dialog>
  );
}

export default function Register() {
  const [params, setParams] = useSearchParams();
  const { user, openSignIn } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useEventList({ when: 'upcoming', limit: 50 });
  const events = useMemo(() => data?.items ?? [], [data]);

  const [values, setValues] = useState(() => initialValues(null, user));
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [shaking, setShaking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const refs = { eventId: useRef(null), name: useRef(null), email: useRef(null), phone: useRef(null), organization: useRef(null), agree: useRef(null) };

  // Pre-select the event from ?event=<slug>
  const slugParam = params.get('event');
  useEffect(() => {
    if (!slugParam || !events.length) return;
    const match = events.find((e) => e.slug === slugParam);
    if (match) setValues((v) => ({ ...v, eventId: match.id }));
  }, [slugParam, events]);

  // Prefill from Google profile when the user signs in mid-form.
  useEffect(() => {
    if (user) setValues((v) => ({ ...v, name: v.name || user.name, email: v.email || user.email }));
  }, [user]);

  const selectedEvent = events.find((e) => e.id === values.eventId);
  const maxTickets = Math.max(1, Math.min(MAX_TICKETS, selectedEvent ? seatsLeft(selectedEvent) : MAX_TICKETS));

  const clientErrors = validateRegistration(values);
  // Locally detect a duplicate before even hitting the API.
  const duplicate = values.eventId && !clientErrors.email ? findActiveRegistration(values.eventId, values.email) : null;
  if (duplicate) clientErrors.email = 'You already have a ticket for this event with this email';
  const errors = { ...clientErrors, ...serverErrors };
  const visibleError = (field) => (touched[field] ? errors[field] : undefined);
  const isValid = (field) => touched[field] && !errors[field];
  const emailSuggestion = !clientErrors.email ? suggestEmail(values.email) : null;

  const set = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setServerErrors(({ [field]: _removed, ...rest }) => rest);
  };
  const blur = (field) => setTouched((t) => ({ ...t, [field]: true }));
  const shake = () => {
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
    setTimeout(() => setShaking(false), 500);
  };

  // Clamp the ticket count when switching to an event with fewer seats left.
  useEffect(() => {
    setValues((v) => (v.tickets > maxTickets ? { ...v, tickets: maxTickets } : v));
  }, [maxTickets]);

  const mutation = useMutation({
    mutationFn: endpoints.register,
    onSuccess: ({ registration }) => {
      const local = toLocalRegistration(registration);
      registrationStore.upsert(local);
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: values.name.trim(), email: values.email.trim(), phone: values.phone, country: values.country, organization: values.organization }));
      } catch {
        /* ignore */
      }
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      setConfirmed(local);
      celebrate();
      setValues((v) => ({ ...v, eventId: '', tickets: 1, agree: false }));
      setTouched({});
      setParams({}, { replace: true });
    },
    onError: (err) => {
      if (err.details) {
        setServerErrors(err.details);
        setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(err.details).map((k) => [k, true])) }));
      }
      shake();
      toast.error(err.message);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const [slideError, setSlideError] = useState('Booking failed');

  /** Validates, then books. Returns a promise so the slide-to-book control can show progress. */
  const confirmBooking = () => {
    setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])));
    const invalid = FIELD_ORDER.filter((f) => errors[f]);
    if (invalid.length) {
      shake();
      refs[invalid[0]]?.current?.focus();
      setSlideError(`Fix ${invalid.length} field${invalid.length > 1 ? 's' : ''} first`);
      toast.error(`Please fix ${invalid.length} field${invalid.length > 1 ? 's' : ''} before continuing`);
      return Promise.reject(new Error('invalid'));
    }
    setSlideError('Booking failed');
    return mutation.mutateAsync({
      eventId: values.eventId,
      name: values.name.trim().replace(/\s+/g, ' '),
      email: values.email.trim().toLowerCase(),
      phone: toE164(values.phone, values.country),
      organization: values.organization.trim(),
      tickets: values.tickets,
    });
  };

  // Pressing Enter in a field books too (same checks as sliding).
  const onSubmit = (e) => {
    e.preventDefault();
    confirmBooking().catch(() => {});
  };

  const completed = ['eventId', 'name', 'email', 'phone', 'agree'].filter((f) => !errors[f]).length;
  const progress = completed / 5;
  const total = (selectedEvent?.price ?? 0) * values.tickets;

  return (
    <>
      <title>Register · Eventon</title>
      <section className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
        <Aurora intensity={0.5} />
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Registration</p>
            <h1 className="mt-3 text-6xl font-extrabold leading-[0.9] tracking-[-0.04em] sm:text-7xl">Grab your spot.</h1>
            <p className="mt-4 text-lg text-muted">Takes about 30 seconds. Your ticket appears instantly — and it’s stored on this device, so it works even offline.</p>
          </div>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_400px]">
            <motion.form
              noValidate
              onSubmit={onSubmit}
              className={cn('rounded-[32px] border border-line bg-surface/80 p-5 shadow-soft backdrop-blur-xl sm:p-8', shaking && 'animate-shake')}
              aria-describedby="form-progress"
            >
              {/* Progress */}
              <div id="form-progress" className="mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{completed === 5 ? 'Ready to go!' : 'Your details'}</span>
                  <span className="font-mono text-muted">{completed}/5 complete</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-teal via-sage to-brand" animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
              </div>

              {!user && (
                <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-dashed border-line p-4 sm:flex-row sm:items-center">
                  <Wand2 className="size-5 shrink-0 text-accent" />
                  <p className="flex-1 text-sm text-muted">Sign in with Google to autofill your name and email, and sync tickets across devices.</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => openSignIn('Sign in to autofill your details and keep tickets synced.')}>
                    Autofill with Google
                  </Button>
                </div>
              )}

              <fieldset className="space-y-6">
                <legend className="sr-only">Event</legend>
                <EventPicker
                  events={events}
                  loading={isLoading}
                  value={values.eventId}
                  onChange={(id) => {
                    set('eventId', id);
                    blur('eventId');
                  }}
                  onBlur={() => blur('eventId')}
                  error={visibleError('eventId')}
                  buttonRef={refs.eventId}
                />
              </fieldset>

              <div className="my-8 h-px bg-line" />

              <fieldset className="grid gap-6 sm:grid-cols-2">
                <legend className="sr-only">Participant details</legend>
                <TextField
                  className="sm:col-span-2"
                  label="Full name"
                  name="name"
                  icon={User}
                  autoComplete="name"
                  placeholder="e.g. Ananya Mishra"
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                  onBlur={() => blur('name')}
                  error={visibleError('name')}
                  valid={isValid('name')}
                  inputRef={refs.name}
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="Email address"
                    name="email"
                    type="email"
                    icon={Mail}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={() => blur('email')}
                    error={visibleError('email')}
                    valid={isValid('email') && !emailSuggestion}
                    hint={!visibleError('email') && !emailSuggestion ? 'Your ticket and updates are sent here.' : undefined}
                    inputRef={refs.email}
                  />
                  {emailSuggestion && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 pl-1 text-sm text-warn">
                      Did you mean{' '}
                      <button type="button" onClick={() => set('email', emailSuggestion)} className="font-semibold underline underline-offset-4">
                        {emailSuggestion}
                      </button>
                      ?
                    </motion.p>
                  )}
                  {duplicate && touched.email && (
                    <Link to={`/tickets/${duplicate.ticketCode}`} className="mt-2 inline-flex items-center gap-1 pl-1 text-sm font-semibold text-accent">
                      View your existing ticket <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <PhoneField
                    value={values.phone}
                    country={values.country}
                    onChange={(v) => set('phone', formatPhoneInput(v, values.country))}
                    onCountryChange={(c) => set('country', c)}
                    onBlur={() => blur('phone')}
                    error={visibleError('phone')}
                    valid={isValid('phone')}
                    inputRef={refs.phone}
                  />
                </div>
                <TextField
                  label="College / organisation"
                  name="organization"
                  icon={Building2}
                  optional
                  autoComplete="organization"
                  placeholder="e.g. KIIT University"
                  value={values.organization}
                  onChange={(e) => set('organization', e.target.value)}
                  onBlur={() => blur('organization')}
                  error={visibleError('organization')}
                  inputRef={refs.organization}
                />
                <TicketStepper value={values.tickets} max={maxTickets} price={selectedEvent?.price} onChange={(n) => set('tickets', Math.min(Math.max(1, n), maxTickets))} error={visibleError('tickets')} />
              </fieldset>

              <div className="my-8 h-px bg-line" />

              <label className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition', visibleError('agree') ? 'border-danger bg-danger/5' : 'border-line hover:bg-surface-2')}>
                <input
                  ref={refs.agree}
                  type="checkbox"
                  checked={values.agree}
                  onChange={(e) => {
                    set('agree', e.target.checked);
                    blur('agree');
                  }}
                  aria-invalid={Boolean(visibleError('agree'))}
                  className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#468d8b]"
                />
                <span className="text-sm">
                  I agree to the event <span className="font-semibold">code of conduct</span> and understand my details will be shared with the organiser for check-in.
                  {visibleError('agree') && <span className="mt-1 block text-danger">{visibleError('agree')}</span>}
                </span>
              </label>

              <BookingSlider
                className="mt-8"
                label={total > 0 ? `Slide to book · ₹${total.toLocaleString('en-IN')}` : 'Slide to book · free'}
                errorLabel={slideError}
                onConfirm={confirmBooking}
              />
              <button type="submit" className="sr-only">Confirm registration</button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
                <Lock className="size-3.5" /> Validated in your browser and on our server. No payment is taken in this demo.
              </p>
            </motion.form>

            {/* Live ticket preview */}
            <aside className="lg:sticky lg:top-28" aria-label="Ticket preview">
              <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <span className="size-1.5 animate-pulse rounded-full bg-brand" /> Live preview
              </p>
              <motion.div layout className="[perspective:1000px]">
                <TicketCard
                  preview
                  registration={{ event: selectedEvent ?? {}, name: values.name.trim(), tickets: values.tickets }}
                />
              </motion.div>
              <ul className="mt-6 space-y-3 text-sm">
                {['Instant QR ticket — no waiting for emails', 'Saved in Local Storage, works offline', 'Cancel any time from My Tickets'].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-muted">
                    <BadgeCheck className="size-4 shrink-0 text-accent" /> {t}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <SuccessDialog registration={confirmed} onClose={() => setConfirmed(null)} />
    </>
  );
}
