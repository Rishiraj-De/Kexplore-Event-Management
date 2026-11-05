import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessible single-select dropdown (listbox pattern) with keyboard support:
 * ↑/↓ to move, Enter/Space to pick, Esc to close, type-ahead by first letter.
 */
export function Dropdown({ value, onChange, options, label, icon: Icon, className, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    requestAnimationFrame(() => listRef.current?.focus());
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, options, value]);

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    } else if (/^[a-z]$/i.test(e.key)) {
      const idx = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (idx >= 0) setActive(idx);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={label ? `${label}: ${selected.label}` : selected.label}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'ArrowDown' && (e.preventDefault(), setOpen(true))}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:border-fg/25',
          open && 'border-fg/30 ring-4 ring-fg/5',
        )}
      >
        {Icon && <Icon className="size-4 text-muted" aria-hidden />}
        <span className="truncate">{selected.label}</span>
        <ChevronDown className={cn('ml-auto size-4 text-muted transition-transform duration-300', open && 'rotate-180')} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'absolute z-40 mt-2 min-w-full origin-top overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-soft outline-none',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {options.map((opt, i) => (
              <li
                key={opt.value || 'any'}
                id={`${id}-${i}`}
                role="option"
                aria-selected={opt.value === value}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(opt)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors',
                  i === active && 'bg-surface-2',
                  opt.value === value && 'font-semibold',
                )}
              >
                {opt.label}
                {opt.value === value && <Check className="ml-auto size-4 text-accent" aria-hidden />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
