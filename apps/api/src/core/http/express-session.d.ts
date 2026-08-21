import type { SessionUser } from '../../modules/auth/dto/session-user';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
