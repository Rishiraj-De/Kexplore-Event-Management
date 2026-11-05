/**
 * Thin fetch wrapper around the Kexplore REST API.
 * The API is served from the same origin (`/api`) — Vite proxies it in development and
 * Vercel rewrites it to Render in production — so cookies stay first-party.
 */
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Can’t reach the server — check your connection and try again');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback = res.status >= 500 ? 'The server is waking up — please retry in a few seconds' : 'Request failed';
    throw new ApiError(res.status, data.error || fallback, data.details);
  }
  return data;
}

const toQuery = (params = {}) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all-cats') qs.set(key, value);
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export const endpoints = {
  health: () => api('/health'),
  events: (params, signal) => api(`/events${toQuery(params)}`, { signal }),
  meta: () => api('/events/meta'),
  event: (slug) => api(`/events/${encodeURIComponent(slug)}`),
  createEvent: (body) => api('/events', { method: 'POST', body }),
  hostedEvents: () => api('/events/hosted'),
  attendees: (eventId) => api(`/events/${eventId}/attendees`),

  register: (body) => api('/registrations', { method: 'POST', body }),
  ticket: (code) => api(`/registrations/${encodeURIComponent(code)}`),
  myRegistrations: () => api('/registrations/me'),
  syncRegistrations: (codes) => api('/registrations/sync', { method: 'POST', body: { codes } }),
  cancelRegistration: (code, email) => api(`/registrations/${code}/cancel`, { method: 'PATCH', body: { email } }),

  me: () => api('/auth/me'),
  googleSignIn: (payload) => api('/auth/google', { method: 'POST', body: payload }),
  logout: () => api('/auth/logout', { method: 'POST' }),

  bookmarks: () => api('/users/me/bookmarks'),
  toggleBookmark: (eventId) => api(`/users/me/bookmarks/${eventId}`, { method: 'PUT' }),
};
