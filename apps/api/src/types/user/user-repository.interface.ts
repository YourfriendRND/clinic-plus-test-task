import type { User } from '../../modules/auth/entities/user';

export interface IUserRepository {
  findByPhone(phone: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
