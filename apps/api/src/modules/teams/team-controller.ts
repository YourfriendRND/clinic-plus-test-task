import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { ApplicationComponents } from '../../core/di/application-components';
import { AbstractController } from '../../core/http/AbstractController';
import { AuthenticatedMiddleware } from '../auth/middleware/authenticated.middleware';
import { RequireOperatorMiddleware } from '../auth/middleware/require-role.middleware';
import type { ITeamService } from '../../types/team/team-service.interface';

@controller('/teams', AuthenticatedMiddleware, RequireOperatorMiddleware)
export class TeamController extends AbstractController {
  public constructor(
    @inject(ApplicationComponents.TeamService) private readonly teamService: ITeamService,
  ) {
    super();
  }

  /**
   * @openapi
   * /teams:
   *   get:
   *     tags: [Teams]
   *     summary: Список бригад
   *     description: Только оператор. Пользователи с ролью team, без пароля.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Список бригад
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Team'
   *       401:
   *         description: Нет сессии
   *       403:
   *         description: Не оператор
   */
  @httpGet('/')
  public async list() {
    return this.ok(await this.teamService.list());
  }
}
