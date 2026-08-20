import type { HealthStatus } from './health-status';

export interface IHealthService {
  getStatus(): Promise<HealthStatus>;
}
