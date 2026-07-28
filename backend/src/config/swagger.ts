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
    tags: [
      { name: 'Health', description: 'Server holatini tekshirish' },
      { name: 'Auth', description: 'Autentifikatsiya va hisob boshqaruvi' },
      { name: 'Groups', description: 'Guruhlar boshqaruvi' },
      { name: 'Students', description: 'O\'quvchilar va guruh a\'zoligi boshqaruvi' },
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
        CreateGroupRequest: {
          type: 'object',
          required: ['name', 'days', 'time', 'price', 'paymentType'],
          properties: {
            name: { type: 'string', example: 'Frontend React N1' },
            days: {
              type: 'array',
              items: { type: 'string' },
              example: ['monday', 'wednesday', 'friday'],
            },
            time: { type: 'string', example: '15:00' },
            price: { type: 'integer', example: 500000 },
            paymentType: {
              type: 'string',
              enum: ['monthly', 'lesson_based'],
              example: 'monthly',
            },
            lessonsPerCycle: {
              type: 'integer',
              nullable: true,
              example: 12,
              description: 'Faqat paymentType "lesson_based" bo\'lganda majburiy',
            },
          },
        },
        UpdateGroupRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Frontend React N1 (Yangi)' },
            days: {
              type: 'array',
              items: { type: 'string' },
              example: ['tuesday', 'thursday', 'saturday'],
            },
            time: { type: 'string', example: '16:30' },
            price: { type: 'integer', example: 600000 },
            paymentType: {
              type: 'string',
              enum: ['monthly', 'lesson_based'],
              example: 'lesson_based',
            },
            lessonsPerCycle: { type: 'integer', nullable: true, example: 12 },
          },
        },
        GroupResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'd3b07384-d113-46e4-a587-123456789abc' },
            userId: { type: 'string', example: 'u1b07384-d113-46e4-a587-123456789abc' },
            name: { type: 'string', example: 'Frontend React N1' },
            days: { type: 'array', items: { type: 'string' }, example: ['monday', 'wednesday', 'friday'] },
            time: { type: 'string', example: '15:00' },
            price: { type: 'integer', example: 500000 },
            paymentType: { type: 'string', example: 'monthly' },
            lessonsPerCycle: { type: 'integer', nullable: true, example: null },
            studentsCount: { type: 'integer', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AddStudentRequest: {
          type: 'object',
          description: 'Yangi o\'quvchi yoki mavjud o\'quvchini biriktirish',
          properties: {
            studentId: { type: 'string', example: 's1b07384-d113-46e4-a587-123456789abc', description: 'Mavjud o\'quvchini biriktirishda ishlatiladi' },
            firstName: { type: 'string', example: 'Jasur' },
            lastName: { type: 'string', example: 'Karimov' },
            phone: { type: 'string', example: '+998901234567' },
            parentName: { type: 'string', nullable: true, example: 'Otabek Karimov' },
            parentPhone: { type: 'string', example: '+998909876543' },
          },
        },
        UpdateStudentRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Jasur' },
            lastName: { type: 'string', example: 'Karimov' },
            phone: { type: 'string', example: '+998901234567' },
            parentName: { type: 'string', nullable: true, example: 'Otabek Karimov' },
            parentPhone: { type: 'string', example: '+998909876543' },
          },
        },
        StudentResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 's1b07384-d113-46e4-a587-123456789abc' },
            userId: { type: 'string', example: 'u1b07384-d113-46e4-a587-123456789abc' },
            firstName: { type: 'string', example: 'Jasur' },
            lastName: { type: 'string', example: 'Karimov' },
            phone: { type: 'string', example: '+998901234567' },
            parentName: { type: 'string', nullable: true, example: 'Otabek Karimov' },
            parentPhone: { type: 'string', example: '+998909876543' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
      '/api/groups': {
        get: {
          summary: "Foydalanuvchining barcha guruhlarini olish",
          tags: ['Groups'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Guruhlar ro'yxati qaytarildi",
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/GroupResponse' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Avtorizatsiyadan o\'tilmagan' },
          },
        },
        post: {
          summary: 'Yangi guruh yaratish',
          tags: ['Groups'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateGroupRequest' } },
            },
          },
          responses: {
            201: { description: 'Guruh muvaffaqiyatli yaratildi' },
            400: { description: 'Validatsiya xatoligi' },
            401: { description: 'Avtorizatsiyadan o\'tilmagan' },
          },
        },
      },
      '/api/groups/{id}': {
        get: {
          summary: "Bitta guruh ma'lumotlarini olish",
          tags: ['Groups'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Guruh ID-si',
            },
          ],
          responses: {
            200: { description: "Guruh ma'lumotlari qaytarildi" },
            403: { description: "Bu guruhga ruxsatingiz yo'q" },
            404: { description: 'Guruh topilmadi' },
          },
        },
        put: {
          summary: 'Guruh ma\'lumotlarini yangilash',
          tags: ['Groups'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Guruh ID-si',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateGroupRequest' } },
            },
          },
          responses: {
            200: { description: 'Guruh yangilandi' },
            400: { description: 'Validatsiya xatoligi' },
            403: { description: "Bu guruhga ruxsatingiz yo'q" },
            404: { description: 'Guruh topilmadi' },
          },
        },
        delete: {
          summary: "Guruhni o'chirish",
          tags: ['Groups'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Guruh ID-si',
            },
          ],
          responses: {
            200: { description: "Guruh o'chirildi" },
            403: { description: "Bu guruhga ruxsatingiz yo'q" },
            404: { description: 'Guruh topilmadi' },
          },
        },
      },
      '/api/groups/{groupId}/students': {
        get: {
          summary: "Guruhdagi faol o'quvchilar ro'yxati",
          tags: ['Students'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'groupId',
              required: true,
              schema: { type: 'string' },
              description: 'Guruh ID-si',
            },
          ],
          responses: {
            200: { description: "O'quvchilar ro'yxati qaytarildi" },
            403: { description: "Bu guruhga ruxsatingiz yo'q" },
            404: { description: 'Guruh topilmadi' },
          },
        },
        post: {
          summary: "Guruhga o'quvchi qo'shish (Yangi yoki Mavjud)",
          tags: ['Students'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'groupId',
              required: true,
              schema: { type: 'string' },
              description: 'Guruh ID-si',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AddStudentRequest' } },
            },
          },
          responses: {
            201: { description: "O'quvchi guruhga biriktirildi" },
            400: { description: 'Validatsiya xatosi' },
            409: { description: "O'quvchi allaqachon shu guruhda" },
          },
        },
      },
      '/api/groups/{groupId}/students/{studentId}': {
        delete: {
          summary: "O'quvchini guruhdan chiqarish (status: stopped)",
          tags: ['Students'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'groupId',
              required: true,
              schema: { type: 'string' },
            },
            {
              in: 'path',
              name: 'studentId',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: "O'quvchi guruhdan chiqarildi" },
            404: { description: "Guruh yoki o'quvchi topilmadi" },
          },
        },
      },
      '/api/students/search': {
        get: {
          summary: "O'quvchini telefon raqami bo'yicha qidirish",
          tags: ['Students'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'phone',
              schema: { type: 'string' },
              description: 'Qidirilayotgan telefon raqami',
            },
          ],
          responses: {
            200: { description: "Topilgan o'quvchilar ro'yxati" },
          },
        },
      },
      '/api/students/{id}': {
        get: {
          summary: "O'quvchi to'liq profili",
          tags: ['Students'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: "O'quvchi ID-si",
            },
          ],
          responses: {
            200: { description: "O'quvchi profili qaytarildi" },
            403: { description: 'Ruxsat yo\'q' },
            404: { description: "O'quvchi topilmadi" },
          },
        },
        put: {
          summary: "O'quvchi shaxsiy ma'lumotlarini tahrirlash",
          tags: ['Students'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: "O'quvchi ID-si",
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateStudentRequest' } },
            },
          },
          responses: {
            200: { description: "O'quvchi yangilandi" },
            404: { description: "O'quvchi topilmadi" },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
