import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { ApplicationComponents } from '../../core/di/application-components';
import type { IUserRepository } from '../../types/user/user-repository.interface';
import { User } from './entities/user';

@injectable()
export class UserRepository implements IUserRepository {
  private readonly users: Repository<User>;

  public constructor(@inject(ApplicationComponents.DataSource) dataSource: DataSource) {
    this.users = dataSource.getRepository(User);
  }

  public findByPhone(phone: string): Promise<User | null> {
    return this.users.findOne({ where: { phone }, relations: { role: true } });
  }

  public findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id }, relations: { role: true } });
  }
}
