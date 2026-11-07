import { ReactLenis, useLenis } from 'lenis/react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { prefersReducedMotion } from '@/lib/utils';
import { SignInDialog } from '../auth/SignIn';
import { CommandPalette } from './CommandPalette';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand via-sage to-teal" style={{ scaleX }} />;
}

/** Reset scroll on navigation (Lenis owns scrolling, so use its API). */
function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);
  return null;
}

export function PageLoader() {
  return (
    <div className="grid min-h-[70vh] place-items-center" role="status" aria-label="Loading">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-3 rounded-full bg-brand"
            animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}

export function RootLayout() {
  const smooth = !prefersReducedMotion();

  return (
    <ReactLenis root options={{ lerp: 0.11, smoothWheel: smooth, syncTouch: false }}>
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />
      <main id="main" className="min-h-[80vh]">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CommandPalette />
      <SignInDialog />
    </ReactLenis>
  );
}
