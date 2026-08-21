import { BaseHttpController } from 'inversify-express-utils';
import { HttpError } from '../errors/http-error';
import type { SessionUser } from '../../types/session/session-user';

export abstract class AbstractController extends BaseHttpController {
  protected createdJson<T>(data: T) {
    return this.json(data, 201);
  }

  protected noContent() {
    return this.statusCode(204);
  }

  protected fail(message: string, status = 400) {
    return this.json({ error: message }, status);
  }

  protected fromHttpError(error: unknown) {
    if (error instanceof HttpError) {
      return this.fail(error.message, error.code);
    }

    throw error;
  }

  protected get currentUser(): SessionUser | null {
    return this.httpContext.request.session.user ?? null;
  }
}
