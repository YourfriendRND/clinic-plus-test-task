import { inject } from 'inversify';
import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils';
import { ApplicationComponents } from '../../core/di/application-components';
import { AbstractController } from '../../core/http/AbstractController';
import { AuthenticatedMiddleware } from '../auth/middleware/authenticated.middleware';
import { RequireOperatorMiddleware, RequireTeamMiddleware } from '../auth/middleware/require-role.middleware';
import type { AssignOrderDto } from './dto/assign-order';
import type { ChangeOrderStatusDto } from './dto/change-order-status';
import type { CreateOrderDto } from './dto/create-order';
import type { IOrderService } from '../../types/order/order-service.interface';
import type { UpdateOrderDto } from './dto/update-order';

@controller('/orders', AuthenticatedMiddleware)
export class OrderController extends AbstractController {
  public constructor(
    @inject(ApplicationComponents.OrderService) private readonly orderService: IOrderService,
  ) {
    super();
  }

  /**
   * @openapi
   * /orders:
   *   get:
   *     tags: [Orders]
   *     summary: Список нарядов
   *     description: Все наряды. На UI бригада делит их на «Мои» (executor = текущий пользователь) и «Все».
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Список нарядов
   *       401:
   *         description: Нет сессии
   */
  @httpGet('/')
  public async list() {
    if (!this.currentUser) {
      return this.fail('Нужна авторизация', 401);
    }

    return this.ok(await this.orderService.list(this.currentUser));
  }

  /**
   * @openapi
   * /orders:
   *   post:
   *     tags: [Orders]
   *     summary: Создать наряд
   *     description: Только оператор. Статус new, исполнитель пустой. Назначение бригады — отдельный шаг.
   *     security:
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [address, executionDate, description]
   *             properties:
   *               address:
   *                 type: string
   *                 example: ул. Ленина, 10
   *               executionDate:
   *                 type: string
   *                 format: date
   *                 example: "2026-08-21"
   *               description:
   *                 type: string
   *                 example: Подключение оборудования
   *     responses:
   *       201:
   *         description: Наряд создан
   *       400:
   *         description: Невалидные поля
   *       401:
   *         description: Нет сессии
   *       403:
   *         description: Не оператор
   */
  @httpPost('/', RequireOperatorMiddleware)
  public async create() {
    try {
      return this.createdJson(await this.orderService.create(this.httpContext.request.body as CreateOrderDto));
    } catch (error) {
      return this.fromHttpError(error);
    }
  }

  /**
   * @openapi
   * /orders/{id}:
   *   patch:
   *     tags: [Orders]
   *     summary: Изменить наряд
   *     description: Только оператор. Можно передать адрес, дату выполнения и описание. Назначение — PATCH /orders/{id}/assign, статус — PATCH /orders/{id}/status.
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               address:
   *                 type: string
   *               executionDate:
   *                 type: string
   *                 format: date
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Наряд обновлён
   *       400:
   *         description: Невалидные поля
   *       401:
   *         description: Нет сессии
   *       403:
   *         description: Не оператор
   *       404:
   *         description: Наряд не найден
   */
  @httpPatch('/:id', RequireOperatorMiddleware)
  public async update() {
    const id = this.httpContext.request.params.id;

    if (!id) {
      return this.fail('Укажите id наряда', 400);
    }

    try {
      return this.ok(await this.orderService.update(id, this.httpContext.request.body as UpdateOrderDto));
    } catch (error) {
      return this.fromHttpError(error);
    }
  }

  /**
   * @openapi
   * /orders/{id}/assign:
   *   patch:
   *     tags: [Orders]
   *     summary: Назначить бригаду
   *     description: Только оператор. Исполнителем может быть только пользователь с ролью team.
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [executorId]
   *             properties:
   *               executorId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Исполнитель назначен
   *       400:
   *         description: Не бригада или нет executorId
   *       401:
   *         description: Нет сессии
   *       403:
   *         description: Не оператор
   *       404:
   *         description: Наряд или пользователь не найден
   */
  @httpPatch('/:id/assign', RequireOperatorMiddleware)
  public async assign() {
    const id = this.httpContext.request.params.id;

    if (!id) {
      return this.fail('Укажите id наряда', 400);
    }

    try {
      return this.ok(await this.orderService.assign(id, this.httpContext.request.body as AssignOrderDto));
    } catch (error) {
      return this.fromHttpError(error);
    }
  }

  /**
   * @openapi
   * /orders/{id}/status:
   *   patch:
   *     tags: [Orders]
   *     summary: Сменить статус наряда
   *     description: Только назначенная бригада. Переход строго new → in_progress → done.
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [in_progress, done]
   *     responses:
   *       200:
   *         description: Статус обновлён
   *       400:
   *         description: Недопустимый переход статуса
   *       401:
   *         description: Нет сессии
   *       403:
   *         description: Не ваша бригада или не роль team
   *       404:
   *         description: Наряд не найден
   */
  @httpPatch('/:id/status', RequireTeamMiddleware)
  public async changeStatus() {
    if (!this.currentUser) {
      return this.fail('Нужна авторизация', 401);
    }

    const id = this.httpContext.request.params.id;

    if (!id) {
      return this.fail('Укажите id наряда', 400);
    }

    try {
      return this.ok(
        await this.orderService.changeStatus(
          id,
          this.httpContext.request.body as ChangeOrderStatusDto,
          this.currentUser,
        ),
      );
    } catch (error) {
      return this.fromHttpError(error);
    }
  }
}
