import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { CalendarCheck2, Heart, ShieldCheck, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { GoogleIcon } from '../ui/BrandIcons';
import { Dialog } from '../ui/Dialog';

/** Custom-styled "Continue with Google" using the popup authorization-code flow. */
export function GoogleButton({ className, label = 'Continue with Google' }) {
  const { signIn, isSigningIn } = useAuth();
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: ({ code }) => signIn({ code }),
    onError: () => {},
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={isSigningIn}
      data-autofocus
      className={cn(
        'group relative inline-flex h-13 w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-line bg-surface px-6 font-semibold transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-fg/25 hover:shadow-soft disabled:opacity-60',
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-fg/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <GoogleIcon className="size-5" />
      {isSigningIn ? 'Signing you in…' : label}
    </button>
  );
}

const perks = [
  { icon: Ticket, text: 'Your tickets on every device' },
  { icon: Heart, text: 'Saved events synced to your account' },
  { icon: CalendarCheck2, text: 'Host your own events' },
];

export function SignInDialog() {
  const { dialog, closeSignIn, googleEnabled } = useAuth();
  return (
    <Dialog open={dialog.open} onClose={closeSignIn} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5 grid size-16 place-items-center rounded-2xl bg-brand text-brand-ink">
          <ShieldCheck className="size-8" />
          <span className="absolute -inset-2 -z-10 rounded-3xl bg-brand/30 blur-xl" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Sign in to Kexplore</h2>
        <p className="mt-2 text-sm text-muted">{dialog.reason || 'One tap with Google — no passwords to remember.'}</p>
      </div>
      <ul className="my-6 space-y-2.5">
        {perks.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            <Icon className="size-4 text-accent" /> {text}
          </li>
        ))}
      </ul>
      {googleEnabled ? <GoogleButton /> : <p className="text-center text-sm text-danger">Google sign-in is not configured.</p>}
      <p className="mt-4 text-center text-xs text-muted">We only read your name, email and profile photo.</p>
    </Dialog>
  );
}

/** Google One Tap prompt for signed-out visitors (shown after a short delay). */
export function OneTap() {
  const { user, isLoading, signIn } = useAuth();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useGoogleOneTapLogin({
    onSuccess: ({ credential }) => signIn({ credential }),
    onError: () => {},
    disabled: !ready || isLoading || Boolean(user),
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });
  return null;
}
