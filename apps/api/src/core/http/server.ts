import express from 'express';
import type { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { setupSwagger } from '../swagger/setup';

export function createHttpServer(container: Container) {
  const server = new InversifyExpressServer(container);

  server.setConfig((app) => {
    app.use(express.json());
    setupSwagger(app);
  });

  return server.build();
}
