import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/client';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // One retry for gateway hiccups (5xx); client errors are final.
        retry: (count, error) => error instanceof ApiError && error.status >= 500 && count < 1,
        retryDelay: 700,
      },
    },
  });
}
