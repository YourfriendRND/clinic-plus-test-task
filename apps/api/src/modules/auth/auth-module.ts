import type { Container } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { IAuthService } from '../../types/session/auth-service.interface';
import type { IUserRepository } from '../../types/user/user-repository.interface';
import { AuthService } from './auth-service';
import { UserRepository } from './user-repository';
import './auth-controller';

export function loadAuthModule(container: Container): void {
  container.bind<IUserRepository>(ApplicationComponents.UserRepository).to(UserRepository).inSingletonScope();
  container.bind<IAuthService>(ApplicationComponents.AuthService).to(AuthService).inSingletonScope();
}
