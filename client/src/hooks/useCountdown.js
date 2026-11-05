import { useEffect, useState } from 'react';

const split = (ms) => {
  const total = Math.max(0, ms);
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
};

/**
 * Live countdown to `target`. Ticks every second (or every minute when `precision="minute"`)
 * and pauses automatically once the target is reached.
 */
export function useCountdown(target, { precision = 'second' } = {}) {
  const targetMs = target ? new Date(target).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetMs || targetMs <= Date.now()) return undefined;
    const step = precision === 'minute' ? 30_000 : 1000;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= targetMs) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [targetMs, precision]);

  return { ...split(targetMs - now), done: targetMs <= now };
}
