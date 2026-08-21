import type { LoginResult } from '../../modules/auth/dto/login';
import type { SessionUser } from '../../modules/auth/dto/session-user';

export interface IAuthService {
  login(phone: string, password: string): Promise<LoginResult>;
  verify(verificationId: string, code: string): Promise<SessionUser>;
}
