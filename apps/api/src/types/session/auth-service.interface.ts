import type { LoginResult } from './auth';
import type { SessionUser } from './session-user';

export interface IAuthService {
  login(phone: string, password: string): Promise<LoginResult>;
  verify(verificationId: string, code: string): Promise<SessionUser>;
}
