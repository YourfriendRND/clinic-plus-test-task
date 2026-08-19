import path from 'node:path';
import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: Express): void {
  const spec = swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Clinic Plus API',
        version: '0.0.1',
      },
      tags: [{ name: 'Health' }],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'connect.sid',
          },
        },
      },
    },
    apis: [
      path.join(__dirname, '../../modules/**/*.ts'),
      path.join(__dirname, '../../modules/**/*.js'),
    ],
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
