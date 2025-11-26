# Smart Attendance Management System - Complete Backend

## 🎯 What Is This?

A **production-ready, multi-tenant Smart Attendance Management System** backend built with TypeScript, Node.js, Express, PostgreSQL, Prisma, and AWS services.

### Key Features
- ✅ Multi-tenant architecture (NO admin users)
- ✅ JWT authentication with refresh token rotation
- ✅ Geo-location based attendance verification
- ✅ Face recognition using AWS Rekognition (paid plans)
- ✅ Complete CRUD operations for employees
- ✅ Comprehensive security and validation
- ✅ Production-ready error handling
- ✅ Full API documentation

---

## 📚 Documentation Map

### 🚀 Getting Started
| Document | Description |
|----------|-------------|
| **[QUICK_START.md](./QUICK_START.md)** | **START HERE** - 5-minute setup guide |
| [README.md](./README.md) | Complete API documentation with all endpoints |
| [setup.sh](./setup.sh) | Automated setup script |

### 🏗️ Technical Documentation
| Document | Description |
|----------|-------------|
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Architecture, tech stack, workflows |
| [prisma/schema.prisma](./prisma/schema.prisma) | Database schema definition |
| [package.json](./package.json) | Dependencies and scripts |
| [tsconfig.json](./tsconfig.json) | TypeScript configuration |

### 🚀 Deployment & Operations
| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide (Heroku, AWS, DO) |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |
| [.env.example](./.env.example) | Environment variables template |

### 🧪 Testing
| Document | Description |
|----------|-------------|
| [postman_collection.json](./postman_collection.json) | Complete Postman API collection |

---

## 🗂️ Project Structure

```
smart-attendance-backend/
│
├── 📄 Documentation
│   ├── QUICK_START.md          ⭐ Start here!
│   ├── README.md               📖 Complete API docs
│   ├── DEPLOYMENT.md           🚀 Deploy to production
│   ├── TROUBLESHOOTING.md      🔧 Fix common issues
│   ├── PROJECT_SUMMARY.md      🏗️ Architecture overview
│   └── INDEX.md                📋 This file
│
├── 🔧 Configuration
│   ├── .env.example            🔐 Environment template
│   ├── package.json            📦 Dependencies
│   ├── tsconfig.json           ⚙️ TypeScript config
│   └── setup.sh                🎯 Quick setup script
│
├── 🗄️ Database
│   └── prisma/
│       └── schema.prisma       📊 Database schema
│
├── 💻 Source Code
│   └── src/
│       ├── config/             ⚙️ Configuration
│       ├── middlewares/        🛡️ Auth, validation, errors
│       ├── modules/            📁 Feature modules
│       │   ├── tenants/        🏢 Company management
│       │   ├── employees/      👥 Employee management
│       │   └── attendance/     ✅ Attendance system
│       ├── utils/              🔧 Utilities (JWT, AWS, etc)
│       ├── app.ts              🌐 Express app
│       └── server.ts           🚀 Entry point
│
└── 🧪 Testing
    └── postman_collection.json  📮 API tests
```

---

## ⚡ Quick Commands

```bash
# Setup
npm install                    # Install dependencies
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run database migrations

# Development
npm run dev                   # Start dev server (hot reload)
npm run prisma:studio         # Open database GUI

# Production
npm run build                 # Build for production
npm start                     # Start production server

# Database
npm run prisma:migrate        # Run migrations
npm run prisma:migrate reset  # Reset database (WARNING!)
```

---

## 🎯 Core Entities

### 1. Tenant (Company)
- Represents a company/organization
- **Authentication entity** (login credentials)
- Stores office location for geo-verification
- Has FREE or PAID plan
- **NO separate admin users**

### 2. Employee
- Belongs to a tenant
- Stores face photo and embedding
- Can check-in for attendance
- Tracked salary and contact info

### 3. Attendance
- Records employee check-ins
- Linked to both tenant and employee
- Stores check-in photo and time
- Includes match confidence (paid plans)

---

## 🔄 Key Workflows

