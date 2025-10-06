import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fullstack API',
      version: '1.0.0',
      description: 'API documentation for our Node + Prisma backend',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  // path to files that contain OpenAPI definitions (use your module routes)
  apis: ['./src/modules/**/routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ Swagger Docs available at http://localhost:3000/docs');
};
