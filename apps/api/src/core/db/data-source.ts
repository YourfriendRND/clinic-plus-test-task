import { DataSource } from 'typeorm';
import { getPostgresConfig } from '../config/env';

export function createDataSource(): DataSource {
  const postgres = getPostgresConfig();

  return new DataSource({
    type: 'postgres',
    host: postgres.host,
    port: postgres.port,
    username: postgres.username,
    password: postgres.password,
    database: postgres.database,
    entities: [],
    synchronize: false,
    logging: false,
  });
}
