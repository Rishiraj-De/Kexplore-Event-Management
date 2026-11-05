import { randomInt } from 'node:crypto';

/** "HackKalinga 2026: 36-Hour Hackathon" → "hackkalinga-2026-36-hour-hackathon" */
export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Crockford-style alphabet: no 0/O or 1/I/L, so codes are easy to read out at a venue desk.
const TICKET_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** Cryptographically random ticket code, e.g. "KX-7H2K-9QFZ". */
export function createTicketCode() {
  const pick = (n) => Array.from({ length: n }, () => TICKET_ALPHABET[randomInt(TICKET_ALPHABET.length)]).join('');
  return `KX-${pick(4)}-${pick(4)}`;
}

/** Escape user input before using it inside a RegExp. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
