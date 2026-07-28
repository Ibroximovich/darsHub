import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DarsHub API Documentation',
      version: '1.0.0',
      description: 'Yakka repetitorlar uchun boshqaruv platformasi — REST API hujjatlari',
      contact: {
        name: 'DarsHub Dev Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'phone', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Ali Valiyev' },
            email: { type: 'string', format: 'email', example: 'ali@example.com' },
            phone: { type: 'string', example: '+998901234567' },
            password: { type: 'string', format: 'password', example: 'parol123' },
          },
        },
        VerifyEmailRequest: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ali@example.com' },
            code: { type: 'string', example: '123456' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ali@example.com' },
            password: { type: 'string', format: 'password', example: 'parol123' },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ali@example.com' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['email', 'code', 'newPassword'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ali@example.com' },
            code: { type: 'string', example: '123456' },
            newPassword: { type: 'string', format: 'password', example: 'yangiParol123' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Xatolik matni' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Server holatini tekshirish (Health Check)',
          tags: ['Health'],
          responses: {
            200: { description: 'Server muammosiz ishlayapti' },
          },
        },
      },
      '/api/auth/register': {
        post: {
          summary: "Yangi foydalanuvchini ro'yxatdan o'tkazish",
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
            },
          },
          responses: {
            201: { description: "Ro'yxatdan o'tildi, emailga kod yuborildi" },
            400: { description: 'Validatsiya xatosi' },
          },
        },
      },
      '/api/auth/verify-email': {
        post: {
          summary: 'Email tasdiqlash kodi orqali',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailRequest' } },
            },
          },
          responses: {
            200: { description: 'Email tasdiqlandi va JWT tokenlar berildi' },
            400: { description: 'Kod noto\'g\'ri yoki muddati o\'tgan' },
          },
        },
      },
      '/api/auth/resend-code': {
        post: {
          summary: 'Emailga tasdiqlash kodini qayta yuborish',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } },
            },
          },
          responses: {
            200: { description: 'Yangi kod emailga yuborildi' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Tizimga kirish (Login)',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
            },
          },
          responses: {
            200: { description: 'Tizimga kirildi, JWT access token va HttpOnly refresh cookie berildi' },
            401: { description: "Email yoki parol noto'g'ri" },
          },
        },
      },
      '/api/auth/forgot-password': {
        post: {
          summary: 'Parolni unutganda OTP kod yuborish so\'rovi',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } },
            },
          },
          responses: {
            200: { description: 'Kod yuborildi xabari qaytariladi' },
          },
        },
      },
      '/api/auth/reset-password': {
        post: {
          summary: 'OTP kod va yangi parol orqali parolni yangilash',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } },
            },
          },
          responses: {
            200: { description: 'Parol muvaffaqiyatli yangilandi' },
            400: { description: 'Kod noto\'g\'ri yoki muddati o\'tgan' },
          },
        },
      },
      '/api/auth/resend-reset-code': {
        post: {
          summary: 'Parolni tiklash kodini qayta yuborish',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } },
            },
          },
          responses: {
            200: { description: 'Yangi tiklash kodi yuborildi' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          summary: "Cookie'dagi Refresh token orqali yangi Access token olish",
          tags: ['Auth'],
          responses: {
            200: { description: 'Yangi access token berildi' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: "Tizimdan chiqish",
          tags: ['Auth'],
          responses: {
            200: { description: 'Chiqildi' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: "Joriy foydalanuvchi ma'lumotlarini olish (Himoyalangan route)",
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Foydalanuvchi ma'lumotlari qaytarildi" },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
