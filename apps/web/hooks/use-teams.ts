import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { listTeams } from '../lib/teams-api';

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: listTeams,
  });
}
