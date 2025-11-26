# Deployment Guide

## 🚀 Production Deployment Steps

### 1. Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] AWS services configured (S3, Rekognition)
- [ ] SSL certificates ready
- [ ] Domain/subdomain configured
- [ ] Monitoring setup ready
- [ ] Backup strategy in place

### 2. Environment Setup

#### Production Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000

# Database - Use production PostgreSQL
DATABASE_URL="postgresql://prod_user:prod_password@prod-host:5432/smart_attendance"

# JWT Secrets - Generate strong secrets
JWT_ACCESS_SECRET=<generate-strong-secret-256-bit>
JWT_REFRESH_SECRET=<generate-strong-secret-256-bit>
JWT_LOCATION_SECRET=<generate-strong-secret-256-bit>

# AWS Production Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<production-access-key>
AWS_SECRET_ACCESS_KEY=<production-secret-key>
AWS_S3_BUCKET=<production-bucket-name>

# Security - Production values
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# CORS - Your production frontend URL
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Generate Strong Secrets

```bash
# Generate JWT secrets (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup

#### Option A: Deploy to Heroku Postgres

```bash
# Add Heroku PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Get database URL
heroku config:get DATABASE_URL

# Run migrations
heroku run npm run prisma:deploy
```

#### Option B: Deploy to AWS RDS

1. Create PostgreSQL RDS instance
2. Configure security groups
3. Update DATABASE_URL in environment
4. Run migrations:

```bash
npm run prisma:deploy
```

#### Option C: Deploy to DigitalOcean Managed Database

1. Create managed PostgreSQL database
2. Whitelist application server IPs
3. Update DATABASE_URL
4. Run migrations

### 4. AWS Services Setup

#### S3 Bucket Configuration

1. Create S3 bucket:
   ```bash
   aws s3 mb s3://your-attendance-bucket --region us-east-1
   ```

2. Configure CORS policy:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["https://your-frontend-domain.com"],
       "ExposeHeaders": []
     }
   ]
   ```

3. Set bucket policy for public read on photos:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-attendance-bucket/*"
       }
     ]
   }
   ```

#### Rekognition Setup

1. Ensure Rekognition is available in your region
2. Create IAM user with Rekognition permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "rekognition:CompareFaces",
           "rekognition:DetectFaces"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

### 5. Deployment Options

#### Option A: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_ACCESS_SECRET=your-secret
# ... set all other env vars

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:deploy

# Check logs
heroku logs --tail
```

#### Option B: Deploy to AWS EC2

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Configure security groups (allow 80, 443, 22)

2. **SSH and Setup**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone repository
   git clone your-repo-url
   cd smart-attendance-backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Paste production environment variables
   
   # Build application
   npm run build
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:deploy
   
   # Start with PM2
   pm2 start dist/server.js --name attendance-api
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx as Reverse Proxy**:
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/attendance-api
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/attendance-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

#### Option C: Deploy to DigitalOcean App Platform

1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set run command: `npm start`
5. Configure health check: `/health`
6. Deploy

#### Option D: Deploy to Render

1. Create new Web Service
2. Connect repository
3. Configure:
   - Build Command: `npm install && npm run build && npm run prisma:generate`
   - Start Command: `npm run prisma:deploy && npm start`
4. Add environment variables
5. Deploy

### 6. Post-Deployment

#### Monitor Application

```bash
# Using PM2
pm2 logs attendance-api
pm2 monit

# Check status
pm2 status
```

#### Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Database Backups

**Automated Backups** (using cron):

```bash
# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/attendance_$DATE.sql
# Upload to S3
aws s3 cp /backups/attendance_$DATE.sql s3://your-backup-bucket/
# Keep only last 30 days locally
find /backups -name "attendance_*.sql" -mtime +30 -delete
EOF

chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

### 7. Monitoring & Alerts

#### Setup Health Checks

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

Configure to check: `https://your-domain.com/health`

#### Application Monitoring

Consider using:
- New Relic
- DataDog
- Sentry (for error tracking)

#### Setup Error Alerts

```javascript
// In production, integrate with error tracking
import * as Sentry from "@sentry/node";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
  });
}
```

### 8. Performance Optimization

#### Enable Compression

```typescript
import compression from 'compression';
app.use(compression());
```

#### Setup Redis Cache (Optional)

For high-traffic scenarios:

```bash
# Install Redis
sudo apt install redis-server

# Install node-redis
npm install redis
```

### 9. Security Hardening

#### Firewall Configuration

```bash
# Using UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### Fail2Ban Setup

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### Regular Updates

```bash
# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 10. Scaling Considerations

#### Horizontal Scaling

- Use load balancer (AWS ALB, Nginx)
- Ensure stateless application
- Use managed database
- Store sessions in Redis

#### Vertical Scaling

- Monitor CPU/Memory usage
- Upgrade instance size as needed

#### Database Scaling

- Read replicas for heavy read operations
- Connection pooling (Prisma default: 10 connections)
- Index optimization

### 11. Rollback Strategy

```bash
# PM2 rollback
pm2 deploy production revert 1

# Manual rollback
git reset --hard <previous-commit>
npm run build
pm2 restart attendance-api
```

### 12. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/attendance-api
            git pull origin main
            npm install
            npm run build
            npm run prisma:deploy
            pm2 restart attendance-api
```

---

## 🔍 Monitoring Checklist

- [ ] Application health endpoint responding
- [ ] Database connections stable
- [ ] Error rate < 1%
- [ ] Response time < 500ms (p95)
- [ ] SSL certificate valid
- [ ] Backups running daily
- [ ] Logs being collected
- [ ] Alerts configured

---

## 📞 Emergency Contacts

Document your emergency procedures:
- Database access credentials
- AWS account details
- Server access information
- On-call rotation

---

## 🎯 Success Metrics

Monitor these KPIs:
- API response time
- Error rate
- Database query performance
- AWS Rekognition success rate
- Active users/tenants
- Check-in success rate