### Tenant Registration
```
Register → Validate → Hash Password → Create DB → Generate Tokens → Return
```

### Employee Check-In
```
Location Check → Outside Radius? → Get Token → Capture Photo 
→ Face Verification → Not Already Checked In? → Save Attendance
```

### Token Refresh
```
Refresh Token → Verify → Revoke Old → Generate New → Return
```

---

## 📊 API Overview

### 15 Total Endpoints

**Tenants (6)**
- Register, Login, Refresh, Profile, Update, Logout

**Employees (5)**
- Create, List, Get, Update, Delete

**Attendance (4)**
- Location Check, Check-In, Get Records, Generate Report

---

## 🔐 Security Features

- ✅ Password requirements (8+ chars, upper, lower, number, special)
- ✅ JWT tokens (access: 15m, refresh: 7d, location: 5m)
- ✅ Token rotation on refresh
- ✅ Rate limiting (5 login attempts per 15 min)
- ✅ Bcrypt hashing (12 rounds)
- ✅ Input validation with Joi
- ✅ CORS and Helmet protection
- ✅ Multi-tenant data isolation

---

## 🚀 Deployment Options

1. **Heroku** - Easiest, one-click deploy
2. **AWS EC2** - Full control, scalable
3. **DigitalOcean** - Simple, affordable
4. **Render** - Modern, automatic deploys
5. **Railway** - Fast, developer-friendly

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides.

---

## 🧪 Testing the API

### Option 1: Postman
1. Import `postman_collection.json`
2. Variables auto-update
3. Test all endpoints

### Option 2: Curl
```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/tenants/register -H "Content-Type: application/json" -d '{...}'
```

---

## 📖 Learning Path

### Beginner
1. Read [QUICK_START.md](./QUICK_START.md)
2. Run `setup.sh`
3. Test with Postman
4. Explore `README.md` API docs

### Intermediate
1. Study [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Review source code structure
3. Understand workflows
4. Customize for your needs

### Advanced
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Deploy to production
3. Set up monitoring
4. Scale as needed

---

## ❓ Common Questions

**Q: Is there an admin user?**
A: No. Only Tenant (company) and Employee entities exist.

**Q: Can employees from different companies access each other's data?**
A: No. Multi-tenant isolation ensures complete data separation.

**Q: How does face recognition work?**
A: FREE plan uses embeddings (frontend), PAID plan uses AWS Rekognition.

**Q: Can I customize the geo-fence radius?**
A: Yes. Set `ALLOWED_CHECKIN_RADIUS` in `.env` (in meters).

**Q: How do I handle check-in outside office?**
A: System issues a location token when employee is outside radius.

---

## 🆘 Need Help?

1. **Setup Issues** → [QUICK_START.md](./QUICK_START.md)
2. **API Questions** → [README.md](./README.md)
3. **Errors** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **Deployment** → [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Architecture** → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 📦 What's Included

- ✅ Complete source code (TypeScript)
- ✅ Database schema (Prisma)
- ✅ API documentation
- ✅ Deployment guides
- ✅ Troubleshooting guide
- ✅ Postman collection
- ✅ Setup automation
- ✅ Environment template
- ✅ Security best practices
- ✅ Error handling
- ✅ Logging system
- ✅ AWS integration

---

## 🎉 Get Started Now!

```bash
# 1. Setup
cd smart-attendance-backend
./setup.sh

# 2. Start
npm run dev

# 3. Test
curl http://localhost:3000/health
```

**Ready to build your attendance system!** 🚀

---

## 📞 Quick Links

- [⚡ Quick Start Guide](./QUICK_START.md)
- [📖 Complete API Docs](./README.md)
- [🚀 Deployment Guide](./DEPLOYMENT.md)
- [🔧 Troubleshooting](./TROUBLESHOOTING.md)
- [🏗️ Architecture](./PROJECT_SUMMARY.md)

---

**Version**: 1.0.0  
**Built with**: TypeScript + Node.js + Express + PostgreSQL + Prisma + AWS  
**Status**: Production Ready ✅
