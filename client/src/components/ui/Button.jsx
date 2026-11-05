import { LoaderCircle } from 'lucide-react';
import { forwardRef } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-brand text-brand-ink hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 font-semibold',
  dark: 'bg-fg text-bg hover:-translate-y-0.5 active:translate-y-0 font-semibold hover:shadow-soft',
  outline: 'border border-line bg-surface/60 text-fg hover:bg-surface-2 hover:border-fg/20 backdrop-blur',
  ghost: 'text-fg hover:bg-surface-2',
  danger: 'bg-danger/10 text-danger border border-danger/25 hover:bg-danger hover:text-white',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-full',
  md: 'h-11 px-5 text-[0.95rem] gap-2 rounded-full',
  lg: 'h-14 px-7 text-base gap-2.5 rounded-full',
  icon: 'size-10 rounded-full',
  'icon-sm': 'size-8 rounded-full',
};

export const buttonClasses = ({ variant = 'primary', size = 'md', className } = {}) =>
  cn(
    'relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap transition-all duration-300 ease-out-expo',
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
    variants[variant],
    sizes[size],
    className,
  );

/**
 * Polymorphic button: renders a router <Link> when `to` is set, an <a> when `href` is set,
 * otherwise a <button>. Shows a spinner while `loading`.
 */
export const Button = forwardRef(function Button(
  { variant, size, className, loading = false, disabled, children, to, href, type = 'button', ...props },
  ref,
) {
  const classes = buttonClasses({ variant, size, className });
  const content = (
    <>
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} target="_blank" rel="noreferrer" {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
      {content}
    </button>
  );
});
