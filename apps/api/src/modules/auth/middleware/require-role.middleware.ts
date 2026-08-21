import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { RoleCode } from '../role-code.enum';

export function requireRole(...allowed: RoleCode[]) {
  @injectable()
  class RequireRoleMiddleware extends BaseMiddleware {
    public handler(_request: Request, response: Response, next: NextFunction): void {
      const user = this.httpContext.request.session.user;

      if (!user) {
        response.status(401).json({ error: 'Пользователь не авторизован' });
        return;
      }

      if (!allowed.includes(user.roleCode)) {
        response.status(403).json({ error: 'Недостаточно прав для выполнения действия' });
        return;
      }

      next();
    }
  }

  return RequireRoleMiddleware;
}

export const RequireOperatorMiddleware = requireRole(RoleCode.Operator);
export const RequireTeamMiddleware = requireRole(RoleCode.Team);
