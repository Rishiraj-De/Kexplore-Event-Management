import confetti from 'canvas-confetti';
import { prefersReducedMotion } from './utils';

/** Celebrate a successful registration with a two-sided confetti burst in brand colours. */
export function celebrate() {
  if (prefersReducedMotion()) return;
  const colors = ['#c8ff2e', '#7c5cff', '#ff4db8', '#38bdf8', '#ffb020'];
  const end = Date.now() + 900;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors, zIndex: 200 });
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors, zIndex: 200 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 120, spread: 100, startVelocity: 45, origin: { y: 0.55 }, colors, zIndex: 200 });
}

/** Render a ticket DOM node to a PNG and download it. html-to-image is loaded on demand. */
export async function downloadTicketImage(node, code) {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: getComputedStyle(document.body).backgroundColor });
  const a = Object.assign(document.createElement('a'), { href: dataUrl, download: `kexplore-ticket-${code}.png` });
  a.click();
}
