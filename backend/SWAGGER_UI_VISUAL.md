# 🎨 Swagger UI Visual Guide

## Swagger UI Screenshot Layout

### Header Section
```
╔════════════════════════════════════════════════════════════════╗
║  🎨 Swagger UI                                                 ║
║                                                                ║
║  darsHub API                                                   ║
║  O'quv markazi boshqaruv tizimi API dokumentatsiyasi           ║
║  Version: 1.0.0                                                ║
║                                                                ║
║  Servers: ✓ http://localhost:5000 (Development server)        ║
╚════════════════════════════════════════════════════════════════╝
```

## API Endpoints Section

### POST /api/auth/register Endpoint

```
┌────────────────────────────────────────────────────────────────┐
│ ▼ POST /api/auth/register                              [Try it out]
│   Yangi foydalanuvchi ro'yxatdan o'tishi
├────────────────────────────────────────────────────────────────┤
│
│ REQUEST BODY (application/json)
│ ─────────────────────────────────
│
│ ┌──────────────────────────────────────────────────────────┐
│ │ {                                                        │
│ │   "full_name": "Sarvar Azamov",                         │
│ │   "email": "sarvar@gmail.com",                          │
│ │   "password": "12345678"                                │
│ │ }                                                        │
│ └──────────────────────────────────────────────────────────┘
│
│ RESPONSES
│ ─────────
│
│ ✓ 201 Created
│   Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi
│
│   ┌──────────────────────────────────────────────────────┐
│   │ {                                                    │
│   │   "success": true,                                  │
│   │   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"   │
│   │            ".eyJpZCI6MSwiZW1haWwiOiJzYXJ2YXJAZ21"   │
│   │            "haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLC"   │
│   │            "JpYXQiOjE3MjQ5MDY5OTcsImV4cCI6MTcyNTU"   │
│   │            "xMTc5N30.Hd4E...",                      │
│   │   "user": {                                         │
│   │     "id": 1,                                        │
│   │     "full_name": "Sarvar Azamov",                  │
│   │     "email": "sarvar@gmail.com",                   │
│   │     "role": "student"                              │
│   │   }                                                 │
│   │ }                                                   │
│   └──────────────────────────────────────────────────────┘
│
│ ✗ 400 Bad Request
│   Xato so'rov (email allaqachon ro'yxatdan o'tgan, ...)
│
│   Misol 1: Email Takrorlanishi
│   ┌──────────────────────────────────────────────────────┐
│   │ {                                                    │
│   │   "success": false,                                 │
│   │   "message": "Bu email allaqachon ro'yxatdan o'tgan"│
│   │ }                                                    │
│   └──────────────────────────────────────────────────────┘
│
│   Misol 2: Parol Qisqa
│   ┌──────────────────────────────────────────────────────┐
│   │ {                                                    │
│   │   "success": false,                                 │
│   │   "message": "Parol minimum 8 ta belgi bo'lishi"   │
│   │              "kerak"                                │
│   │ }                                                    │
│   └──────────────────────────────────────────────────────┘
│
│   Misol 3: Email Formati Noto'g'ri
│   ┌──────────────────────────────────────────────────────┐
│   │ {                                                    │
│   │   "success": false,                                 │
│   │   "message": "Email formati noto'g'ri"              │
│   │ }                                                    │
│   └──────────────────────────────────────────────────────┘
│
│ ✗ 500 Internal Server Error
│   Server xatosi
│
│   ┌──────────────────────────────────────────────────────┐
│   │ {                                                    │
│   │   "success": false,                                 │
│   │   "message": "Server xatosi"                        │
│   │ }                                                    │
│   └──────────────────────────────────────────────────────┘
│
└────────────────────────────────────────────────────────────────┘
```

## Schemas Section

