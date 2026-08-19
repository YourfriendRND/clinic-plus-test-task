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
