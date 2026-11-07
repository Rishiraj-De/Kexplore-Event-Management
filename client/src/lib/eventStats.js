import { useSyncExternalStore } from 'react';

/**
 * Fresh per-event numbers (wishlist count, rating average) returned by the API after the user
 * saves or rates something. Event lists are cached at the edge for a few seconds, so cards read
 * these overrides first and fall back to whatever the list response said.
 */
const overrides = new Map();
const listeners = new Set();
let version = 0;

export function setEventStats(eventId, patch) {
  overrides.set(String(eventId), { ...overrides.get(String(eventId)), ...patch });
  version += 1;
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** `{ savesCount, rating, ratingCount }` for an event, preferring the newest values we've seen. */
export function useEventStats(event) {
  useSyncExternalStore(subscribe, () => version);
  const fresh = overrides.get(String(event.id)) ?? {};
  const ratingCount = fresh.ratingCount ?? event.ratingCount ?? 0;
  const rating =
    fresh.rating !== undefined ? fresh.rating : event.rating ?? (ratingCount ? Math.round(((event.ratingTotal ?? 0) / ratingCount) * 10) / 10 : null);
  return { savesCount: fresh.savesCount ?? event.savesCount ?? 0, rating, ratingCount };
}
