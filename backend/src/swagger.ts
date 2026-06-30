import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'darsHub API',
      version: '1.0.0',
      description: 'O\'quv markazi boshqaruv tizimi API dokumentatsiyasi'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            full_name: {
              type: 'string',
              example: 'Sarvar Azamov'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'sarvar@gmail.com'
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin'],
              example: 'student'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['full_name', 'email', 'password'],
          properties: {
            full_name: {
              type: 'string',
              example: 'Sarvar Azamov'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'sarvar@gmail.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: '12345678',
              description: 'Minimum 8 ta belgi'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'sarvar@gmail.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: '12345678'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Bu email allaqachon ro\'yxatdan o\'tgan'
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token orqali autentifikatsiya'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Ro\'yxatdan o\'tish va kirish operatsiyalari'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
