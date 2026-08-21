import type { HealthStatus } from '../../modules/health/dto/health-status';

export interface IHealthService {
  getStatus(): Promise<HealthStatus>;
}
