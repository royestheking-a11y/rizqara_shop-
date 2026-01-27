import { useStore } from '@/app/context/StoreContext';

/**
 * A safe wrapper around useStore that handles hot reload gracefully
 * Returns null if the store is not available yet
 */
export function useSafeStore() {
  try {
    return useStore();
  } catch (error) {
    // During hot reload, context might not be available yet
    // Return null and let components handle the loading state
    if (process.env.NODE_ENV === 'development') {
      console.warn('Store context not available yet (likely due to hot reload)');
    }
    return null;
  }
}
