import { BaseHttpController } from 'inversify-express-utils';

export type SessionUser = {
  uuid: string;
  fullName: string;
  roleCode: 'operator' | 'team';
};

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

  protected get currentUser(): SessionUser | null {
    const request = this.httpContext.request as typeof this.httpContext.request & {
      user?: SessionUser;
    };

    return request.user ?? null;
  }
}
