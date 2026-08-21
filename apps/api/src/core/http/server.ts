import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import type { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { getSessionSecret, isProduction } from '../config/env';
import type { AppRedisClient } from '../../types/common/redis';
import { ApplicationComponents } from '../di/application-components';
import { setupSwagger } from '../swagger/setup';

export function createHttpServer(container: Container) {
  const redis = container.get<AppRedisClient>(ApplicationComponents.Redis);
  const server = new InversifyExpressServer(container);

  server.setConfig((app) => {
    app.use(express.json());
    app.use(
      session({
        name: 'connect.sid',
        secret: getSessionSecret(),
        store: new RedisStore({ client: redis, prefix: 'sess:' }),
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          sameSite: 'lax',
          secure: isProduction(),
        },
      }),
    );
    setupSwagger(app);
  });

  return server.build();
}
