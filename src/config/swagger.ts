import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

// Build globs that work in both dev (ts-node) and prod (compiled JS in dist)
const distGlob = path.resolve(__dirname, '../modules/**/routes.js');
const srcGlob = path.resolve(__dirname, '../../src/modules/**/routes.ts');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task API',
      version: '1.0.0',
      description: 'API documentation for Task API with Auth, Users, and Tasks',
    },
    servers: [
      // Relative path works well behind proxies and different hosts (e.g., Retool)
      {
        url: '/api',
        description: 'Relative server (use current host)',
      },
      // Local development convenience
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server',
      },
      // Optional base URL via env when deployed
      ...(process.env.BASE_URL
        ? [
            {
              url: `${process.env.BASE_URL.replace(/\/$/, '')}/api`,
              description: 'Environment BASE_URL server',
            },
          ]
        : []),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Paths to files that contain OpenAPI definitions (TS in dev, JS in prod)
  apis: [srcGlob, distGlob],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express) => {
  // Human-friendly UI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Machine-readable JSON for Retool and other clients
  app.get('/docs.json', (_req, res) => res.json(swaggerSpec));
  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));
  console.log('✅ Swagger Docs available at http://localhost:3000/docs');
  console.log('✅ OpenAPI JSON available at http://localhost:3000/docs.json');
};
