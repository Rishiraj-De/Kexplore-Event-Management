/**
 * Local Storage–backed stores (bonus challenge: "Local Storage-based registration data management").
 *
 * Every registration is cached on the device so tickets work offline and without an account.
 * The API remains the source of truth: the Tickets page reconciles statuses with
 * POST /api/registrations/sync, and signing in merges server-side tickets into this store.
 *
 * Stores expose a tiny subscribe/getSnapshot API so React can read them with
 * `useSyncExternalStore`, and they stay in sync across browser tabs via the `storage` event.
 */

const isBrowser = typeof window !== 'undefined';

function safeRead(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // private mode / quota exceeded — the app keeps working from memory
  }
}

/** Snapshot only the event fields a ticket needs, so tickets render without the network. */
export const eventSnapshot = (event) =>
  event && {
    id: event.id ?? event._id,
    slug: event.slug,
    title: event.title,
    tagline: event.tagline,
    shortDescription: event.shortDescription,
    category: event.category,
    capacity: event.capacity,
    registeredCount: event.registeredCount,
    coverImage: event.coverImage,
    startDate: event.startDate,
    endDate: event.endDate,
    mode: event.mode,
    price: event.price,
    venue: event.venue && { name: event.venue.name, city: event.venue.city, address: event.venue.address },
    organizer: event.organizer && { name: event.organizer.name },
    savesCount: event.savesCount,
    ratingCount: event.ratingCount,
    ratingTotal: event.ratingTotal,
  };

function createStore(key, { idOf, version = 1 }) {
  const storageKey = `kexplore:${key}:v${version}`;
  const listeners = new Set();
  let cache = safeRead(storageKey, []);

  const emit = () => listeners.forEach((l) => l());
  const commit = (next) => {
    cache = next;
    safeWrite(storageKey, next);
    emit();
  };

  if (isBrowser) {
    window.addEventListener('storage', (e) => {
      if (e.key === storageKey) {
        cache = safeRead(storageKey, []);
        emit();
      }
    });
  }

  return {
    key: storageKey,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => cache,
    getAll: () => cache,
    get: (id) => cache.find((item) => idOf(item) === id) ?? null,
    upsert(item) {
      const id = idOf(item);
      const exists = cache.some((x) => idOf(x) === id);
      commit(exists ? cache.map((x) => (idOf(x) === id ? { ...x, ...item } : x)) : [item, ...cache]);
    },
    upsertMany(items) {
      const map = new Map(cache.map((x) => [idOf(x), x]));
      for (const item of items) map.set(idOf(item), { ...map.get(idOf(item)), ...item });
      commit([...map.values()]);
    },
    remove(id) {
      commit(cache.filter((x) => idOf(x) !== id));
    },
    clear() {
      commit([]);
    },
    replaceAll(items) {
      commit(items);
    },
  };
}

// ── Registrations ────────────────────────────────────────────────────────────
export const registrationStore = createStore('registrations', { idOf: (r) => r.ticketCode });

/** Normalise an API registration into the shape we persist. */
export function toLocalRegistration(reg, extra = {}) {
  const event = typeof reg.event === 'object' ? reg.event : null;
  return {
    ticketCode: reg.ticketCode,
    eventId: event?.id ?? event?._id ?? reg.event,
    event: eventSnapshot(event) ?? reg.eventSnapshot,
    name: reg.name,
    email: reg.email,
    phone: reg.phone,
    organization: reg.organization || '',
    tickets: reg.tickets ?? 1,
    status: reg.status ?? 'confirmed',
    createdAt: reg.createdAt ?? new Date().toISOString(),
    cancelledAt: reg.cancelledAt ?? null,
    syncedAt: new Date().toISOString(),
    ...extra,
  };
}

export const findActiveRegistration = (eventId, email) =>
  registrationStore
    .getAll()
    .find(
      (r) =>
        r.eventId === eventId && r.status === 'confirmed' && (!email || r.email?.toLowerCase() === email.toLowerCase()),
    ) ?? null;

const CSV_COLUMNS = ['ticketCode', 'event', 'date', 'venue', 'name', 'email', 'phone', 'tickets', 'status', 'createdAt'];

export function registrationsToCSV(list) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = list.map((r) =>
    [r.ticketCode, r.event?.title, r.event?.startDate, r.event?.venue?.name, r.name, r.email, r.phone, r.tickets, r.status, r.createdAt]
      .map(escape)
      .join(','),
  );
  return [CSV_COLUMNS.join(','), ...rows].join('\n');
}

/** Validate an imported JSON backup; returns the valid registrations only. */
export function parseRegistrationBackup(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data?.registrations;
  if (!Array.isArray(list)) throw new Error('This file is not a Eventon tickets backup');
  return list.filter((r) => /^KX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(r?.ticketCode) && r?.event?.title);
}

// ── Saved (bookmarked) events ────────────────────────────────────────────────
export const savedStore = createStore('saved', { idOf: (e) => e.id });

// ── Recently viewed events (used for the command palette & "jump back in") ────
export const recentStore = createStore('recent', { idOf: (e) => e.slug });

export function pushRecent(event) {
  const snap = eventSnapshot(event);
  const rest = recentStore.getAll().filter((e) => e.slug !== snap.slug);
  recentStore.replaceAll([snap, ...rest].slice(0, 6));
}
