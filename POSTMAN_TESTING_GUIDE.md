# 🧪 Complete Postman Testing Guide

## Smart Attendance Management System - API Testing

This guide will walk you through testing all 15 API endpoints step-by-step before starting frontend development.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Testing Flow](#testing-flow)
3. [Tenant APIs](#tenant-apis-6-endpoints)
4. [Employee APIs](#employee-apis-5-endpoints)
5. [Attendance APIs](#attendance-apis-4-endpoints)
6. [Testing Checklist](#testing-checklist)

---

## Setup

### Step 1: Start Your Server

```bash
cd smart-attendance-backend
npm run dev
```

Wait for: `🚀 Smart Attendance Management System is ready!`

### Step 2: Import Postman Collection

1. Open Postman
2. Click **Import** → Select `postman_collection.json`
3. Collection appears in left sidebar

### Step 3: Create Environment

1. Click **Environments** → **Create Environment**
2. Name: `Smart Attendance - Local`
3. Add variables:

| Variable | Initial Value |
|----------|---------------|
| `baseUrl` | `http://localhost:3000/api` |
| `accessToken` | (empty) |
| `refreshToken` | (empty) |
| `tenantId` | (empty) |
| `employeeId` | (empty) |
| `locationToken` | (empty) |

4. Save and select environment

---

## Testing Flow

```
Register Tenant → Login → Register Employee → Location Check → Check-In → View Reports
```

---

## Tenant APIs (6 endpoints)

### 1. Register Tenant ✅

**POST** `{{baseUrl}}/tenants/register`

**Body:**
```json
{
  "tenantName": "Tech Innovations Pvt Ltd",
  "gst": "29ABCDE1234F1Z5",
  "address": "123 Tech Park, Whitefield, Bangalore - 560066",
  "longitude": 77.7499,
  "latitude": 12.9698,
  "username": "techinnovations",
  "password": "SecurePass@123",
  "planType": "FREE"
}
```

**Expected:** 201 Created
- ✅ Returns tenantId, accessToken, refreshToken
- ✅ Variables auto-saved

**Test:**
- [ ] Register succeeds
- [ ] Duplicate username fails (409)
- [ ] Invalid GST fails (400)
- [ ] Weak password fails (400)

---

### 2. Login Tenant 🔐

**POST** `{{baseUrl}}/tenants/login`

**Body:**
```json
{
  "username": "techinnovations",
  "password": "SecurePass@123"
}
```

**Expected:** 200 OK
- ✅ Returns new tokens

**Test:**
- [ ] Login succeeds
- [ ] Wrong password fails (401)
- [ ] 6th attempt blocked (429 - Rate limited)

---

### 3. Refresh Token 🔄

**POST** `{{baseUrl}}/tenants/refresh-token`

**Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected:** 200 OK
- ✅ Old token revoked
- ✅ New tokens issued

---

### 4. Get Profile 👤

**GET** `{{baseUrl}}/tenants/profile`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Expected:** 200 OK
- ✅ Returns tenant details

---

### 5. Update Profile ✏️

**PATCH** `{{baseUrl}}/tenants/profile`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Body:**
```json
{
  "tenantName": "Tech Innovations Private Limited",
  "planType": "PAID"
}
```

**Expected:** 200 OK

---

### 6. Logout 🚪

**POST** `{{baseUrl}}/tenants/logout`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected:** 200 OK

---

## Employee APIs (5 endpoints)

### 7. Register Employee 👥

**POST** `{{baseUrl}}/employees`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Body:**
```json
{
  "name": "Rajesh Kumar",
  "photoUrl": "https://example.com/photos/rajesh.jpg",
  "embedding": [0.123, 0.456, 0.789, 0.321, 0.654, 0.987, 0.147, 0.258],
  "salary": 50000.00,
  "emergencyContactNumber": "9876543210",
  "contactNumber": "9123456789"
}
```

**Expected:** 201 Created
- ✅ employeeId auto-saved

**Test:**
- [ ] Employee created
- [ ] Invalid phone fails (400)
- [ ] Empty embedding fails (400)

---

### 8. List Employees 📋

**GET** `{{baseUrl}}/employees?page=1&limit=10&search=Rajesh`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Expected:** 200 OK with pagination

---

### 9. Get Employee Details 🔍

**GET** `{{baseUrl}}/employees/{{employeeId}}`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Expected:** 200 OK
- ✅ Employee details
- ✅ Last month's attendance

---

### 10. Update Employee ✏️

**PATCH** `{{baseUrl}}/employees/{{employeeId}}`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Body:**
```json
{
  "name": "Rajesh Kumar Singh",
  "salary": 55000.00
}
```

**Expected:** 200 OK

---

### 11. Delete Employee 🗑️

**DELETE** `{{baseUrl}}/employees/{{employeeId}}`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Expected:** 200 OK

⚠️ **Warning:** Cannot undo!

---

## Attendance APIs (4 endpoints)

### 12. Location Check 📍 (NO AUTH)

**POST** `{{baseUrl}}/attendance/location-check`

**⭐ NO Authorization Header Required!**

**Body (Outside Office):**
```json
{
  "employeeId": "{{employeeId}}",
  "latitude": 12.9800,
  "longitude": 77.7600
}
```

**Expected:** 200 OK
```json
{
  "success": true,
  "tenantId": "...",
  "tenantName": "Tech Innovations Pvt Ltd",
  "locationToken": "eyJ...",
  "message": "Location verified. You are outside office premises."
}
```

**Body (Inside Office):**
```json
{
  "employeeId": "{{employeeId}}",
  "latitude": 12.9698,
  "longitude": 77.7499
}
```

**Expected:** 200 OK
```json
{
  "success": false,
  "message": "You are within the office premises."
}
```

**Test:**
- [ ] Outside radius → Get token
- [ ] Inside radius → Blocked
- [ ] locationToken auto-saved

**Coordinate Guide:**
- **Office:** lat: 12.9698, lon: 77.7499
- **Outside (100m+):** lat: 12.9800, lon: 77.7600
- **Inside:** lat: 12.9698, lon: 77.7499

---

### 13. Check-In ✅

**POST** `{{baseUrl}}/attendance/check-in`

**⭐ Requires locationToken from previous step**

**Body:**
```json
{
  "employeeId": "{{employeeId}}",
  "photoUrl": "https://example.com/photos/checkin-20240120.jpg",
  "embedding": [0.125, 0.458, 0.791, 0.323, 0.656, 0.989],
  "locationToken": "{{locationToken}}"
}
```

**Expected (FREE Plan):** 201 Created
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendanceId": "...",
    "checkInTime": "2024-01-20T09:15:30.000Z",
    "matchConfidence": null
  }
}
```

**Expected (PAID Plan):** 201 Created
```json
{
  "matchConfidence": 92.5
}
```

**Test:**
- [ ] Check-in succeeds
- [ ] Expired token fails (401)
- [ ] Already checked in fails (409)
- [ ] PAID plan has matchConfidence

**Complete Flow:**
1. Location Check → Get locationToken (5 min expiry)
2. Capture photo → Extract embedding
3. FREE: Compare locally → If match, proceed
4. PAID: Skip comparison
5. Check-In → Record saved

---

### 14. Get Employee Attendance 📊

**GET** `{{baseUrl}}/attendance/employee/{{employeeId}}?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Expected:** 200 OK
- ✅ Paginated attendance records

---

### 15. Get Attendance Report 📈

**GET** `{{baseUrl}}/attendance/report?startDate=2024-01-01&endDate=2024-01-31`

**Optional:** `&employeeId={{employeeId}}`

**Headers:** `Authorization: Bearer {{accessToken}}`

**Expected:** 200 OK
```json
{
  "success": true,
  "data": {
    "totalRecords": 45,
    "attendances": [
      {
        "checkInTime": "2024-01-20T09:15:30.000Z",
        "employee": {
          "name": "Rajesh Kumar",
          "contactNumber": "9123456789"
        }
      }
    ]
  }
}
```

---

## Testing Checklist

### ✅ Basic Flow
- [ ] Register tenant
- [ ] Login
- [ ] Register employee
- [ ] Location check (outside)
- [ ] Check-in
- [ ] View attendance

### ✅ Error Scenarios
- [ ] Invalid credentials → 401
- [ ] Expired token → 401
- [ ] Wrong tenant data → 404
- [ ] Duplicate registration → 409
- [ ] Rate limit → 429

### ✅ Multi-Tenant
- [ ] Register 2nd tenant
- [ ] Cannot access 1st tenant's data
- [ ] Each tenant isolated

### ✅ Attendance Rules
- [ ] Inside radius blocked
- [ ] Outside radius allowed
- [ ] Token expires in 5 mins
- [ ] One check-in per day

### ✅ Plans
- [ ] FREE: matchConfidence = null
- [ ] PAID: matchConfidence = number

---

## Common Issues

### 401 Unauthorized
- ✅ Check Authorization header
- ✅ Token expired? Refresh it
- ✅ Re-login if needed

### 404 Not Found
- ✅ Verify UUID correct
- ✅ Resource exists?
- ✅ Right tenant?

### 409 Conflict
- ✅ Already checked in today
- ✅ Wait until tomorrow
- ✅ Or delete record for testing

### 429 Rate Limited
- ✅ Wait 15 minutes (login)
- ✅ Wait 1 minute (other APIs)

---

## Quick Reference

### Sample Test Data

**Tenant:**
```json
{
  "username": "testcompany",
  "password": "Test@1234",
  "gst": "29ABCDE1234F1Z5"
}
```

**Employee:**
```json
{
  "name": "Test User",
  "contactNumber": "9123456789",
  "emergencyContactNumber": "9876543210"
}
```

**Coordinates:**
- **Office:** 12.9698, 77.7499
- **Outside:** 12.9800, 77.7600

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limited |

---

## Pro Tips

1. **Variables Auto-Save** - No need to copy/paste tokens
2. **Test in Order** - Follow the flow for best results
3. **Use Realistic Data** - Better testing experience
4. **Check Logs** - Terminal shows detailed errors
5. **One Check-In/Day** - Can't test twice same day

---

## Next Steps

Once all tests pass:

1. ✅ Document any issues found
2. ✅ Test with multiple tenants
3. ✅ Test with multiple employees
4. ✅ Generate sample data
5. ✅ **Start frontend development!**

---

**Ready to build the frontend?** 🚀

You now have a fully tested backend that:
- ✅ Handles authentication
- ✅ Manages employees
- ✅ Tracks attendance
- ✅ Enforces security
- ✅ Supports multi-tenancy

**Happy Testing!** 🧪✨
