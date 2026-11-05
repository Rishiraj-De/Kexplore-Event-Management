import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '@/lib/utils';

const STORAGE_KEY = 'kexplore:theme';
const ThemeContext = createContext(null);

const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', theme === 'dark' ? '#07070b' : '#f5f3ee');
  });
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readSaved() ?? (systemPrefersDark() ? 'dark' : 'light'));

  // Follow the OS setting until the visitor picks a theme explicitly.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (!readSaved()) {
        const next = e.matches ? 'dark' : 'light';
        applyTheme(next);
        setTheme(next);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /**
   * Toggle with a circular "reveal" that grows from the click position using the
   * View Transitions API. Falls back to an instant switch where unsupported.
   */
  const toggleTheme = useCallback(
    (event) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      const commit = () => {
        applyTheme(next);
        flushSync(() => setTheme(next));
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* storage unavailable */
        }
      };

      if (!document.startViewTransition || prefersReducedMotion()) return commit();

      const x = event?.clientX ?? window.innerWidth - 40;
      const y = event?.clientY ?? 40;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(commit);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      });
    },
    [theme],
  );

  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
