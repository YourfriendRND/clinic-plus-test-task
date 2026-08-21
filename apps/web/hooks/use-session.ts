import { useQuery } from '@tanstack/react-query';
import { getMe } from '../lib/auth-api';
import { queryKeys } from '../lib/query-keys';

export function useSession() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
  });
}
