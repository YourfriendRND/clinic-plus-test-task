export type HealthStatus = {
  status: 'ok';
  database: 'up';
};

export interface IHealthService {
  getStatus(): Promise<HealthStatus>;
}
