import { useSyncExternalStore } from 'react';
import { recentStore, registrationStore, savedStore } from '@/lib/storage';

const useStore = (store) => useSyncExternalStore(store.subscribe, store.getSnapshot, () => []);

/** All registrations cached in Local Storage on this device (newest first). */
export const useLocalRegistrations = () => useStore(registrationStore);
export const useSavedEvents = () => useStore(savedStore);
export const useRecentEvents = () => useStore(recentStore);
