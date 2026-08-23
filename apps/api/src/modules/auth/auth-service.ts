import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { AppRedisClient } from '../../types/common/redis';
import type { IAuthService } from '../../types/session/auth-service.interface';
import type { LoginResult } from './dto/login';
import type { SessionUser } from './dto/session-user';
import type { IUserRepository } from '../../types/user/user-repository.interface';
import { AuthError } from './auth-error';

const TWO_FA_TTL_SECONDS = 300;

type TwoFaPayload = {
  userId: string;
  code: string;
};

@injectable()
export class AuthService implements IAuthService {
  public constructor(
    @inject(ApplicationComponents.UserRepository) private readonly userRepository: IUserRepository,
    @inject(ApplicationComponents.Redis) private readonly redis: AppRedisClient,
  ) {}

  public async login(phone: string, password: string): Promise<LoginResult> {
    const normalizedPhone = phone.replace(/\D/g, '');
    const user = await this.userRepository.findByPhone(normalizedPhone);
    const passwordOk = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordOk) {
      throw new AuthError('Неверный телефон или пароль');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const verificationId = randomUUID();
    const payload: TwoFaPayload = { userId: user.id, code };

    await this.redis.setEx(`2fa:${verificationId}`, TWO_FA_TTL_SECONDS, JSON.stringify(payload));
    console.log(`2FA code for ${normalizedPhone}: ${code}`);

    return { verificationId };
  }

  public async verify(verificationId: string, code: string): Promise<SessionUser> {
    const raw = await this.redis.get(`2fa:${verificationId}`);

    if (!raw) {
      throw new AuthError('Неверный или истёкший код');
    }

    const payload = JSON.parse(raw) as TwoFaPayload;

    if (payload.code !== code) {
      throw new AuthError('Неверный или истёкший код');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new AuthError('Неверный или истёкший код');
    }

    await this.redis.del(`2fa:${verificationId}`);

    return {
      id: user.id,
      fullName: user.fullName,
      roleCode: user.role.code,
    };
  }
}
