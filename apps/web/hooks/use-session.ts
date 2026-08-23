import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../lib/api-error';
import { getMe } from '../lib/auth-api';
import { queryKeys } from '../lib/query-keys';

export function useSession() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
  });
}
