import 'reflect-metadata';
import { loadEnv, getApiPort } from './core/config/env';
import { createContainer } from './core/di/container';
import { createHttpServer } from './core/http/server';

async function main(): Promise<void> {
  loadEnv();

  const port = getApiPort();
  const container = await createContainer();
  const app = createHttpServer(container);

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    console.log(`Health: http://localhost:${port}/health`);
    console.log(`Swagger: http://localhost:${port}/docs`);
  });
}

main().catch((error: unknown) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
