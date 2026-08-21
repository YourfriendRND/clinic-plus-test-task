import path from 'node:path';
import { DataSource } from 'typeorm';
import { loadEnv, getPostgresConfig } from '../config/env';

loadEnv();

const modulesDir = path.join(__dirname, '../../modules');

export function createDataSource(): DataSource {
  const postgres = getPostgresConfig();

  return new DataSource({
    type: 'postgres',
    host: postgres.host,
    port: postgres.port,
    username: postgres.username,
    password: postgres.password,
    database: postgres.database,
    entities: [path.join(modulesDir, '**/entities/*{.ts,.js}')],
    migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: false,
  });
}

export const AppDataSource = createDataSource();
