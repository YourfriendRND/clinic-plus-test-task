import type { SessionUser } from '../../types/session/session-user';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
