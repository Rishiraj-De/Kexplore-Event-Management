import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { endpoints } from '@/lib/api';
import { eventSnapshot, savedStore } from '@/lib/storage';
import { useSavedEvents } from './useStores';

/** Toggle an event in the saved list (optimistic) and mirror it to the account when signed in. */
async function toggleSaved(event, user) {
  const snap = eventSnapshot(event);
  const wasSaved = savedStore.get(snap.id) !== null;
  const apply = (save) => (save ? savedStore.upsert({ ...snap, savedAt: new Date().toISOString() }) : savedStore.remove(snap.id));

  apply(!wasSaved);
  toast(wasSaved ? 'Removed from saved events' : 'Saved for later', {
    description: wasSaved ? undefined : user ? 'Synced to your account.' : 'Stored on this device.',
    action: { label: 'Undo', onClick: () => toggleSaved(event, user) },
  });

  if (!user) return;
  try {
    await endpoints.toggleBookmark(snap.id);
  } catch (err) {
    apply(wasSaved);
    toast.error('Couldn’t sync your saved events', { description: err.message });
  }
}

/**
 * Saved events live in Local Storage for everyone, and are mirrored to the
 * user's account when signed in with Google (optimistic update + rollback).
 */
export function useBookmarks() {
  const saved = useSavedEvents();
  const { user } = useAuth();
  const isSaved = useCallback((id) => saved.some((e) => e.id === id), [saved]);
  const toggle = useCallback((event) => toggleSaved(event, user), [user]);
  return { saved, isSaved, toggle };
}
