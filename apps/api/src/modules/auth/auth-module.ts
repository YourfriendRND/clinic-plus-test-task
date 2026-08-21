import type { Container } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { IAuthService } from '../../types/session/auth-service.interface';
import type { IUserRepository } from '../../types/user/user-repository.interface';
import type { IUserService } from '../../types/user/user-service.interface';
import { AuthenticatedMiddleware } from './middleware/authenticated.middleware';
import { RequireOperatorMiddleware, RequireTeamMiddleware } from './middleware/require-role.middleware';
import { AuthService } from './auth-service';
import { UserRepository } from './user-repository';
import { UserService } from './user-service';
import './auth-controller';

export function loadAuthModule(container: Container): void {
  container.bind(AuthenticatedMiddleware).toSelf();
  container.bind(RequireOperatorMiddleware).toSelf();
  container.bind(RequireTeamMiddleware).toSelf();
  container.bind<IUserRepository>(ApplicationComponents.UserRepository).to(UserRepository).inSingletonScope();
  container.bind<IUserService>(ApplicationComponents.UserService).to(UserService).inSingletonScope();
  container.bind<IAuthService>(ApplicationComponents.AuthService).to(AuthService).inSingletonScope();
}
