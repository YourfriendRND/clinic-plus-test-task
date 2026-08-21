import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

@injectable()
export class AuthenticatedMiddleware extends BaseMiddleware {
  public handler(_request: Request, response: Response, next: NextFunction): void {
    if (!this.httpContext.request.session.user) {
      response.status(401).json({ error: 'Пользователь не авторизован' });
      return;
    }

    next();
  }
}
