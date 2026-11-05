/**
 * Client-side form validation for the registration form.
 * Pure functions — easy to unit test and reused by the live ticket preview.
 * The API re-validates everything with Zod, so these rules are for fast, friendly feedback.
 */

export const COUNTRIES = [
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India', pattern: /^[6-9]\d{9}$/, example: '98765 43210', hint: '10 digits starting with 6–9' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States', pattern: /^[2-9]\d{9}$/, example: '415 555 0132', hint: '10 digits' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom', pattern: /^7\d{9}$/, example: '7400 123456', hint: '10 digits starting with 7' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE', pattern: /^5\d{8}$/, example: '50 123 4567', hint: '9 digits starting with 5' },
  { code: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore', pattern: /^[89]\d{7}$/, example: '8123 4567', hint: '8 digits starting with 8 or 9' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia', pattern: /^4\d{8}$/, example: '412 345 678', hint: '9 digits starting with 4' },
];

export const MAX_TICKETS = 4;

const NAME_RE = /^[\p{L}][\p{L} .'-]*$/u;
// Practical email check: local@domain.tld, no spaces, TLD ≥ 2 letters.
const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;

export const digitsOnly = (value = '') => value.replace(/\D/g, '');

export const rules = {
  name(value = '') {
    const v = value.trim().replace(/\s+/g, ' ');
    if (!v) return 'Please enter your full name';
    if (v.length < 2) return 'Name must be at least 2 characters';
    if (v.length > 60) return 'Name must be 60 characters or fewer';
    if (!NAME_RE.test(v)) return 'Use letters only — spaces, apostrophes, dots and hyphens are fine';
    return null;
  },
  email(value = '') {
    const v = value.trim();
    if (!v) return 'Please enter your email address';
    if (/\s/.test(v)) return 'Email can’t contain spaces';
    if (!v.includes('@')) return 'An email address needs an “@”';
    if (v.includes('..')) return 'Email can’t contain two dots in a row';
    if (!EMAIL_RE.test(v)) return 'Enter a valid email, like name@example.com';
    return null;
  },
  phone(value = '', countryCode = 'IN') {
    const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
    const digits = digitsOnly(value);
    if (!digits) return 'Please enter your phone number';
    if (/[^\d\s-]/.test(value)) return 'Use digits only (spaces and dashes are fine)';
    if (!country.pattern.test(digits)) return `Enter a valid ${country.name} number — ${country.hint}`;
    return null;
  },
  eventId(value) {
    return value ? null : 'Please choose the event you want to attend';
  },
  tickets(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) return 'Choose at least 1 ticket';
    if (n > MAX_TICKETS) return `You can book up to ${MAX_TICKETS} tickets at once`;
    return null;
  },
  organization(value = '') {
    return value.trim().length > 80 ? 'Keep this under 80 characters' : null;
  },
  agree(value) {
    return value ? null : 'Please accept the code of conduct to continue';
  },
};

/** Validate the whole registration form. Returns `{}` when everything is valid. */
export function validateRegistration(values) {
  const errors = {
    eventId: rules.eventId(values.eventId),
    name: rules.name(values.name),
    email: rules.email(values.email),
    phone: rules.phone(values.phone, values.country),
    tickets: rules.tickets(values.tickets),
    organization: rules.organization(values.organization),
    agree: rules.agree(values.agree),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

export const validateField = (field, values) => validateRegistration(values)[field] ?? null;

/** "+91" + "98765 43210" → "+919876543210" */
export function toE164(phone, countryCode = 'IN') {
  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  return `${country.dial}${digitsOnly(phone)}`;
}

/** Format digits as the user types: "9876543210" → "98765 43210" (India) or groups of 3–4. */
export function formatPhoneInput(value, countryCode = 'IN') {
  const d = digitsOnly(value).slice(0, 12);
  if (countryCode === 'IN') return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5, 10)}` : d;
  return d.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim();
}

// ── "Did you mean …?" for common email domain typos ──────────────────────────
const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'kiit.ac.in', 'yahoo.co.in', 'rediffmail.com'];

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Returns a corrected email ("john@gmial.com" → "john@gmail.com") or null. */
export function suggestEmail(email = '') {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!local || !domain || COMMON_DOMAINS.includes(domain)) return null;
  let best = null;
  for (const candidate of COMMON_DOMAINS) {
    const distance = levenshtein(domain, candidate);
    if (distance > 0 && distance <= 2 && (!best || distance < best.distance)) best = { candidate, distance };
  }
  return best ? `${local}@${best.candidate}` : null;
}
