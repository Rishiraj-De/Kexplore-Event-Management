/**
 * From the 21st.dev "3D Testimonials" component by sean0205 (a Magic UI-style marquee).
 * Converted to JSX; the keyframes are renamed (`marquee-3d-x` / `marquee-3d-y`, see index.css)
 * so they don't clash with the site's existing horizontal marquee.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ariaLabel,
  ariaLive = 'off',
  ariaRole = 'marquee',
  ...props
}) {
  const tracks = useMemo(
    () =>
      Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)]',
            vertical ? 'animate-marquee-3d-y flex-col' : 'animate-marquee-3d-x flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      )),
    [repeat, children, vertical, pauseOnHover, reverse],
  );

  return (
    <div
      {...props}
      data-slot="marquee"
      className={cn('group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]', vertical ? 'flex-col' : 'flex-row', className)}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={ariaRole}
    >
      {tracks}
    </div>
  );
}
