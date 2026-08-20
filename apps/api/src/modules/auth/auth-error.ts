import { HttpError } from '../../core/errors/http-error';

export class AuthError extends HttpError {
  public constructor(message: string, code = 401) {
    super(message, code);
  }
}
