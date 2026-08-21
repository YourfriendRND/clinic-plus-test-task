import { inject } from 'inversify';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { ApplicationComponents } from '../../core/di/application-components';
import { AbstractController } from '../../core/http/AbstractController';
import { IAuthService } from '../../types/session/auth-service.interface';
import { LoginBody } from './dto/login';
import { VerifyBody } from './dto/verify';

@controller('/auth')
export class AuthController extends AbstractController {
  public constructor(
    @inject(ApplicationComponents.AuthService) private readonly authService: IAuthService,
  ) {
    super();
  }

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Вход по телефону и паролю, выдача verificationId для 2FA
   *     description: Проверяет телефон и пароль. При успехе кладёт одноразовый код в Redis (TTL 5 минут) и возвращает verificationId. В dev код пишется в лог API. Сессия ещё не создаётся.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [phone, password]
   *             properties:
   *               phone:
   *                 type: string
   *                 example: "79001111111"
   *               password:
   *                 type: string
   *                 example: password
   *     responses:
   *       200:
   *         description: Нужен код 2FA (в dev смотрите лог API)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [verificationId]
   *               properties:
   *                 verificationId:
   *                   type: string
   *       401:
   *         description: Неверный телефон или пароль
   */
  @httpPost('/login')
  public async login() {
    const body = this.httpContext.request.body as LoginBody;

    if (!body.phone || !body.password) {
      return this.fail('Укажите телефон и пароль', 400);
    }

    try {
      return this.ok(await this.authService.login(body.phone, body.password));
    } catch (error) {
      return this.fromHttpError(error);
    }
  }

  /**
   * @openapi
   * /auth/verify:
   *   post:
   *     tags: [Auth]
   *     summary: Подтверждение 2FA, создание сессии
   *     description: Сверяет код с Redis по verificationId. При успехе создаёт cookie-сессию connect.sid и возвращает профиль. Неверный или просроченный код — 401.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [verificationId, code]
   *             properties:
   *               verificationId:
   *                 type: string
   *               code:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: Сессия создана
   *       401:
   *         description: Неверный или истёкший код
   */
  @httpPost('/verify')
  public async verify() {
    const body = this.httpContext.request.body as VerifyBody;

    if (!body.verificationId || !body.code) {
      return this.fail('Укажите verificationId и code', 400);
    }

    try {
      const user = await this.authService.verify(body.verificationId, body.code);
      const request = this.httpContext.request;

      await new Promise<void>((resolve, reject) => {
        request.session.regenerate((error) => {
          if (error) {
            reject(error);
            return;
          }

          request.session.user = user;
          request.session.save((saveError) => {
            if (saveError) {
              reject(saveError);
              return;
            }

            resolve();
          });
        });
      });

      return this.ok(user);
    } catch (error) {
      return this.fromHttpError(error);
    }
  }

  /**
   * @openapi
   * /auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Выход, удаление сессии
   *     description: Уничтожает серверную сессию в Redis и сбрасывает cookie connect.sid.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       204:
   *         description: Сессия удалена
   */
  @httpPost('/logout')
  public async logout() {
    const request = this.httpContext.request;
    const response = this.httpContext.response;

    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        response.clearCookie('connect.sid');
        resolve();
      });
    });

    return this.noContent();
  }

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Текущий пользователь по сессии
   *     description: Читает профиль из cookie-сессии. Без сессии — 401.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Профиль из сессии
   *       401:
   *         description: Нет сессии
   */
  @httpGet('/me')
  public me() {
    if (!this.currentUser) {
      return this.fail('Нужна авторизация', 401);
    }

    return this.ok(this.currentUser);
  }
}
