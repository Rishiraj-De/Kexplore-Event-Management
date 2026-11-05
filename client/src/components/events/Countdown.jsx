import { AnimatePresence, motion } from 'motion/react';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

const pad = (n) => String(n).padStart(2, '0');

function Digit({ value }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Large flip-style countdown (days / hours / minutes / seconds) for the event page. */
export function Countdown({ target, className, onDark = false }) {
  const { days, hours, minutes, seconds, done } = useCountdown(target);
  if (done) return null;

  const units = [
    ['Days', days],
    ['Hours', hours],
    ['Mins', minutes],
    ['Secs', seconds],
  ];

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)} role="timer" aria-label={`${days} days ${hours} hours ${minutes} minutes left`}>
      {units.map(([label, value]) => (
        <div
          key={label}
          className={cn(
            'relative flex flex-col items-center overflow-hidden rounded-2xl border py-3',
            onDark ? 'border-white/15 bg-white/10 text-white backdrop-blur' : 'border-line bg-surface-2',
          )}
        >
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-current opacity-10" />
          <span className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
            {pad(value)
              .split('')
              .map((d, i) => (
                <Digit key={i} value={d} />
              ))}
          </span>
          <span className={cn('mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]', onDark ? 'text-white/60' : 'text-muted')}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Compact inline countdown for cards: "2d 4h 12m". */
export function MiniCountdown({ target, className }) {
  const { days, hours, minutes, seconds, done } = useCountdown(target, { precision: 'second' });
  if (done) return null;
  const text = days > 0 ? `${days}d ${hours}h ${pad(minutes)}m` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return <span className={cn('font-mono tabular-nums', className)}>{text}</span>;
}
