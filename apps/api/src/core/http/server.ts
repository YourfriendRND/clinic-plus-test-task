import express from 'express';
import type { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import type { AppRedisClient } from '../../types/common/redis';
import { ApplicationComponents } from '../di/application-components';
import { setupSwagger } from '../swagger/setup';
import { createSessionMiddleware } from './session';

export function createHttpServer(container: Container) {
  const redis = container.get<AppRedisClient>(ApplicationComponents.Redis);
  const server = new InversifyExpressServer(container);

  server.setConfig((app) => {
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(createSessionMiddleware(redis));
    setupSwagger(app);
  });

  return server.build();
}
