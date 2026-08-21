import type { TeamView } from '../../modules/teams/dto/team-view';

export interface ITeamService {
  list(): Promise<TeamView[]>;
}
