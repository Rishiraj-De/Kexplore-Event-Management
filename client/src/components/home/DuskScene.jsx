import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Low-poly mountain lake at dusk (dawn in light mode), drawn in the brand palette:
 * deep #213843 · teal #468D8B · sage #74B3A8 · cream #F6DAC0 · apricot #FEAF76 · terracotta #DA6D58.
 * The sky, orb and water colours come from CSS variables, so the scene re-tints with the theme.
 */

const W = 1440;
const H = 300; // horizon line inside the 1440 × 420 viewBox

const FAR_RANGE =
  'M0 300 L0 226 L92 204 L170 232 L262 180 L352 222 L452 194 L560 238 L662 208 L760 246 L864 214 L982 170 L1080 202 L1180 142 L1290 188 L1380 160 L1440 178 L1440 300 Z';

const FRONT = { lit: '#da6d58', shade: '#9b4334', cap: '#f6dac0', capShade: '#e6bd9e', glow: '#feaf76', base: '#213843' };
const BACK = { lit: '#b9533f', shade: '#7c3a30', cap: '#f1cfb0', capShade: '#d6a989', glow: '#da6d58', base: '#213843' };

// [apex x, apex y, half base width, apex skew]
const BACK_PEAKS = [
  [230, 214, 170, 18],
  [700, 250, 140, -10],
  [1110, 150, 210, 22],
  [1330, 132, 190, -12],
];
const FRONT_PEAKS = [
  [70, 186, 180, 12],
  [330, 236, 150, -8],
  [1000, 196, 180, -14],
  [1220, 104, 230, 16],
  [1440, 176, 160, -20],
];

function Peak({ x, top, half, skew, c }) {
  const apex = x + skew;
  const h = H - top;
  const mid = apex + half * 0.1;
  return (
    <g>
      <polygon points={`${x - half},${H} ${apex},${top} ${mid},${H}`} fill={c.lit} />
      <polygon points={`${apex},${top} ${x + half},${H} ${mid},${H}`} fill={c.shade} />
      {/* sun-lit facet */}
      <polygon points={`${x - half * 0.72},${H} ${apex - half * 0.28},${top + h * 0.48} ${apex - half * 0.04},${H}`} fill={c.glow} opacity="0.55" />
      {/* snow cap */}
      <polygon points={`${apex},${top} ${apex - half * 0.3},${top + h * 0.36} ${apex - half * 0.06},${top + h * 0.3}`} fill={c.cap} />
      <polygon points={`${apex},${top} ${apex + half * 0.08},${top + h * 0.42} ${apex + half * 0.22},${top + h * 0.3}`} fill={c.capShade} />
      {/* deep shadow at the foot */}
      <polygon points={`${apex + half * 0.18},${H} ${x + half * 0.7},${top + h * 0.72} ${x + half},${H}`} fill={c.base} opacity="0.55" />
    </g>
  );
}

const Range = ({ peaks, c }) => peaks.map(([x, top, half, skew]) => <Peak key={`${x}-${top}`} x={x} top={top} half={half} skew={skew} c={c} />);

// Deterministic star field (dark mode only).
const STARS = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37.3) % 100}%`,
  top: `${(i * 23.7) % 46}%`,
  size: i % 5 === 0 ? 3 : 2,
  delay: `${(i % 7) * 0.45}s`,
}));

export function HeroSky({ className }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-20 grain [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]', className)}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-low) 100%)' }} />
      <div className="absolute inset-0 hidden dark:block">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-cream animate-twinkle"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>
      {/* Moon (dusk) / sun (dawn) */}
      <div className="absolute right-[7%] top-24 animate-float sm:right-[11%] sm:top-28">
        <div
          className="size-16 rounded-full sm:size-28"
          style={{ background: 'var(--orb)', boxShadow: '0 0 60px 24px var(--orb-glow), 0 0 160px 60px var(--orb-glow)' }}
        />
      </div>
    </div>
  );
}

export function DuskScene({ className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const farY = useTransform(scrollYProgress, [0, 1], [-6, 18]);
  const backY = useTransform(scrollYProgress, [0, 1], [-10, 30]);
  const frontY = useTransform(scrollYProgress, [0, 1], [-14, 44]);

  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-0 -z-10', className)}>
      <svg viewBox={`0 0 ${W} 420`} preserveAspectRatio="xMidYMax slice" className="size-full">
        <defs>
          <linearGradient id="kx-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--water-top)' }} />
            <stop offset="1" style={{ stopColor: 'var(--water-bottom)' }} />
          </linearGradient>
          <linearGradient id="kx-reflect-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="kx-reflect-mask">
            <rect x="0" y={H} width={W} height={120} fill="url(#kx-reflect-fade)" />
          </mask>
          <clipPath id="kx-land">
            <rect x="0" y="0" width={W} height={H} />
          </clipPath>
        </defs>

        <g clipPath="url(#kx-land)">
          <motion.path d={FAR_RANGE} style={{ y: farY, fill: 'var(--mtn-far)' }} opacity="0.85" />
          <motion.g style={{ y: backY }}>
            <Range peaks={BACK_PEAKS} c={BACK} />
          </motion.g>
          <motion.g style={{ y: frontY }}>
            <Range peaks={FRONT_PEAKS} c={FRONT} />
          </motion.g>
        </g>

        {/* Lake */}
        <rect x="0" y={H} width={W} height={120} fill="url(#kx-water)" />
        <g mask="url(#kx-reflect-mask)" opacity="0.35">
          <g transform={`translate(0 ${H * 2}) scale(1 -1)`}>
            <Range peaks={FRONT_PEAKS} c={FRONT} />
          </g>
        </g>
        <line x1="0" y1={H} x2={W} y2={H} stroke="#74b3a8" strokeWidth="1.5" opacity="0.9" />
        <g className="animate-drift" opacity="0.4">
          {Array.from({ length: 14 }, (_, i) => {
            const y = H + 8 + i * 8;
            return Array.from({ length: 9 }, (_, j) => {
              const x = ((j * 211 + i * 97) % (W + 120)) - 40;
              const len = 30 + ((i * 13 + j * 29) % 90);
              return <line key={`${i}-${j}`} x1={x} y1={y} x2={x + len} y2={y} stroke="#f6dac0" strokeWidth="1" strokeLinecap="round" opacity={0.15 + ((i + j) % 4) * 0.08} />;
            });
          })}
        </g>

        {/* Sailboat */}
        <g transform={`translate(612 ${H - 2})`}>
          <g className="animate-bob" style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
            <line x1="20" y1="-58" x2="20" y2="0" stroke="#213843" strokeWidth="2" />
            <polygon points="20,-56 20,-4 -10,-4" fill="#213843" />
            <polygon points="22,-48 22,-6 44,-6" fill="#f6dac0" opacity="0.92" />
            <path d="M-14 0 L52 0 L42 9 L-4 9 Z" fill="#213843" />
          </g>
          <ellipse cx="20" cy="14" rx="40" ry="3" fill="#213843" opacity="0.25" />
        </g>
      </svg>
    </div>
  );
}