```
╔════════════════════════════════════════════════════════════════╗
║ SCHEMAS                                                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ ▼ User                                                         ║
║   ├─ id (integer, required)                                  ║
║   │  Example: 1                                              ║
║   │                                                          ║
║   ├─ full_name (string, required)                            ║
║   │  Example: "Sarvar Azamov"                                ║
║   │                                                          ║
║   ├─ email (string <email>, required)                        ║
║   │  Example: "sarvar@gmail.com"                             ║
║   │                                                          ║
║   └─ role (string, required)                                 ║
║      Enum: [ "student", "teacher", "admin" ]                ║
║      Example: "student"                                      ║
║                                                                ║
║ ▼ RegisterRequest                                              ║
║   ├─ full_name (string, required)                            ║
║   │  Example: "Sarvar Azamov"                                ║
║   │                                                          ║
║   ├─ email (string <email>, required)                        ║
║   │  Example: "sarvar@gmail.com"                             ║
║   │                                                          ║
║   └─ password (string <password>, required)                  ║
║      Example: "12345678"                                     ║
║      Description: Minimum 8 ta belgi                        ║
║                                                                ║
║ ▼ LoginRequest                                                ║
║   ├─ email (string <email>, required)                        ║
║   │  Example: "sarvar@gmail.com"                             ║
║   │                                                          ║
║   └─ password (string <password>, required)                  ║
║      Example: "12345678"                                     ║
║                                                                ║
║ ▼ SuccessResponse                                              ║
║   ├─ success (boolean, required)                             ║
║   │  Example: true                                          ║
║   │                                                          ║
║   ├─ token (string, required)                                ║
║   │  Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   ║
║   │                                                          ║
║   └─ user (User, required)                                   ║
║      (See User schema above)                                 ║
║                                                                ║
║ ▼ ErrorResponse                                                ║
║   ├─ success (boolean, required)                             ║
║   │  Example: false                                         ║
║   │                                                          ║
║   └─ message (string, required)                              ║
║      Example: "Bu email allaqachon ro'yxatdan o'tgan"        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

## Try It Out Interface

```
╔════════════════════════════════════════════════════════════════╗
║ TRY IT OUT                                                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ REQUEST                                                        ║
║ ─────────────────────────────────────────────────────────────  ║
║                                                                ║
║ URL: POST http://localhost:5000/api/auth/register            ║
║                                                                ║
║ Headers:                                                       ║
║ ┌──────────────────────────────────────────────────────────┐  ║
║ │ Content-Type: application/json                           │  ║
║ └──────────────────────────────────────────────────────────┘  ║
║                                                                ║
║ Body (raw):                                                    ║
║ ┌──────────────────────────────────────────────────────────┐  ║
║ │ {                                                        │  ║
║ │   "full_name": "Sarvar Azamov",                         │  ║
║ │   "email": "sarvar@gmail.com",                          │  ║
║ │   "password": "12345678"                                │  ║
║ │ }                                                        │  ║
║ └──────────────────────────────────────────────────────────┘  ║
║                                          [ Clear ] [ Execute ] ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ RESPONSE                                                       ║
║ ─────────────────────────────────────────────────────────────  ║
║                                                                ║
║ Status: 201 Created                                           ║
║ Execution time: 234 ms                                        ║
║                                                                ║
║ Headers:                                                       ║
║ content-type: application/json                                ║
║ content-length: 1234                                          ║
║                                                                ║
║ Body:                                                          ║
║ ┌──────────────────────────────────────────────────────────┐  ║
║ │ {                                                        │  ║
║ │   "success": true,                                      │  ║
║ │   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..." │  ║
║ │   "user": {                                             │  ║
║ │     "id": 1,                                            │  ║
║ │     "full_name": "Sarvar Azamov",                      │  ║
║ │     "email": "sarvar@gmail.com",                       │  ║
║ │     "role": "student"                                  │  ║
║ │   }                                                     │  ║
║ │ }                                                        │  ║
║ └──────────────────────────────────────────────────────────┘  ║
║                                                                ║
║ cURL:                                                          ║
║ ┌──────────────────────────────────────────────────────────┐  ║
║ │ curl -X POST \"http://localhost:5000/api/auth/register\" │  ║
║ │   -H \"Content-Type: application/json\"                  │  ║
║ │   -d '{\"full_name\":\"Sarvar Azamov\", ...}'            │  ║
║ └──────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

## Color Scheme (Web)

```
✓ Success (201) - Green (#4CAF50)
✗ Error (4xx/5xx) - Red (#F44336)
! Warning/Info (other) - Blue (#2196F3)

Method Colors:
- POST - Orange (#FF9800)
- GET - Blue (#2196F3)
- PUT - Purple (#9C27B0)
- DELETE - Red (#F44336)
```

## Features Available in Swagger UI

✅ **Try It Out** - Inline request testing  
✅ **Schema Validation** - Automatic request validation  
✅ **Response Examples** - Pre-populated examples  
✅ **cURL Generation** - Auto-generated cURL commands  
✅ **Header Support** - Custom headers  
✅ **Authorization** - Bearer token input  
✅ **Response Download** - Save responses  
✅ **Request History** - Recent requests  

## How to Use

1. **Open Swagger UI**
   - Go to: `http://localhost:5000/api-docs`

2. **Find Endpoint**
   - Click on endpoint card
   - Read description and parameters

3. **Try It Out**
   - Click "Try it out" button
   - Fill in request body
   - Click "Execute"

4. **View Response**
   - See status code
   - View response body
   - Check headers
   - Copy cURL command

5. **Repeat**
   - Try different inputs
   - Test error cases
   - Verify responses
