import swaggerJsdoc from 'swagger-jsdoc';

const port = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);
const serverUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'POS Backend API',
      version: '0.1.0',
      description: 'API documentation for the POS backend service',
    },
    servers: [{ url: serverUrl }],
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
  apis: ['src/routes/*.ts'],
} satisfies Parameters<typeof swaggerJsdoc>[0];

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
