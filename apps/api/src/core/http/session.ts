import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { getSessionSecret, isProduction } from '../config/env';
import type { AppRedisClient } from '../../types/common/redis';

export function createSessionMiddleware(redis: AppRedisClient) {
  return session({
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
  });
}
