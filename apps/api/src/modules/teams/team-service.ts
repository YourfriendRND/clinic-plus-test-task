import { inject, injectable } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import { RoleCode } from '../auth/role-code.enum';
import type { TeamView } from './dto/team-view';
import type { ITeamService } from '../../types/team/team-service.interface';
import type { IUserService } from '../../types/user/user-service.interface';

@injectable()
export class TeamService implements ITeamService {
  public constructor(
    @inject(ApplicationComponents.UserService) private readonly userService: IUserService,
  ) {}

  public async list(): Promise<TeamView[]> {
    const teams = await this.userService.findByRoleCode(RoleCode.Team);

    return teams.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
    }));
  }
}
