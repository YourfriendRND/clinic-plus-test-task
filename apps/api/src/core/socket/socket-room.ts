export const OPERATORS_ROOM = 'operators';
export const TEAMS_ROOM = 'teams';

export function createTeamRoom(userId: string): string {
  return `team:${userId}`;
}
