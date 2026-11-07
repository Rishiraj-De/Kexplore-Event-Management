import { googleLogout } from '@react-oauth/google';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { queryKeys } from '@/hooks/useQueries';
import { endpoints } from '@/lib/api';
import { eventSnapshot, registrationStore, savedStore, toLocalRegistration } from '@/lib/storage';

const AuthContext = createContext(null);

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

/**
 * After signing in, merge the account's data with what this device already has:
 *  • tickets booked on other devices are added to Local Storage
 *  • events saved while signed out are pushed to the account (and vice-versa)
 */
async function syncAccountData() {
  const [{ items: serverTickets }, { items: serverSaved }] = await Promise.all([
    endpoints.myRegistrations(),
    endpoints.bookmarks(),
  ]);
  registrationStore.upsertMany(serverTickets.map((r) => toLocalRegistration(r)));

  const serverIds = new Set(serverSaved.map((e) => e.id));
  const localOnly = savedStore.getAll().filter((e) => !serverIds.has(e.id));
  savedStore.upsertMany(serverSaved.map(eventSnapshot));
  await Promise.allSettled(localOnly.map((e) => endpoints.toggleBookmark(e.id)));
  return serverTickets.length;
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState({ open: false, reason: '' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.me,
    queryFn: endpoints.me,
    staleTime: 10 * 60_000,
    // The whole site sits behind sign-in, so keep trying while the free-tier API wakes up.
    retry: (count, err) => (err?.status === 0 || err?.status >= 500 ? count < 5 : false),
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 10_000),
  });
  const user = data?.user ?? null;

  const welcome = useCallback(
    async (signedIn, how) => {
      queryClient.setQueryData(queryKeys.me, { user: signedIn });
      setDialog({ open: false, reason: '' });
      toast.success(`Welcome, ${signedIn.name.split(' ')[0]}!`, { description: how });
      try {
        const count = await syncAccountData();
        if (count) toast.message('Tickets synced', { description: `${count} ticket(s) from your account are on this device.` });
      } catch {
        /* non-critical */
      }
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRatings });
    },
    [queryClient],
  );

  const signInMutation = useMutation({
    mutationFn: endpoints.googleSignIn,
    onSuccess: ({ user: signedIn }) => welcome(signedIn, 'You’re signed in with Google.'),
    onError: (err) => toast.error('Google sign-in failed', { description: err.message }),
  });

  // Email + password: errors are shown inside the form, so no toast here.
  const passwordMutation = useMutation({
    mutationFn: ({ mode, ...body }) => (mode === 'signup' ? endpoints.signUp(body) : endpoints.passwordSignIn(body)),
    onSuccess: ({ user: signedIn }, { mode }) => welcome(signedIn, mode === 'signup' ? 'Your Eventon account is ready.' : 'You’re signed in.'),
  });

  const signOut = useCallback(async () => {
    try {
      await endpoints.logout();
    } finally {
      googleLogout();
      queryClient.setQueryData(queryKeys.me, { user: null });
      queryClient.removeQueries({ queryKey: queryKeys.myRegistrations });
      queryClient.removeQueries({ queryKey: queryKeys.myRatings });
      toast('Signed out', { description: 'Your tickets stay saved on this device.' });
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isError,
      retry: refetch,
      isSigningIn: signInMutation.isPending || passwordMutation.isPending,
      signIn: signInMutation.mutate,
      passwordAuth: passwordMutation.mutateAsync,
      signOut,
      dialog,
      openSignIn: (reason = '') => setDialog({ open: true, reason }),
      closeSignIn: () => setDialog({ open: false, reason: '' }),
      googleEnabled: Boolean(GOOGLE_CLIENT_ID),
    }),
    [user, isLoading, isError, refetch, signInMutation.isPending, signInMutation.mutate, passwordMutation.isPending, passwordMutation.mutateAsync, signOut, dialog],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
