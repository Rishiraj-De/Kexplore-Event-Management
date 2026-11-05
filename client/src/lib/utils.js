import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names and resolve Tailwind conflicts. */
export const cn = (...inputs) => twMerge(clsx(inputs));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** "Ananya Mishra" → "AM" */
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/** Deterministic hue from a string — used for generated avatars. */
export const hueFrom = (text = '') => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

/** Smaller Unsplash rendition for cards and thumbnails. */
export const imageAt = (url, width = 800) =>
  url?.includes('images.unsplash.com') ? url.replace(/([?&])w=\d+/, `$1w=${width}`) : url;

export const pluralize = (n, word, plural = `${word}s`) => `${n.toLocaleString('en-IN')} ${n === 1 ? word : plural}`;

export function downloadFile(filename, content, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
