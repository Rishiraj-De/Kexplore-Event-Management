import { animate, AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Card that renders a soft radial "spotlight" following the cursor. */
export function SpotlightCard({ as: Tag = 'div', className, children, spotlight = 'rgb(254 175 118 / 0.14)', ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    ref.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };
  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      className={cn('group/spot relative isolate overflow-hidden', className)}
      style={{ '--spot': spotlight }}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--x) var(--y), var(--spot), transparent 45%)' }}
      />
      {children}
    </Tag>
  );
}

/** 3D tilt that follows the pointer, with spring physics. */
export function TiltCard({ className, children, max = 12, ...props }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 18 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Infinite horizontal marquee. Content is duplicated for a seamless loop and pauses on hover. */
export function Marquee({ children, className, reverse = false, duration = 40, gap = '2rem', pauseOnHover = true }) {
  return (
    <div
      className={cn('group/marquee flex overflow-hidden mask-fade-x', className)}
      style={{ '--marquee-duration': `${duration}s`, '--marquee-gap': gap }}
    >
      <div
        className={cn(
          'flex w-max shrink-0 items-center',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'group-hover/marquee:[animation-play-state:paused]',
        )}
        style={{ gap }}
      >
        {children}
        <div aria-hidden className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Animates from 0 to `value` the first time it scrolls into view. */
export function CountUp({ value, duration = 1.8, format = (n) => Math.round(n).toLocaleString('en-IN'), className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {format(display)}
    </span>
  );
}

/** Cycles through words with a blur/slide transition. */
export function WordRotate({ words, interval = 2600, className, colors }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    // Skip ticks while the tab is hidden: animation frames pause there, so exit animations
    // would never finish and the words would pile up on top of each other.
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={cn('relative inline-grid overflow-hidden align-bottom', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: '90%', opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-90%', opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap pb-[0.12em]"
          style={colors ? { color: colors[index % colors.length] } : undefined}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Animated aurora blobs + grid + grain used behind hero sections. */
export function Aurora({ className, intensity = 1 }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden grain', className)}>
      <div className="absolute inset-0 bg-grid mask-radial opacity-60" />
      <div
        className="absolute -left-[10%] -top-[20%] size-[55vmax] rounded-full blur-[110px] animate-aurora will-change-transform"
        style={{ background: 'radial-gradient(circle, rgb(70 141 139 / 0.55), transparent 65%)', opacity: intensity }}
      />
      <div
        className="absolute -right-[15%] top-[5%] size-[45vmax] rounded-full blur-[120px] animate-aurora will-change-transform [animation-delay:-6s]"
        style={{ background: 'radial-gradient(circle, rgb(254 175 118 / 0.32), transparent 65%)', opacity: intensity }}
      />
      <div
        className="absolute bottom-[-30%] left-[25%] size-[45vmax] rounded-full blur-[120px] animate-aurora will-change-transform [animation-delay:-12s]"
        style={{ background: 'radial-gradient(circle, rgb(218 109 88 / 0.32), transparent 65%)', opacity: intensity }}
      />
    </div>
  );
}

/** Fade + rise into view on scroll. */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div', once = true }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Splits a heading into words that rise in sequence. */
export function SplitText({ text, className, delay = 0, stagger = 0.06 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {i < text.split(' ').length - 1 && ' '}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
