import { ArrowUpRight, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { CATEGORIES, GITHUB_URL } from '@/lib/constants';
import { rules } from '@/lib/validators';
import { GitHubIcon, InstagramIcon, LinkedInIcon, XIcon } from '../ui/BrandIcons';
import { Logo } from '../ui/Misc';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    const msg = rules.email(email);
    setError(msg);
    if (msg) return;
    toast.success('You’re on the list!', { description: 'We’ll send one email a week with the best events near you.' });
    setEmail('');
  };
  return (
    <form onSubmit={submit} noValidate className="w-full max-w-md">
      <label htmlFor="newsletter" className="text-sm font-semibold">
        The weekly drop
      </label>
      <p className="mt-1 text-sm text-muted">Five hand-picked events, every Friday. No spam.</p>
      <div className={`mt-4 flex items-center gap-2 rounded-full border bg-surface p-1.5 pl-5 transition ${error ? 'border-danger' : 'border-line focus-within:border-fg/30'}`}>
        <input
          id="newsletter"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button type="submit" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition hover:scale-105" aria-label="Subscribe">
          <Send className="size-4" />
        </button>
      </div>
      {error && (
        <p id="newsletter-error" className="mt-2 pl-5 text-xs text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-surface">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="space-y-8">
          <Logo />
          <p className="max-w-sm text-muted">
            Eventon helps you find the events worth leaving the house for — and gets you in the door with a QR ticket in under 30 seconds.
          </p>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link to={`/events?category=${c.id}`} className="hover:text-accent">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/events" className="hover:text-accent">All events</Link></li>
              <li><Link to="/events?when=week" className="hover:text-accent">This week</Link></li>
              <li><Link to="/events?price=free" className="hover:text-accent">Free events</Link></li>
              <li><Link to="/tickets" className="hover:text-accent">My tickets</Link></li>
              <li><Link to="/host" className="hover:text-accent">Host an event</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">Project</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
                  Source code <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li>
                <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
                  Documentation <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li><span className="text-muted">K Explore · Web Designing</span></li>
            </ul>
            <div className="mt-6 flex gap-2">
              {[
                [GitHubIcon, GITHUB_URL, 'GitHub'],
                [XIcon, 'https://x.com', 'X'],
                [InstagramIcon, 'https://instagram.com', 'Instagram'],
                [LinkedInIcon, 'https://linkedin.com', 'LinkedIn'],
              ].map(([Icon, href, label]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-full border border-line transition hover:-translate-y-0.5 hover:bg-fg hover:text-bg">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div aria-hidden className="pointer-events-none select-none px-2">
        <p className="text-gradient animate-gradient-pan text-center font-display text-[24vw] font-extrabold leading-[0.75] tracking-tighter opacity-90 mask-fade-b">
          eventon
        </p>
      </div>

      <div className="container-x flex flex-col items-center justify-between gap-3 border-t border-line py-6 text-xs text-muted sm:flex-row">
        <p>© {year} Eventon. Crafted with React, Tailwind CSS & Motion.</p>
        <p>Images from Unsplash · Dates shown in IST</p>
      </div>
    </footer>
  );
}
