import { Container } from 'inversify';
import { ApplicationComponents } from './application-components';
import { loadCoreModule } from './modules/core.module';
import { loadAuthModule } from '../../modules/auth/auth-module';
import { HealthService } from '../../modules/health/HealthService';
import { IHealthService } from '../../types/common/health-service.interface';
import '../../modules/health/health-controller';

export async function createContainer(): Promise<Container> {
  const container = new Container();
  await loadCoreModule(container);
  loadAuthModule(container);
  container
    .bind<IHealthService>(ApplicationComponents.HealthService)
    .to(HealthService)
    .inSingletonScope();
  return container;
}
