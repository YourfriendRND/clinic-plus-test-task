import type { RoleCode } from '../../modules/auth/role-code.enum';
import type { User } from '../../modules/auth/entities/user';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByRoleCode(code: RoleCode): Promise<User[]>;
}
