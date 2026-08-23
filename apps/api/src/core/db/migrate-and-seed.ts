import 'reflect-metadata';
import { loadEnv } from '../config/env';
import { AppDataSource } from './data-source';
import { seedDatabase } from './seed';

async function main(): Promise<void> {
  loadEnv();

  await AppDataSource.initialize();
  await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  const migrations = await AppDataSource.runMigrations();
  console.log(`Migrations applied: ${migrations.length}`);
  await seedDatabase(AppDataSource);
  await AppDataSource.destroy();
}

main().catch((error: unknown) => {
  console.error('Migrate and seed failed', error);
  process.exit(1);
});
