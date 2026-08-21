import { apiRequest } from './api';
import type { Team } from './team';

export function listTeams(): Promise<Team[]> {
  return apiRequest<Team[]>('/teams');
}
