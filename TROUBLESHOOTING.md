# Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Issues

#### Error: "Can't reach database server"

**Symptoms:**
```
Error: Can't reach database server at `localhost:5432`
```

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # Ubuntu/Debian
   sudo systemctl status postgresql
   
   # macOS
   brew services list
   ```

2. **Verify DATABASE_URL:**
   ```bash
   # Format should be:
   postgresql://username:password@host:port/database
   ```

3. **Test connection:**
   ```bash
   psql $DATABASE_URL
   ```

4. **Check firewall/network:**
   - Ensure port 5432 is open
   - Check if PostgreSQL allows remote connections

#### Error: "Authentication failed"

**Solutions:**

1. **Verify credentials in DATABASE_URL**
2. **Check PostgreSQL user permissions:**
   ```sql
   -- Connect as postgres user
   psql postgres
   
   -- Check user
   \du
   
   -- Grant permissions if needed
   GRANT ALL PRIVILEGES ON DATABASE smart_attendance TO your_user;
   ```

### 2. Migration Issues

#### Error: "Migration failed"

**Solutions:**

1. **Reset database (WARNING: Deletes all data):**
   ```bash
   npm run prisma:migrate reset
   ```

2. **Check for schema conflicts:**
   ```bash
   npx prisma migrate status
   ```

3. **Force migration:**
   ```bash
   npx prisma db push --force-reset
   ```

#### Error: "Migrations are out of sync"

**Solutions:**

1. **Resolve manually:**
   ```bash
   npx prisma migrate resolve --applied "migration_name"
   ```

2. **Create new baseline:**
   ```bash
   npx prisma migrate resolve --rolled-back "migration_name"
   npx prisma migrate dev
   ```

### 3. Authentication Issues

#### Error: "Invalid or expired token"

**Causes:**
- Token expired
- JWT secret mismatch
- Malformed token

**Solutions:**

1. **Check JWT_ACCESS_SECRET in .env**
2. **Verify token format:**
   ```
   Authorization: Bearer <token>
   ```
3. **Request new token using refresh endpoint**
4. **Check server time synchronization**

#### Error: "Authorization token required"

**Solution:**
Ensure you're including the Authorization header:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
}
```

### 4. AWS Integration Issues

#### Error: "S3 Upload Failed"

**Solutions:**

1. **Verify AWS credentials:**
   ```bash
   aws s3 ls s3://your-bucket-name
   ```

2. **Check IAM permissions:**
   - S3: `PutObject`, `GetObject`
   - Required policy:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "s3:PutObject",
       "s3:GetObject"
     ],
     "Resource": "arn:aws:s3:::your-bucket/*"
   }
   ```

3. **Verify bucket exists and region is correct**

4. **Check CORS configuration on S3 bucket**

#### Error: "Rekognition Face Match Failed"

**Possible Causes:**
- Poor image quality
- Face not detected
- Insufficient lighting
- Face obstructed

**Solutions:**

1. **Image requirements:**
   - Minimum resolution: 640x480
   - Face clearly visible
   - Good lighting
   - JPEG or PNG format

2. **Check Rekognition permissions:**
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "rekognition:CompareFaces",
       "rekognition:DetectFaces"
     ],
     "Resource": "*"
   }
   ```

3. **Verify images are accessible (not 404)**

4. **Lower similarity threshold for testing:**
   ```env
   REKOGNITION_SIMILARITY_THRESHOLD=70.0
   ```

### 5. Validation Errors

#### Error: "Validation failed"

**Common Issues:**

1. **GST Format:**
   - Must be: `29ABCDE1234F1Z5` (15 characters)
   - Pattern: 2 digits, 5 uppercase letters, 4 digits, 1 letter, 1 alphanumeric, 'Z', 1 alphanumeric

2. **Phone Number:**
   - Must start with 6-9
   - Must be exactly 10 digits
   - Example: `9876543210`

3. **Password:**
   - Minimum 8 characters
   - At least one uppercase
   - At least one lowercase
   - At least one number
   - At least one special character

4. **Coordinates:**
   - Latitude: -90 to 90
   - Longitude: -180 to 180

### 6. Location Check Issues

#### Error: "You are within office premises"

This is actually correct behavior when:
- Employee is within ALLOWED_CHECKIN_RADIUS of office
- Location check should only work when employee is outside this radius

**To test:**
1. Use coordinates far from office location
2. Adjust ALLOWED_CHECKIN_RADIUS in .env if needed

