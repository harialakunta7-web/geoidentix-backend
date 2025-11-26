# Smart Attendance Management System - Backend

A production-ready, multi-tenant Smart Attendance Management System built with TypeScript, Node.js, Express, PostgreSQL, Prisma, and AWS services.

## 🏗️ Architecture

This system is designed with a **multi-tenant architecture** where:
- **Tenant**: Represents a company with login credentials and office location
- **Employee**: Belongs to a tenant and can check-in for attendance
- **Attendance**: Records check-in with face verification (AWS Rekognition for paid plans)

### Key Features

- ✅ Multi-tenant architecture with row-level security
- ✅ JWT-based authentication with refresh token rotation
- ✅ Geo-location based attendance verification
- ✅ Face recognition using AWS Rekognition (Paid plan)
- ✅ Embedding-based verification (Free plan)
- ✅ Comprehensive API validation
- ✅ Rate limiting and security middleware
- ✅ Production-ready error handling
- ✅ Structured logging

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- AWS Account (for S3 and Rekognition)
- npm or yarn

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Navigate to project directory
cd smart-attendance-backend

# Install dependencies
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_attendance?schema=public"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_LOCATION_SECRET=your-location-token-secret
JWT_LOCATION_EXPIRY=5m

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name

# Rekognition Configuration
REKOGNITION_SIMILARITY_THRESHOLD=85.0

# Geo-Location Configuration (in meters)
ALLOWED_CHECKIN_RADIUS=100

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Tenant Endpoints

### 1. Register Tenant

**POST** `/tenants/register`

Register a new company/tenant.

**Request Body:**
```json
{
  "tenantName": "Acme Corporation",
  "gst": "29ABCDE1234F1Z5",
  "address": "123 Business Park, Tech City",
  "longitude": 77.5946,
  "latitude": 12.9716,
  "username": "acme_admin",
  "password": "SecurePass@123",
  "planType": "FREE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid",
    "tenant": { /* tenant details */ },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 2. Login Tenant

**POST** `/tenants/login`

**Request Body:**
```json
{
  "username": "acme_admin",
  "password": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "tenantId": "uuid",
    "tenant": { /* tenant details */ },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 3. Refresh Token

**POST** `/tenants/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### 4. Get Profile

**GET** `/tenants/profile`

Requires: `Authorization: Bearer <access_token>`

### 5. Update Profile

**PATCH** `/tenants/profile`

Requires: `Authorization: Bearer <access_token>`

### 6. Logout

**POST** `/tenants/logout`

Requires: `Authorization: Bearer <access_token>`

---

## 👥 Employee Endpoints

All employee endpoints require tenant authentication.

### 1. Register Employee

**POST** `/employees`

**Headers:**
```
Authorization: Bearer <tenant_access_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "photoUrl": "https://s3.amazonaws.com/bucket/photo.jpg",
  "embedding": [0.123, 0.456, 0.789, ...],
  "salary": 50000.00,
  "emergencyContactNumber": "9876543210",
  "contactNumber": "9123456789"
}
```

### 2. List Employees

**GET** `/employees?page=1&limit=10&search=john`

**Headers:**
```
Authorization: Bearer <tenant_access_token>
```

### 3. Get Employee Details

**GET** `/employees/:employeeId`

Returns employee info with last month's attendance records.

### 4. Update Employee

**PATCH** `/employees/:employeeId`

### 5. Delete Employee

**DELETE** `/employees/:employeeId`

---

## ✅ Attendance Endpoints

### 1. Location Check (NO AUTH)

**POST** `/attendance/location-check`

Check if employee is outside office radius.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Response (Outside Radius):**
```json
{
  "success": true,
  "tenantId": "uuid",
  "tenantName": "Acme Corporation",
  "address": "123 Business Park",
  "locationToken": "short_lived_jwt",
  "message": "Location verified. You are outside office premises."
}
```

**Response (Inside Radius):**
```json
{
  "success": false,
  "message": "You are within the office premises. Please proceed with check-in."
}
```

### 2. Check-In

**POST** `/attendance/check-in`

**Request Body:**
```json
{
  "employeeId": "uuid",
  "photoUrl": "https://s3.amazonaws.com/bucket/checkin.jpg",
  "embedding": [0.123, 0.456, ...],
  "locationToken": "token_from_location_check"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendanceId": "uuid",
    "checkInTime": "2024-01-15T09:30:00.000Z",
    "matchConfidence": 92.5
  }
}
```

### 3. Get Employee Attendance

**GET** `/attendance/employee/:employeeId?startDate=2024-01-01&endDate=2024-01-31`

**Headers:**
```
Authorization: Bearer <tenant_access_token>
```

### 4. Get Attendance Report

**GET** `/attendance/report?startDate=2024-01-01&endDate=2024-01-31&employeeId=uuid`

**Headers:**
```
Authorization: Bearer <tenant_access_token>
```

---

## 🔄 Check-In Flow

1. **Employee opens app** and requests to check-in
2. **Location Check** (NO AUTH):
   - App sends employee location to `/attendance/location-check`
   - Backend calculates distance from office
   - If **outside radius**: Returns `locationToken` (valid 5 mins) and company details
   - If **inside radius**: Returns error
3. **Check-In**:
   - **FREE Plan**: Frontend compares embeddings, if match → sends to backend
   - **PAID Plan**: Backend uses AWS Rekognition to verify face
   - Backend validates `locationToken` and creates attendance record

---

## 🔒 Security Features

- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

- **Rate Limiting**:
  - Login endpoints: 5 attempts per 15 minutes
  - API endpoints: 100 requests per minute

- **JWT Tokens**:
  - Access Token: 15 minutes expiry
  - Refresh Token: 7 days expiry (with rotation)
  - Location Token: 5 minutes expiry

- **Multi-Tenant Isolation**:
  - All queries automatically filtered by tenantId
  - Middleware enforces tenant-level access control

---

## 🏗️ Project Structure

```
smart-attendance-backend/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── config/
│   │   ├── index.ts            # Configuration
│   │   └── database.ts         # Prisma client
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # Authentication
│   │   ├── error.middleware.ts # Error handling
│   │   ├── validate.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── modules/
│   │   ├── tenants/
│   │   │   ├── tenant.service.ts
│   │   │   ├── tenant.controller.ts
│   │   │   ├── tenant.routes.ts
│   │   │   └── tenant.validation.ts
│   │   ├── employees/
│   │   │   ├── employee.service.ts
│   │   │   ├── employee.controller.ts
│   │   │   ├── employee.routes.ts
│   │   │   └── employee.validation.ts
│   │   └── attendance/
│   │       ├── attendance.service.ts
│   │       ├── attendance.controller.ts
│   │       ├── attendance.routes.ts
│   │       └── attendance.validation.ts
│   ├── utils/
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── password.ts         # Password hashing
│   │   ├── geoLocation.ts      # Distance calculation
│   │   ├── s3Uploader.ts       # AWS S3
│   │   ├── rekognition.ts      # AWS Rekognition
│   │   ├── validators.ts       # Common validators
│   │   └── logger.ts           # Logging utility
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env.example                # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing the API

