import { Container } from 'inversify';
import { ApplicationComponents } from './application-components';
import { loadCoreModule } from './modules/core.module';
import { HealthService } from '../../modules/health/HealthService';
import type { IHealthService } from '../../modules/health/IHealthService';
import '../../modules/health/HealthController';

export async function createContainer(): Promise<Container> {
  const container = new Container();
  await loadCoreModule(container);
  container
    .bind<IHealthService>(ApplicationComponents.HealthService)
    .to(HealthService)
    .inSingletonScope();
  return container;
}
