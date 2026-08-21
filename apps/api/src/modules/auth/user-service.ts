import { inject, injectable } from 'inversify';
import { ApplicationComponents } from '../../core/di/application-components';
import type { RoleCode } from './role-code.enum';
import type { IUserRepository } from '../../types/user/user-repository.interface';
import type { IUserService } from '../../types/user/user-service.interface';
import type { User } from './entities/user';

@injectable()
export class UserService implements IUserService {
  public constructor(
    @inject(ApplicationComponents.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  public findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  public findByRoleCode(code: RoleCode): Promise<User[]> {
    return this.userRepository.findByRoleCode(code);
  }
}
