import type { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { getRedisUrl } from '../../config/env';
import { AppDataSource } from '../../db/data-source';
import { EventBus } from '../../rabbitmq/event-bus';
import { NotificationGateway } from '../../socket/notification-gateway';
import { createRedisClient } from '../../redis/client';
import type { IEventBus } from '../../../types/common/event-bus.interface';
import type { INotificationGateway } from '../../../types/common/notification-gateway.interface';
import type { AppRedisClient } from '../../../types/common/redis';
import { ApplicationComponents } from '../application-components';

export async function loadCoreModule(container: Container): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const redis = createRedisClient(getRedisUrl());
  await redis.connect();

  container.bind<DataSource>(ApplicationComponents.DataSource).toConstantValue(AppDataSource);
  container.bind<AppRedisClient>(ApplicationComponents.Redis).toConstantValue(redis);
  container.bind<IEventBus>(ApplicationComponents.EventBus).to(EventBus).inSingletonScope();
  container
    .bind<INotificationGateway>(ApplicationComponents.NotificationGateway)
    .to(NotificationGateway)
    .inSingletonScope();
  await container.get<IEventBus>(ApplicationComponents.EventBus).connect();
}
