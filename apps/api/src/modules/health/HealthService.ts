import { inject, injectable } from 'inversify';
import { DataSource } from 'typeorm';
import { ApplicationComponents } from '../../core/di/application-components';
import { IHealthService } from '../../types/common/health-service.interface';
import { HealthStatus } from './dto/health-status';

@injectable()
export class HealthService implements IHealthService {
  public constructor(
    @inject(ApplicationComponents.DataSource) private readonly dataSource: DataSource,
  ) {}

  public async getStatus(): Promise<HealthStatus> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', database: 'up' };
  }
}
