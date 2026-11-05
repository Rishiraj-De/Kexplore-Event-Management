import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Accessible modal dialog: portal, focus management, Escape to close,
 * background scroll lock (pauses Lenis) and a spring entrance.
 */
export function Dialog({ open, onClose, title, description, children, className, hideClose = false, size = 'md' }) {
  const lenis = useLenis();
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => panelRef.current?.querySelector('[data-autofocus], button, input')?.focus(), 60);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      lenis?.start();
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, lenis]);

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-night/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            data-lenis-prevent
            className={cn(
              'relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-surface p-6 shadow-soft sm:rounded-[28px] sm:p-8',
              widths[size],
              className,
            )}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {!hideClose && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            )}
            {title && (
              <h2 id={titleId} className="pr-10 text-2xl font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="mt-1.5 text-muted">
                {description}
              </p>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