#### Error: "Invalid coordinates"

**Solutions:**
1. Verify latitude/longitude format
2. Ensure coordinates are numbers, not strings
3. Check coordinate bounds

### 7. Check-In Issues

#### Error: "Invalid or expired location token"

**Causes:**
- Token expired (5 minutes default)
- Token used for wrong employee
- Token used twice

**Solutions:**
1. Request new location token
2. Check JWT_LOCATION_EXPIRY setting
3. Ensure employeeId matches in both requests

#### Error: "Already checked in today"

**Solution:**
This is expected behavior. Employees can only check in once per day.

For testing:
```sql
-- Delete attendance record to test again
DELETE FROM attendances WHERE employee_id = 'employee_uuid' 
AND DATE(check_in_time) = CURRENT_DATE;
```

### 8. Rate Limiting Issues

#### Error: "Too many requests"

**Solutions:**

1. **For login endpoint:**
   - Default: 5 attempts per 15 minutes
   - Wait or increase RATE_LIMIT_MAX_REQUESTS

2. **For API endpoints:**
   - Default: 100 requests per minute
   - Implement request queuing on client
   - Consider increasing limits for production

3. **Disable during development:**
   ```typescript
   // In app.ts (development only)
   if (process.env.NODE_ENV !== 'production') {
     // Comment out apiLimiter
   }
   ```

### 9. Environment Variable Issues

#### Error: "Missing required environment variables"

**Solutions:**

1. **Check .env file exists**
2. **Verify all required variables:**
   ```bash
   # Run validation
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

3. **Copy from example:**
   ```bash
   cp .env.example .env
   ```

### 10. Prisma Issues

#### Error: "Prisma Client not generated"

**Solution:**
```bash
npm run prisma:generate
```

#### Error: "Unknown argument: migrate"

**Solution:**
```bash
# Install Prisma CLI
npm install -D prisma
```

#### Slow Queries

**Solutions:**

1. **Add indexes:**
   ```prisma
   @@index([tenantId])
   @@index([checkInTime])
   ```

2. **Optimize queries:**
   ```typescript
   // Use select to limit fields
   const employees = await prisma.employee.findMany({
     select: { id: true, name: true }
   });
   ```

3. **Connection pooling:**
   ```env
   DATABASE_URL="postgresql://...?connection_limit=10"
   ```

### 11. CORS Issues

#### Error: "CORS policy blocked"

**Solutions:**

1. **Update CORS_ORIGIN in .env:**
   ```env
   CORS_ORIGIN=http://localhost:3001
   ```

2. **Allow multiple origins:**
   ```typescript
   // In app.ts
   cors({
     origin: ['http://localhost:3000', 'http://localhost:3001'],
     credentials: true
   })
   ```

3. **Check preflight requests:**
   - Ensure OPTIONS method is handled

### 12. Memory Issues

#### Error: "JavaScript heap out of memory"

**Solutions:**

1. **Increase Node.js memory:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

2. **Check for memory leaks:**
   ```bash
   node --inspect dist/server.js
   ```

3. **Optimize queries:**
   - Use pagination
   - Limit result sets
   - Use streaming for large data

### 13. Port Already in Use

#### Error: "Port 3000 is already in use"

**Solutions:**

1. **Find and kill process:**
   ```bash
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Use different port:**
   ```env
   PORT=3001
   ```

### 14. TypeScript Compilation Errors

#### Error: "Cannot find module"

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma types:**
   ```bash
   npm run prisma:generate
   ```

3. **Clean build:**
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

### 15. Logging and Debugging

#### Enable Debug Logging

```typescript
// In config/database.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

#### Check Application Logs

```bash
# PM2
pm2 logs attendance-api

# Docker
docker logs container-name

# System logs
tail -f /var/log/attendance-api.log
```

### Getting Help

If you're still stuck:

1. Check the logs: `npm run dev` in development mode
2. Review Prisma migrations: `npx prisma migrate status`
3. Test database connection: `npx prisma studio`
4. Verify environment variables are loaded
5. Check AWS credentials and permissions
6. Test individual endpoints with Postman
7. Create an issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs

### Useful Commands

```bash
# Health check
curl http://localhost:3000/health

# Test database
npx prisma studio

# Check migrations
npx prisma migrate status

# View logs
npm run dev

# Reset everything (careful!)
npm run prisma:migrate reset
npm run build
npm run dev
```