Use tools like Postman, Insomnia, or curl to test the API.

### Example: Complete Flow

```bash
# 1. Register Tenant
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

# 2. Register Employee (use access token from step 1)
curl -X POST http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employee",
    "photoUrl": "https://example.com/photo.jpg",
    "embedding": [0.1, 0.2, 0.3],
    "salary": 50000,
    "emergencyContactNumber": "9876543210",
    "contactNumber": "9123456789"
  }'

# 3. Location Check (use employee ID from step 2)
curl -X POST http://localhost:3000/api/attendance/location-check \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_UUID",
    "latitude": 12.9800,
    "longitude": 77.6000
  }'

# 4. Check-In (use location token from step 3)
curl -X POST http://localhost:3000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_UUID",
    "photoUrl": "https://example.com/checkin.jpg",
    "embedding": [0.1, 0.2, 0.3],
    "locationToken": "LOCATION_TOKEN"
  }'
```

---

## 📝 Database Schema

### Tenant
- id (UUID)
- tenantName
- gst (unique)
- address
- longitude, latitude
- username (unique)
- password (hashed)
- planType (FREE/PAID)

### Employee
- id (UUID)
- tenantId (FK)
- name
- photoUrl
- embedding (JSON)
- salary
- emergencyContactNumber
- contactNumber

### Attendance
- id (UUID)
- tenantId (FK)
- employeeId (FK)
- photoUrl
- embedding (JSON)
- checkInTime
- matchConfidence (nullable)

### RefreshToken
- id (UUID)
- tenantId (FK)
- tokenHash
- expiresAt
- isRevoked

---

## 🚀 Deployment

### Production Checklist

1. ✅ Change all secret keys in `.env`
2. ✅ Set `NODE_ENV=production`
3. ✅ Configure production database
4. ✅ Set up AWS credentials
5. ✅ Configure CORS origins
6. ✅ Set up SSL/TLS
7. ✅ Configure logging service
8. ✅ Set up monitoring
9. ✅ Run database migrations: `npm run prisma:deploy`
10. ✅ Build application: `npm run build`
11. ✅ Start with PM2 or similar: `pm2 start dist/server.js`

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db push
```

### Migration Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name
```

### AWS Issues
- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure Rekognition service is enabled in your region

---

## 📄 License

MIT

---

## 🤝 Support

For issues or questions, please create an issue in the repository.

---

## ⚠️ Important Notes

- **NO Admin Users**: Only Tenant and Employee entities exist
- **Tenant Login Only**: All authentication is at tenant level
- **Multi-Tenant**: All data is automatically scoped to tenants
- **Security First**: All endpoints are secured with proper validation
- **Production Ready**: Built with best practices and error handling

---

**Built with ❤️ using TypeScript + Node.js + Express + PostgreSQL + Prisma + AWS**
