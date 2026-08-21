import { inject } from 'inversify';
import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils';
import { ApplicationComponents } from '../../core/di/application-components';
import { AbstractController } from '../../core/http/AbstractController';
import { AuthenticatedMiddleware } from '../auth/middleware/authenticated.middleware';
import { RequireOperatorMiddleware } from '../auth/middleware/require-role.middleware';
import type { CreateOrderDto } from '../../types/order/create-order';
import type { IOrderService } from '../../types/order/order-service.interface';
import type { UpdateOrderDto } from '../../types/order/update-order';

// Авторизация глобально на контроллер
@controller('/orders', AuthenticatedMiddleware)
export class OrdersController extends AbstractController {
  public constructor(
    @inject(ApplicationComponents.OrderService) private readonly orders: IOrderService,
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

    return this.ok(await this.orders.list(this.currentUser));
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
      return this.createdJson(await this.orders.create(this.httpContext.request.body as CreateOrderDto));
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
   *     description: Только оператор. Можно передать адрес, дату выполнения и описание. Статус и исполнитель здесь не меняются.
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
      return this.ok(await this.orders.update(id, this.httpContext.request.body as UpdateOrderDto));
    } catch (error) {
      return this.fromHttpError(error);
    }
  }
}
