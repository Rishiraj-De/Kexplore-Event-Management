import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BarChart3, CalendarPlus, Check, Eye, Globe, ImagePlus, MapPin, Sparkles, Users, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { GoogleButton } from '@/components/auth/SignIn';
import { SeatsMeter } from '@/components/events/EventBits';
import { FieldMessage, TextField } from '@/components/registration/FormFields';
import { CategoryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Dropdown } from '@/components/ui/Dropdown';
import { Aurora } from '@/components/ui/Effects';
import { EmptyState, Skeleton } from '@/components/ui/Misc';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '@/hooks/useQueries';
import { endpoints } from '@/lib/api';
import { CATEGORIES, COVER_PRESETS } from '@/lib/constants';
import { formatDateRange, formatNumber, formatPrice } from '@/lib/format';
import { cn, imageAt } from '@/lib/utils';

const blank = {
  title: '',
  tagline: '',
  category: 'Tech',
  shortDescription: '',
  description: '',
  coverImage: COVER_PRESETS[0],
  startDate: '',
  endDate: '',
  mode: 'offline',
  venueName: '',
  venueAddress: '',
  city: '',
  price: '0',
  capacity: '100',
  tags: '',
};

function validateEvent(v) {
  const e = {};
  if (v.title.trim().length < 5) e.title = 'Give your event a title of at least 5 characters';
  if (v.shortDescription.trim().length < 20) e.shortDescription = 'Write a short summary (20+ characters)';
  if (v.description.trim().length < 60) e.description = 'Describe the event in at least 60 characters';
  if (!/^https:\/\/\S+$/.test(v.coverImage)) e.coverImage = 'Use an https:// image URL or pick a preset';
  if (!v.startDate) e.startDate = 'Pick a start date and time';
  else if (new Date(v.startDate) <= new Date()) e.startDate = 'The start must be in the future';
  if (!v.endDate) e.endDate = 'Pick an end date and time';
  else if (v.startDate && new Date(v.endDate) <= new Date(v.startDate)) e.endDate = 'The end must be after the start';
  if (v.venueName.trim().length < 2) e.venueName = v.mode === 'online' ? 'Name the platform, e.g. Zoom' : 'Where is it happening?';
  if (v.city.trim().length < 2) e.city = v.mode === 'online' ? 'Use “Online”' : 'Which city?';
  if (Number(v.price) < 0 || Number.isNaN(Number(v.price))) e.price = 'Price can’t be negative';
  if (!Number.isInteger(Number(v.capacity)) || Number(v.capacity) < 1) e.capacity = 'Capacity must be a whole number ≥ 1';
  return e;
}

function TextArea({ label, value, onChange, onBlur, error, max, rows = 3, placeholder }) {
  return (
    <div>
      <label className="mb-2 flex justify-between pl-1 text-sm font-medium">
        {label}
        <span className={cn('font-mono text-xs', value.length > max ? 'text-danger' : 'text-muted')}>
          {value.length}/{max}
        </span>
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn('w-full resize-y rounded-2xl border bg-surface p-4 outline-none transition focus:ring-4', error ? 'border-danger focus:ring-danger/15' : 'border-line focus:border-fg/30 focus:ring-brand/20')}
      />
      <FieldMessage error={error} />
    </div>
  );
}

