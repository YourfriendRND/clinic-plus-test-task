import path from 'node:path';
import { config as loadDotenv } from 'dotenv';

export function loadEnv(): void {
  loadDotenv({ path: path.resolve(process.cwd(), '../../.env') });
}

export function getPostgresConfig() {
  return {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'clinic',
    password: process.env.POSTGRES_PASSWORD ?? 'clinic',
    database: process.env.POSTGRES_DB ?? 'clinic_plus',
  };
}

export function getApiPort(): number {
  return Number(process.env.API_PORT ?? 3001);
}

export function getRedisUrl(): string {
  return process.env.REDIS_URL ?? 'redis://localhost:6379';
}

export function getRabbitMqUrl(): string {
  return process.env.RABBITMQ_URL ?? 'amqp://clinic:clinic@localhost:5672';
}

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? 'dev-session-secret';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isCookieSecure(): boolean {
  return process.env.COOKIE_SECURE === 'true';
}
