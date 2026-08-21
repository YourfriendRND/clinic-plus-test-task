import type { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { getRedisUrl } from '../../config/env';
import { AppDataSource } from '../../db/data-source';
import { createRedisClient } from '../../redis/client';
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
}
