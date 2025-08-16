# 🚀 Deployment Guide - Pre-Work App

## Overview
This guide covers deployment options for the Pre-Work App across different platforms and environments.

---

## 🏗️ Build Process

### Local Build
```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Build for production
npm run build

# Test the build locally
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Tables
DYNAMODB_USERS_TABLE=prework-users-prod
DYNAMODB_PROFILES_TABLE=prework-user-profiles-prod
DYNAMODB_AUDIT_TABLE=prework-audit-logs-prod

# S3 Configuration
S3_BUCKET_NAME=prework-media-bucket-prod
S3_REGION=us-east-1

# Application
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

---

## ☁️ AWS Deployment

### Option 1: AWS Amplify
**Best for**: Quick deployment with CI/CD

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   # Choose "Amazon CloudFront and S3"
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

### Option 2: AWS Lambda + CloudFront
**Best for**: Serverless architecture

1. **Create deployment package**
   ```bash
   npm run build
   zip -r deployment.zip .next/ package.json
   ```

2. **Deploy to Lambda**
   - Use AWS Console or CLI
   - Set runtime to Node.js 18+
   - Configure environment variables
   - Set up CloudFront distribution

### Option 3: AWS EC2
**Best for**: Full control over infrastructure

1. **Launch EC2 instance**
   - Choose Ubuntu 22.04 LTS
   - t3.medium or larger
   - Configure security groups

2. **Setup server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Clone repository
   git clone your-repo-url
   cd pre-work-app

   # Install dependencies and build
   npm install
   npm run build

   # Start with PM2
   pm2 start npm --name "pre-work-app" -- start
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx (optional)**
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
       }
   }
   ```

---

## 🌐 Vercel Deployment

**Best for**: Easy deployment with great DX

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add all required environment variables
   - Redeploy if needed

### Vercel Configuration
Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - DYNAMODB_USERS_TABLE=${DYNAMODB_USERS_TABLE}
      - DYNAMODB_PROFILES_TABLE=${DYNAMODB_PROFILES_TABLE}
      - DYNAMODB_AUDIT_TABLE=${DYNAMODB_AUDIT_TABLE}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
```

### Build and Run
```bash
# Build image
docker build -t pre-work-app .

# Run container
docker run -p 3000:3000 --env-file .env.production pre-work-app

# Or use docker-compose
docker-compose up -d
```

---

## 🔧 Production Optimizations

### Next.js Configuration
Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },
  
  // Image optimization
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Performance Monitoring
1. **Enable Next.js Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Add monitoring to layout**
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

---

## 🔒 Security Considerations

### Environment Security
- Use AWS Secrets Manager for sensitive data
- Rotate access keys regularly
- Use IAM roles instead of access keys when possible
- Enable AWS CloudTrail for audit logging

### Application Security
- Enable HTTPS/SSL certificates
- Use Content Security Policy (CSP)
- Implement rate limiting
- Validate all user inputs
- Use secure session configuration

### Database Security
- Enable DynamoDB encryption at rest
- Use VPC endpoints for internal communication
- Implement least privilege access
- Enable point-in-time recovery

---

## 📊 Monitoring & Logging

### AWS CloudWatch
```javascript
// Add to your API routes
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';

const cloudWatchLogs = new CloudWatchLogs({
  region: process.env.AWS_REGION,
});

export async function logEvent(message, level = 'INFO') {
  await cloudWatchLogs.putLogEvents({
    logGroupName: '/aws/lambda/pre-work-app',
    logStreamName: new Date().toISOString().split('T')[0],
    logEvents: [{
      message: JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
      }),
      timestamp: Date.now(),
    }],
  });
}
```

### Health Checks
Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/database/config';

export async function GET() {
  try {
    await testDatabaseConnection();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   
   # Check for TypeScript errors
   npm run type-check
   ```

2. **AWS Connection Issues**
   ```bash
   # Test AWS credentials
   aws sts get-caller-identity
   
   # Test DynamoDB connection
   npm run test:aws
   ```

3. **Memory Issues**
   ```javascript
   // Increase Node.js memory limit
   "scripts": {
     "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
   }
   ```

### Rollback Strategy
1. Keep previous deployment artifacts
2. Use blue-green deployment when possible
3. Implement database migrations carefully
4. Test rollback procedures in staging

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Run all tests (`npm test`)
- [ ] Type check (`npm run type-check`)
- [ ] Security audit (`npm audit`)
- [ ] Performance test
- [ ] Backup database
- [ ] Verify environment variables

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check health endpoints
- [ ] Verify AWS resources
- [ ] Test critical user flows
- [ ] Monitor error rates

### Post-Deployment
- [ ] Verify SSL certificates
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Test backup/restore procedures
- [ ] Update documentation
- [ ] Notify stakeholders
