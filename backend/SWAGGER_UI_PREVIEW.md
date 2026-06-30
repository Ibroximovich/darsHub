# 🎨 Swagger UI Ko'rinishi

## Swagger Documentation Layout

Swagger UI quyidagi tarzda ko'rinadi:

```
┌─────────────────────────────────────────────────────────────┐
│ darsHub API                                                  │
│ O'quv markazi boshqaruv tizimi API dokumentatsiyasi         │
│ Version: 1.0.0                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SERVERS                                                      │
│ ✓ http://localhost:5000 (Development server)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Authentication                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ POST /api/auth/register                              [Try]  │
│ └─ Yangi foydalanuvchi ro'yxatdan o'tishi                   │
│                                                              │
│    Request body:                                            │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ {                                                   │  │
│    │   "full_name": "Sarvar Azamov",                    │  │
│    │   "email": "sarvar@gmail.com",                     │  │
│    │   "password": "12345678"                           │  │
│    │ }                                                   │  │
│    └─────────────────────────────────────────────────────┘  │
│                                                              │
│    Responses:                                               │
│    ├─ 201 Created                                          │
│    │  {                                                   │
│    │    "success": true,                                │
│    │    "token": "eyJhbGc...",                           │
│    │    "user": {                                        │
│    │      "id": 1,                                       │
│    │      "full_name": "Sarvar Azamov",                │
│    │      "email": "sarvar@gmail.com",                 │
│    │      "role": "student"                            │
│    │    }                                               │
│    │  }                                                 │
│    ├─ 400 Bad Request                                   │
│    │  - Email allaqachon ro'yxatdan o'tgan             │
│    │  - Parol minimum 8 ta belgi bo'lishi kerak        │
│    │  - Email formati noto'g'ri                        │
│    └─ 500 Server Error                                 │
│       {                                                 │
│         "success": false,                             │
│         "message": "Server xatosi"                     │
│       }                                                │
│                                                              │
│ POST /api/auth/login                                 [Try]  │
│ └─ Foydalanuvchi kirishi                                    │
│                                                              │
│    Request body:                                            │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ {                                                   │  │
│    │   "email": "sarvar@gmail.com",                     │  │
│    │   "password": "12345678"                           │  │
│    │ }                                                   │  │
│    └─────────────────────────────────────────────────────┘  │
│                                                              │
│    Responses:                                               │
│    ├─ 200 OK (Success)                                     │
│    ├─ 401 Unauthorized                                    │
│    ├─ 400 Bad Request                                     │
│    └─ 500 Server Error                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SCHEMAS                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ User                                                        │
│ ├─ id: integer                                             │
│ ├─ full_name: string                                       │
│ ├─ email: string (email format)                            │
│ └─ role: string (enum: student, teacher, admin)            │
│                                                              │
│ RegisterRequest                                             │
│ ├─ full_name: string (required)                            │
│ ├─ email: string (required, email format)                  │
│ └─ password: string (required, min 8 chars)                │
│                                                              │
│ SuccessResponse                                             │
│ ├─ success: boolean (true)                                 │
│ ├─ token: string (JWT)                                     │
│ └─ user: User object                                       │
│                                                              │
│ ErrorResponse                                               │
│ ├─ success: boolean (false)                                │
│ └─ message: string (xato xabari)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Swagger UI Features

### 1️⃣ Interactive Testing
- "Try it out" tugmasini bosing
- Request body ni to'ldiring
- "Execute" tugmasini bosing
- Response ni real-time ko'ring

### 2️⃣ Schema Documentation
- Request/Response schemas
- Data types va validations
- Example values

### 3️⃣ Error Documentation
- Status codes
- Error messages
- Error scenarios

### 4️⃣ Authorization
- Bearer Token support
- JWT authentication ready

## 📍 URL
```
http://localhost:5000/api-docs
```

## 🖥️ Screenshot Preview

```
┌─────────────────────────────────────┐
│ darsHub API  v1.0.0                 │
├─────────────────────────────────────┤
│                                     │
│ ┌─ Authentication ─────────────┐    │
│ │                              │    │
│ │ ▼ POST /api/auth/register    │    │
│ │   Try it out |               │    │
│ │                              │    │
│ │ Request body                 │    │
│ │ { "full_name": "...",        │    │
│ │   "email": "...",            │    │
│ │   "password": "..." }        │    │
│ │              [Execute]       │    │
│ │                              │    │
│ │ Response                     │    │
│ │ Status: 201                  │    │
│ │ { "success": true, ... }     │    │
│ │                              │    │
│ └──────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

## 💡 Swagger UI Foydalanish

### Endpoint Test Qilish Jarayoni

1. **Open Swagger UI**
   ```
   http://localhost:5000/api-docs
   ```

2. **Register Section topish**
   - "Authentication" guruhini oching
   - "POST /api/auth/register" ni toping

3. **Try it out bosgani**
   - "Try it out" tugmasini bosing
   - Input fields paydo bo'ladi

4. **Request Body ni to'ldirish**
   ```json
   {
     "full_name": "Sarvar Azamov",
     "email": "sarvar@gmail.com",
     "password": "12345678"
   }
   ```

5. **Execute tugmasini bosing**
   - Request yuboriladi
   - Response darhol ko'rinadi

6. **Response ni ko'rish**
   - Status code
   - Response body
   - Response headers
   - cURL command

## 🔐 Security

Swagger UI quyidagi security features ni o'z ichiga oladi:

✅ Bearer Token support  
✅ API key authentication ready  
✅ CORS enabled  
✅ JWT token validation  

## 📚 Additional Info

- Barcha error cases dokumentlangan
- Examples bilan birga
- TypeScript types integrated
- Auto-updated from code
