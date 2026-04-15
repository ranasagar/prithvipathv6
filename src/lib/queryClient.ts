import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized React Query Configuration
 * Handles caching, stale time, and retry logic for all data fetching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data in cache for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep unused data in cache for 10 minutes before garbage collection
      gcTime: 1000 * 60 * 10,
      // Retry failed requests up to 2 times
      retry: 2,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
