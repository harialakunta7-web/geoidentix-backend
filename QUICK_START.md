# 🚀 Quick Start Guide

## What You Have

A **complete, production-ready Smart Attendance Management System** backend with:
- ✅ Multi-tenant architecture
- ✅ JWT authentication with refresh tokens
- ✅ Employee management
- ✅ Geo-location based attendance
- ✅ AWS S3 & Rekognition integration
- ✅ Comprehensive security
- ✅ Full API documentation

## 📁 Project Structure

```
smart-attendance-backend/
├── src/                    # Source code
├── prisma/                 # Database schema
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment template
├── README.md              # Complete API docs
├── DEPLOYMENT.md          # Production guide
├── TROUBLESHOOTING.md     # Problem solving
├── PROJECT_SUMMARY.md     # Architecture overview
├── postman_collection.json # API testing
└── setup.sh               # Quick setup script
```

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AWS Account (for S3 & Rekognition)

### 2. Setup

```bash
cd smart-attendance-backend

# Run setup script
chmod +x setup.sh
./setup.sh

# OR manually:
npm install
cp .env.example .env
# Edit .env with your config
npm run prisma:generate
npm run prisma:migrate
```

### 3. Configure .env

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/attendance"
JWT_ACCESS_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_LOCATION_SECRET=<generate-strong-secret>
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=<your-bucket>
```

### 4. Start Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

### 5. Test API

```bash
curl http://localhost:3000/health
```

## 📚 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Complete API documentation with all endpoints |
| `DEPLOYMENT.md` | Production deployment guide (Heroku, AWS, etc.) |
| `TROUBLESHOOTING.md` | Solutions to common issues |
| `PROJECT_SUMMARY.md` | Architecture and technical overview |
| `postman_collection.json` | Import into Postman for API testing |

## 🎯 Key Features

### 1. No Admin Users
- Only **Tenant** (company) and **Employee** entities
- Tenant handles authentication and management

### 2. Multi-Tenant Isolation
- Automatic row-level security
- Each tenant's data completely isolated
- Middleware enforces tenant boundaries

### 3. Smart Check-In Flow
1. Employee checks location (NO AUTH required)
2. If outside office radius → get location token
3. Capture photo and check-in with token
4. FREE plan: Embedding comparison on frontend
5. PAID plan: AWS Rekognition face verification

## 📊 Database Schema

```
Tenant (Company)
  ├── id, tenantName, gst, address
  ├── longitude, latitude (office location)
  ├── username, password (auth)
  └── planType (FREE/PAID)

Employee
  ├── id, tenantId, name
  ├── photoUrl, embedding (face data)
  ├── salary, contactNumber
  └── emergencyContactNumber

Attendance
  ├── id, tenantId, employeeId
  ├── photoUrl, embedding
  ├── checkInTime
  └── matchConfidence (paid plan)

RefreshToken
  ├── id, tenantId
  ├── tokenHash (hashed)
  ├── expiresAt
  └── isRevoked
```

## 🔐 Security Features

- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT tokens (access: 15m, refresh: 7d)
- ✅ Token rotation
- ✅ Rate limiting (5 login attempts per 15 min)
- ✅ Input validation (Joi)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection protection (Prisma)

## 📝 API Endpoints

### Tenants (6 endpoints)
- POST `/api/tenants/register` - Register company
- POST `/api/tenants/login` - Login
- POST `/api/tenants/refresh-token` - Refresh auth
- GET `/api/tenants/profile` - Get profile
- PATCH `/api/tenants/profile` - Update profile
- POST `/api/tenants/logout` - Logout

### Employees (5 endpoints)
- POST `/api/employees` - Add employee
- GET `/api/employees` - List employees
- GET `/api/employees/:id` - Get details
- PATCH `/api/employees/:id` - Update
- DELETE `/api/employees/:id` - Delete

### Attendance (4 endpoints)
- POST `/api/attendance/location-check` - Check location (NO AUTH)
- POST `/api/attendance/check-in` - Check in
- GET `/api/attendance/employee/:id` - Get records
- GET `/api/attendance/report` - Generate report

## 🧪 Testing

### Using Postman
1. Import `postman_collection.json`
2. Variables auto-update after registration/login
3. Test all endpoints

### Using curl
```bash
# Register tenant
curl -X POST http://localhost:3000/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Company",
    "gst": "29ABCDE1234F1Z5",
    "address": "Test Address",
    "longitude": 77.5946,
    "latitude": 12.9716,
    "username": "testuser",
    "password": "Test@1234"
  }'
```

## 🚀 Deployment

### Quick Deploy Options

1. **Heroku** (easiest)
   ```bash
   heroku create
   heroku addons:create heroku-postgresql
   git push heroku main
   ```

2. **AWS EC2** (flexible)
   - See `DEPLOYMENT.md` for full guide

3. **DigitalOcean** (simple)
   - Use App Platform
   - Connect GitHub
   - Deploy

4. **Render** (modern)
   - Connect repository
   - Auto-deploy on push

## 🛠️ Development

```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database management
npm run prisma:studio    # GUI for database
npm run prisma:migrate   # Run migrations
```

## 📖 Documentation

- **API Docs**: `README.md` - Complete endpoint documentation
- **Deployment**: `DEPLOYMENT.md` - Production deployment guide
- **Troubleshooting**: `TROUBLESHOOTING.md` - Common issues
- **Architecture**: `PROJECT_SUMMARY.md` - Technical overview

## ⚠️ Important Notes

1. **NO Admin Users** - System has only Tenant and Employee
2. **Tenant = Company** - Each tenant is a separate company
3. **Multi-Tenant** - Data automatically isolated by tenant
4. **Location Token** - Short-lived (5 min) for check-in security
5. **One Check-In/Day** - Employees can only check in once per day

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
```

**Migration Failed**
```bash
npm run prisma:migrate reset  # WARNING: Deletes data
```

**AWS Errors**
- Verify AWS credentials in .env
- Check S3 bucket exists
- Ensure Rekognition enabled in region

See `TROUBLESHOOTING.md` for complete guide.

## 💡 Next Steps

1. ✅ Read `README.md` for detailed API documentation
2. ✅ Configure `.env` file
3. ✅ Run `npm run dev` to start server
4. ✅ Import `postman_collection.json` to test APIs
5. ✅ Deploy to production (see `DEPLOYMENT.md`)

## 📞 Support

- Check `TROUBLESHOOTING.md` for solutions
- Review logs: `npm run dev`
- Test with Postman collection
- Verify `.env` configuration

## 🎉 You're Ready!

Everything is set up and ready to go. Start the server and begin building your attendance system!

```bash
npm run dev
```

Visit: `http://localhost:3000/health`

---

**Happy Coding! 🚀**