function CreateEventForm() {
  const [v, setV] = useState(blank);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const errors = { ...validateEvent(v), ...serverErrors };
  const err = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => {
    const value = e?.target ? e.target.value : e;
    setV((s) => ({ ...s, [k]: value }));
    setServerErrors(({ [k]: _x, ...rest }) => rest);
  };
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const mutation = useMutation({
    mutationFn: endpoints.createEvent,
    onSuccess: ({ event }) => {
      toast.success('Your event is live! 🎉');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${event.slug}`);
    },
    onError: (e) => {
      if (e.details) {
        const mapped = Object.fromEntries(Object.entries(e.details).map(([k, m]) => [k.replace('venue.name', 'venueName').replace('venue.city', 'city'), m]));
        setServerErrors(mapped);
        setTouched(Object.fromEntries(Object.keys(blank).map((k) => [k, true])));
      }
      toast.error(e.message);
    },
  });

  const submit = (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(blank).map((k) => [k, true])));
    if (Object.keys(errors).length) return toast.error('Please complete the highlighted fields');
    mutation.mutate({
      title: v.title.trim(),
      tagline: v.tagline.trim(),
      category: v.category,
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      coverImage: v.coverImage.trim(),
      startDate: new Date(v.startDate).toISOString(),
      endDate: new Date(v.endDate).toISOString(),
      mode: v.mode,
      venue: { name: v.venueName.trim(), address: v.venueAddress.trim(), city: v.city.trim() },
      price: Number(v.price),
      capacity: Number(v.capacity),
      tags: v.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
    });
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-6 rounded-[32px] border border-line bg-surface p-5 shadow-soft sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-brand text-brand-ink">
          <CalendarPlus className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create an event</h2>
          <p className="text-sm text-muted">It goes live instantly and appears in Explore.</p>
        </div>
      </div>

      {/* Cover */}
      <div>
        <p className="mb-2 pl-1 text-sm font-medium">Cover image</p>
        <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-line bg-surface-2">
          {v.coverImage && <img src={imageAt(v.coverImage, 1200)} alt="Cover preview" className="size-full object-cover" onError={(e) => (e.currentTarget.style.opacity = '0.2')} />}
          <span className="absolute left-3 top-3"><CategoryBadge category={v.category} glass className="text-white" /></span>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {COVER_PRESETS.map((src) => (
            <button key={src} type="button" onClick={() => set('coverImage')(src)} className={cn('relative h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-offset-2 ring-offset-surface transition', v.coverImage === src ? 'ring-2 ring-accent' : 'opacity-70 hover:opacity-100')} aria-label="Use this cover">
              <img src={imageAt(src, 200)} alt="" className="size-full object-cover" />
              {v.coverImage === src && <Check className="absolute inset-0 m-auto size-5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <TextField className="mt-3" label="…or paste an image URL" icon={ImagePlus} value={v.coverImage} onChange={set('coverImage')} onBlur={blur('coverImage')} error={err('coverImage')} placeholder="https://images.unsplash.com/…" />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
        <TextField label="Event title" value={v.title} onChange={set('title')} onBlur={blur('title')} error={err('title')} valid={touched.title && !errors.title} placeholder="e.g. Design Jam 2027" maxLength={120} />
        <div>
          <p className="mb-2 pl-1 text-sm font-medium">Category</p>
          <Dropdown value={v.category} onChange={set('category')} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} className="[&>button]:h-14 [&>button]:rounded-2xl" />
        </div>
      </div>
      <TextField label="Tagline" optional value={v.tagline} onChange={set('tagline')} placeholder="One punchy line" maxLength={160} />
      <TextArea label="Short summary (shown on cards)" value={v.shortDescription} onChange={set('shortDescription')} onBlur={blur('shortDescription')} error={err('shortDescription')} max={240} rows={2} placeholder="What is it, who is it for, why come?" />
      <TextArea label="Full description" value={v.description} onChange={set('description')} onBlur={blur('description')} error={err('description')} max={6000} rows={6} placeholder="Agenda, what to bring, prizes… Separate paragraphs with a blank line. Use **bold** for emphasis." />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Starts" type="datetime-local" value={v.startDate} onChange={set('startDate')} onBlur={blur('startDate')} error={err('startDate')} />
        <TextField label="Ends" type="datetime-local" value={v.endDate} onChange={set('endDate')} onBlur={blur('endDate')} error={err('endDate')} min={v.startDate} />
      </div>

      <div>
        <p className="mb-2 pl-1 text-sm font-medium">Format</p>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1" role="radiogroup" aria-label="Event format">
          {[
            ['offline', 'In person', MapPin],
            ['online', 'Online', Globe],
            ['hybrid', 'Hybrid', Users],
          ].map(([value, label, Icon]) => (
            <button key={value} type="button" role="radio" aria-checked={v.mode === value} onClick={() => setV((s) => ({ ...s, mode: value, ...(value === 'online' && !s.city ? { city: 'Online' } : {}) }))} className="relative flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium">
              {v.mode === value && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-xl bg-surface shadow-soft" />}
              <span className="relative flex items-center gap-2">
                <Icon className="size-4" /> {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label={v.mode === 'online' ? 'Platform' : 'Venue name'} value={v.venueName} onChange={set('venueName')} onBlur={blur('venueName')} error={err('venueName')} placeholder={v.mode === 'online' ? 'Zoom / YouTube Live' : 'KIIT Convention Centre'} />
        <TextField label="City" value={v.city} onChange={set('city')} onBlur={blur('city')} error={err('city')} placeholder="Bhubaneswar" />
        <TextField className="sm:col-span-2" label="Address" optional value={v.venueAddress} onChange={set('venueAddress')} placeholder="Street, area" />
        <TextField label="Price (₹, 0 = free)" type="number" min="0" inputMode="numeric" value={v.price} onChange={set('price')} onBlur={blur('price')} error={err('price')} />
        <TextField label="Capacity" type="number" min="1" inputMode="numeric" value={v.capacity} onChange={set('capacity')} onBlur={blur('capacity')} error={err('capacity')} />
        <TextField className="sm:col-span-2" label="Tags" optional value={v.tags} onChange={set('tags')} placeholder="design, beginner-friendly, networking" hint="Comma-separated, up to 8" />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
        Publish event <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function AttendeesDialog({ event, onClose }) {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.attendees(event?.id), queryFn: () => endpoints.attendees(event.id), enabled: Boolean(event) });
  return (
    <Dialog open={Boolean(event)} onClose={onClose} title="Attendees" description={event?.title} size="lg">
      <div className="mt-6">
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : !data?.items?.length ? (
          <p className="py-10 text-center text-muted">No registrations yet — share your event link!</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Tickets</th>
                  <th className="px-4 py-3">Code</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.ticketCode} className="border-t border-line">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-muted">{a.email}</td>
                    <td className="px-4 py-3">{a.tickets}</td>
                    <td className="px-4 py-3 font-mono text-xs">{a.ticketCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function HostedEvents() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.hosted, queryFn: endpoints.hostedEvents });
  const [attendeesFor, setAttendeesFor] = useState(null);
  const items = data?.items ?? [];
  const totals = items.reduce((t, e) => ({ regs: t.regs + e.registeredCount, views: t.views + (e.views ?? 0) }), { regs: 0, views: 0 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Events', items.length, CalendarPlus],
          ['Registered', totals.regs, Users],
          ['Page views', totals.views, Eye],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-[22px] border border-line bg-surface p-4">
            <Icon className="size-4 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold">{formatNumber(value)}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-40 rounded-[24px]" />
      ) : items.length === 0 ? (
        <EmptyState icon={BarChart3} title="No events yet" description="Events you publish show up here with live registration stats." className="py-10" />
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id} className="flex gap-4 rounded-[24px] border border-line bg-surface p-3">
              <img src={imageAt(e.coverImage, 240)} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <Link to={`/events/${e.slug}`} className="block truncate font-semibold hover:text-accent">
                  {e.title}
                </Link>
                <p className="truncate text-xs text-muted">
                  {formatDateRange(e.startDate, e.endDate)} · {formatPrice(e.price)}
                </p>
                <SeatsMeter event={e} className="mt-2" />
              </div>
              <Button variant="outline" size="icon-sm" onClick={() => setAttendeesFor(e)} aria-label="View attendees" className="self-center">
                <Users className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <AttendeesDialog event={attendeesFor} onClose={() => setAttendeesFor(null)} />
    </div>
  );
}

export default function Host() {
  const { user, isLoading } = useAuth();

  return (
    <>
      <title>Host an event · Eventon</title>
      <section className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
        <Aurora intensity={0.6} />
        <div className="container-x">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Host dashboard</p>
          <h1 className="mt-3 max-w-4xl text-6xl font-extrabold leading-[0.9] tracking-[-0.04em] sm:text-8xl">
            Put your event <span className="text-gradient animate-gradient-pan">on the map.</span>
          </h1>

          {isLoading ? (
            <Skeleton className="mt-12 h-96 rounded-[32px]" />
          ) : !user ? (
            <div className="mt-12 grid items-center gap-10 rounded-[36px] border border-line bg-surface p-6 sm:p-12 lg:grid-cols-2">
              <div>
                <Sparkles className="size-8 text-accent" />
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Sign in to start hosting</h2>
                <p className="mt-3 text-muted">Hosting needs a verified identity so attendees know who’s behind the event. One tap with Google and you’re in.</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {['Publish in under two minutes', 'Live seat tracking and page views', 'See your attendee list', 'Free, forever'].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="size-4 text-accent" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[28px] bg-surface-2 p-6 sm:p-8">
                <GoogleButton />
                <p className="mt-4 text-center text-xs text-muted">We only use your name, email and photo.</p>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted">
                  <X className="size-3.5" /> No passwords · <X className="size-3.5" /> No spam
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
              <CreateEventForm />
              <aside className="space-y-4 lg:sticky lg:top-28">
                <h2 className="text-2xl font-bold tracking-tight">Your events</h2>
                <HostedEvents />
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
