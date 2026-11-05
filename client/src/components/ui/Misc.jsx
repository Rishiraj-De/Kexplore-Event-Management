import { Link } from 'react-router';
import { cn, hueFrom, initials } from '@/lib/utils';

// Avatar gradients drawn from the brand palette (all dark enough for white initials).
const AVATAR_GRADIENTS = [
  ['#468d8b', '#213843'],
  ['#da6d58', '#9b4334'],
  ['#ef8e5f', '#b9533f'],
  ['#74b3a8', '#2f6f6d'],
  ['#6fa3c7', '#213843'],
  ['#c4613f', '#7c3a30'],
];

export function Logo({ className, compact = false }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Kexplore home">
      <span className="relative grid size-9 place-items-center rounded-[11px] bg-brand text-brand-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)] transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg] group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
          <path d="M10.5 8v16M22 8.5 13.5 16 22 23.5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24.5" cy="16" r="2" fill="currentColor" />
        </svg>
      </span>
      {!compact && <span className="font-display text-xl font-bold tracking-tight">kexplore</span>}
    </Link>
  );
}

export function Avatar({ name = '', src, size = 40, className }) {
  const [from, to] = AVATAR_GRADIENTS[hueFrom(name) % AVATAR_GRADIENTS.length];
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn('shrink-0 rounded-full object-cover ring-2 ring-bg', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-full font-display font-bold text-white ring-2 ring-bg', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description, action, className, align = 'left' }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-6 bg-current" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">{title}</h2>
        {description && <p className="mt-4 text-lg text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden {...props} />;
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-[28px] border border-dashed border-line px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="relative mb-5 grid size-16 place-items-center rounded-2xl bg-surface-2">
          <Icon className="size-7 text-muted" />
          <span className="absolute -right-1 -top-1 size-4 rounded-full bg-brand" />
        </div>
      )}
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      {description && <p className="mt-2 max-w-md text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Kbd({ children, className }) {
  return (
    <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-2 px-1 font-mono text-[10px] text-muted', className)}>
      {children}
    </kbd>
  );
}
