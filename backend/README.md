# darsHub Backend

## O'rnatish

### 1. Dependencies o'rnatish
```bash
cd backend
npm install
```

### 2. Environment variables
`.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:

```
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
PORT=5000
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Database Setup (Supabase)
1. [Supabase](https://supabase.com) da akkaunt yarating
2. Yangi project yarating
3. `DATABASE_URL` ni `.env` faylga qo'shish

### 4. Ishga tushirish

Development rejimida:
```bash
npm run dev
```

Production uchun:
```bash
npm run build
npm start
```

## 📚 API Documentation (Swagger)

Server ishga tushgandan so'ng, Swagger UI ga kiring:

```
http://localhost:5000/api-docs
```

Shu yerda barcha API endpoints larni ko'rib chiqishingiz va test qila olasiz!

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish

### Health Check
- `GET /health` - Server holatini tekshirish

## 📋 Register Endpoint

**POST** `/api/auth/register`

### Request:
```json
{
  "full_name": "Sarvar Azamov",
  "email": "sarvar@gmail.com",
  "password": "12345678"
}
```

### Response (Success - 201):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Sarvar Azamov",
    "email": "sarvar@gmail.com",
    "role": "student"
  }
}
```

### Validatsiyalar:
- ✅ Email formati tekshiriladi
- ✅ Parol minimum 8 ta belgi
- ✅ Email unique (unikal)
- ✅ Barcha maydonlar kerak

Batafsil: [REGISTER_ENDPOINT.md](./REGISTER_ENDPOINT.md)

## 🛠️ Tech Stack
- Node.js + Express
- TypeScript
- PostgreSQL (Supabase)
- JWT Authentication
- bcryptjs (parol shifrlash)
- Swagger/OpenAPI (dokumentatsiya)
