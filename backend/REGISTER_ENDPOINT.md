# Register Endpoint Dokumentatsiyasi

## Endpoint: POST `/api/auth/register`

### 📋 Request Body

```json
{
  "full_name": "Sarvar Azamov",
  "email": "sarvar@gmail.com",
  "password": "12345678"
}
```

### ✅ Success Response (201 Created)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzYXJ2YXJAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MjQ5MDY5OTcsImV4cCI6MTcyNTUxMTc5N30.Hd4E...",
  "user": {
    "id": 1,
    "full_name": "Sarvar Azamov",
    "email": "sarvar@gmail.com",
    "role": "student"
  }
}
```

### ❌ Error Responses

**1. Email allaqachon ro'yxatdan o'tgan (400 Bad Request)**
```json
{
  "success": false,
  "message": "Bu email allaqachon ro'yxatdan o'tgan"
}
```

**2. Parol minimum 8 ta belgi (400 Bad Request)**
```json
{
  "success": false,
  "message": "Parol minimum 8 ta belgi bo'lishi kerak"
}
```

**3. Email formati noto'g'ri (400 Bad Request)**
```json
{
  "success": false,
  "message": "Email formati noto'g'ri"
}
```

**4. Barcha maydonlar kiritilmagan (400 Bad Request)**
```json
{
  "success": false,
  "message": "Barcha maydonlar to'ldirilishi kerak: email, password, full_name"
}
```

**5. Server xatosi (500 Internal Server Error)**
```json
{
  "success": false,
  "message": "Server xatosi"
}
```

## 🔍 Backend Validatsiyalari

1. ✅ **Email formatini tekshirish** - `name@example.com` formatida bo'lishi kerak
2. ✅ **Parol minimum 8 ta belgi** - `password.length >= 8`
3. ✅ **Email unikal** - Database da bor bo'lsa xato qaytaradi
4. ✅ **Barcha maydonlar kerak** - `email`, `password`, `full_name`
5. ✅ **Parol shifrlash** - bcryptjs bilan 10 salt rounds

## 🔐 JWT Token

Token quyidagi ma'lumotlarni o'z ichiga oladi:
- `id` - Foydalanuvchi ID
- `email` - Email manzili
- `role` - Rol (student, teacher, admin)
- `iat` - Token yaratilgan vaqti
- `exp` - Token amaliyotini tugash vaqti (7 kun)

## 📝 cURL Misoli

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Sarvar Azamov",
    "email": "sarvar@gmail.com",
    "password": "12345678"
  }'
```

## 🧪 Postman Misoli

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`

**Body (JSON):**
```json
{
  "full_name": "Sarvar Azamov",
  "email": "sarvar@gmail.com",
  "password": "12345678"
}
```

## 📚 Swagger UI

Swagger dokumentatsiyasini ko'rish uchun:
```
http://localhost:5000/api-docs
```

Shu yerda barcha endpoint larni test qila olasiz!
