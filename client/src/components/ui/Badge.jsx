import { categoryById } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Badge({ className, children, tone = 'neutral', ...props }) {
  const tones = {
    neutral: 'bg-surface-2 text-fg border-line',
    glass: 'glass text-fg border-white/15',
    brand: 'bg-brand text-brand-ink border-transparent',
    ok: 'bg-success/12 text-success border-success/20',
    warn: 'bg-warn/15 text-warn border-warn/25',
    danger: 'bg-danger/12 text-danger border-danger/25',
    live: 'bg-danger text-white border-transparent',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Category pill with the category's icon and signature colour. */
export function CategoryBadge({ category, className, glass = false }) {
  const cat = categoryById(category);
  const Icon = cat.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        glass ? 'glass border-white/15 text-fg' : 'border-line bg-surface-2 text-fg',
        className,
      )}
    >
      <Icon className="size-3.5" style={{ color: cat.color }} aria-hidden />
      {cat.label}
    </span>
  );
}

export function LiveDot({ className }) {
  return (
    <span className={cn('relative inline-flex size-2', className)} aria-hidden>
      <span className="absolute inset-0 rounded-full bg-current animate-pulse-ring" />
      <span className="relative size-2 rounded-full bg-current" />
    </span>
  );
}
