import type { createRedisClient } from '../../core/redis/client';

export type AppRedisClient = ReturnType<typeof createRedisClient>;
