# 🚀 Quick Reference Guide

## 📍 URLs

| Name | URL |
|---|---|
| **Swagger UI** | http://localhost:5000/api-docs |
| **API Base URL** | http://localhost:5000 |
| **Register Endpoint** | POST http://localhost:5000/api/auth/register |
| **Login Endpoint** | POST http://localhost:5000/api/auth/login |
| **Health Check** | GET http://localhost:5000/health |

## 📦 Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# 3. Start development server
npm run dev

# 4. Open Swagger UI in browser
# http://localhost:5000/api-docs
```

## 📝 Register Request

### JSON Body
```json
{
  "full_name": "Sarvar Azamov",
  "email": "sarvar@gmail.com",
  "password": "12345678"
}
```

### Required Fields
- `full_name` (string) - Foydalanuvchi F.I.Sh
- `email` (string) - Email manzili (unique)
- `password` (string) - Parol (minimum 8 characters)

## ✅ Success Response (201)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...",
  "user": {
    "id": 1,
    "full_name": "Sarvar Azamov",
    "email": "sarvar@gmail.com",
    "role": "student"
  }
}
```

## ❌ Error Responses

### Email Already Exists (400)
```json
{
  "success": false,
  "message": "Bu email allaqachon ro'yxatdan o'tgan"
}
```

### Password Too Short (400)
```json
{
  "success": false,
  "message": "Parol minimum 8 ta belgi bo'lishi kerak"
}
```

### Invalid Email Format (400)
```json
{
  "success": false,
  "message": "Email formati noto'g'ri"
}
```

### Missing Fields (400)
```json
{
  "success": false,
  "message": "Barcha maydonlar to'ldirilishi kerak: email, password, full_name"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server xatosi"
}
```

## 📝 cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Sarvar Azamov",
    "email": "sarvar@gmail.com",
    "password": "12345678"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarvar@gmail.com",
    "password": "12345678"
  }'
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🧪 Testing with Swagger UI

1. Open: http://localhost:5000/api-docs
2. Find: **POST /api/auth/register**
3. Click: **Try it out**
4. Fill Request Body:
   ```json
   {
     "full_name": "Sarvar Azamov",
     "email": "sarvar@gmail.com",
     "password": "12345678"
   }
   ```
5. Click: **Execute**
6. View Response

## 🔐 JWT Token

The returned JWT token contains:
- `id` - User ID
- `email` - User email
- `role` - User role (student/teacher/admin)
- `iat` - Issued at timestamp
- `exp` - Expires at (7 days)

### Using Token in Requests
```bash
curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 Validation Rules

| Field | Rule | Error |
|---|---|---|
| full_name | Required, string | Barcha maydonlar to'ldirilishi kerak |
| email | Required, valid format, unique | Email formati noto'g'ri / Bu email allaqachon ro'yxatdan o'tgan |
| password | Required, min 8 chars | Parol minimum 8 ta belgi bo'lishi kerak |

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Format: postgresql://username:password@host:port/database
```

### Swagger Not Loading
```bash
# Check if server is running
# Visit: http://localhost:5000/health
# Should return: {"status":"OK"}
```

### JWT Secret Not Set
```bash
# Add to .env
JWT_SECRET=your_super_secret_key_here
```

## 📚 Documentation Files

- `README.md` - Setup and overview
- `REGISTER_ENDPOINT.md` - Detailed endpoint docs
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `FILE_CHANGES.md` - File structure changes
- `SWAGGER_UI_PREVIEW.md` - Swagger preview
- `SWAGGER_UI_VISUAL.md` - Visual ASCII guide
- `COMPLETION_CHECKLIST.md` - Implementation checklist

## 🔗 File Locations

```
backend/
├── src/
│   ├── controllers/auth.controller.ts
│   ├── routes/auth.routes.ts
│   ├── middleware/auth.middleware.ts
│   ├── db/index.ts
│   ├── swagger.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

## 🚀 Next Steps

1. ✅ Register endpoint complete
2. ⏳ Login endpoint ready
3. ⏳ Add more endpoints (groups, students)
4. ⏳ Connect with frontend
5. ⏳ Deploy to production

## 💡 Tips

- Always test with Swagger UI first
- Copy cURL commands from Swagger for scripting
- Check console logs for debugging
- Use case-insensitive emails
- Token expires in 7 days
- Password must be at least 8 characters

## 📞 Common Tasks

### Change Server Port
Edit `.env`:
```
PORT=5001
```

### Change JWT Expiration
Edit `src/controllers/auth.controller.ts`:
```typescript
{ expiresIn: '14d' }  // 14 days instead of 7
```

### Add New Validation
Edit `src/controllers/auth.controller.ts` in `register` function

### Update Swagger Docs
Edit `src/routes/auth.routes.ts` JSDoc comments

## ✨ Features

- ✅ Email validation (regex)
- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ Swagger documentation
- ✅ Error handling
- ✅ CORS enabled
- ✅ TypeScript support
- ✅ Uzbek error messages

---

**Status**: 🎉 Ready for use!  
**Last Updated**: 2026-06-29  
**Version**: 1.0.0
