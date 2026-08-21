import type { Container } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { ITeamService } from '../../types/team/team-service.interface';
import { TeamService } from './team-service';
import './team-controller';

export function loadTeamModule(container: Container): void {
  container.bind<ITeamService>(ApplicationComponents.TeamService).to(TeamService).inSingletonScope();
}
