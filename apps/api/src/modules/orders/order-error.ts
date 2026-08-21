import { HttpError } from '../../core/errors/http-error';

export class OrderError extends HttpError {
  public constructor(message: string, code = 400) {
    super(message, code);
  }
}
