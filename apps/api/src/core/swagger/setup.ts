import path from 'node:path';
import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

function posixGlob(...segments: string[]): string {
  return path.join(__dirname, ...segments).replaceAll('\\', '/');
}

export function setupSwagger(app: Express): void {
  const spec = swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Clinic Plus API',
        version: '0.0.1',
        description: 'API системы нарядов. Сессия - cookie connect.sid, 2FA-код в dev смотрите в логе API.',
      },
      tags: [
        { name: 'Health', description: 'Проверка активности API и PostgreSQL' },
        { name: 'Auth', description: 'Вход, 2FA, сессия и выход' },
        { name: 'Orders', description: 'CRUD нарядов, назначение бригады и смена статуса' },
        { name: 'Teams', description: 'Список бригад. Только для оператора' },
      ],
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
    apis: [posixGlob('../../modules/**/*.ts'), posixGlob('../../modules/**/*.js')],
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true,
      },
    }),
  );
}
