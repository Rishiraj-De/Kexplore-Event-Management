import { Briefcase, Cpu, Gamepad2, Hammer, HeartHandshake, Music2, Palette, Trophy, UtensilsCrossed } from 'lucide-react';

export const CATEGORIES = [
  { id: 'Tech', label: 'Tech', icon: Cpu, color: '#38bdf8', blurb: 'Hackathons, summits & meetups' },
  { id: 'Music', label: 'Music', icon: Music2, color: '#ff4db8', blurb: 'Festivals, gigs & live sets' },
  { id: 'Workshop', label: 'Workshops', icon: Hammer, color: '#ffb020', blurb: 'Hands-on learning' },
  { id: 'Business', label: 'Business', icon: Briefcase, color: '#34d399', blurb: 'Pitches, bootcamps & careers' },
  { id: 'Sports', label: 'Sports', icon: Trophy, color: '#ff5c39', blurb: 'Marathons, leagues & finals' },
  { id: 'Gaming', label: 'Gaming', icon: Gamepad2, color: '#7c5cff', blurb: 'Esports & LAN parties' },
  { id: 'Arts', label: 'Arts & Culture', icon: Palette, color: '#e879f9', blurb: 'Dance, comedy, books & photo' },
  { id: 'Food', label: 'Food', icon: UtensilsCrossed, color: '#fb923c', blurb: 'Carnivals & masterclasses' },
  { id: 'Community', label: 'Community', icon: HeartHandshake, color: '#a3e635', blurb: 'Volunteering & meetups' },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const WHEN_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'month', label: 'Next 30 days' },
  { value: 'past', label: 'Past events' },
  { value: 'all', label: 'All dates' },
];

export const SORT_OPTIONS = [
  { value: 'date', label: 'Soonest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price', label: 'Price: low → high' },
  { value: 'newest', label: 'Recently added' },
];

export const PRICE_OPTIONS = [
  { value: '', label: 'Any price' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

export const MODE_OPTIONS = [
  { value: '', label: 'Any format' },
  { value: 'offline', label: 'In person' },
  { value: 'online', label: 'Online' },
];

export const GITHUB_URL = 'https://github.com/Rishiraj-De/Kexplore-Event-Management';

/** Curated cover images hosts can pick from on the "Host an event" page. */
export const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
];
