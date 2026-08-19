import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { ApplicationComponents } from '../../core/di/application-components';
import { AbstractController } from '../../core/http/AbstractController';
import type { IHealthService } from './IHealthService';

@controller('/health')
export class HealthController extends AbstractController {
  public constructor(
    @inject(ApplicationComponents.HealthService) private readonly healthService: IHealthService,
  ) {
    super();
  }

  /**
   * @openapi
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Проверка API и соединения с PostgreSQL
   *     responses:
   *       200:
   *         description: API жив, Postgres отвечает
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 database:
   *                   type: string
   *                   example: up
   */
  @httpGet('/')
  public async getHealth() {
    return this.ok(await this.healthService.getStatus());
  }
}
