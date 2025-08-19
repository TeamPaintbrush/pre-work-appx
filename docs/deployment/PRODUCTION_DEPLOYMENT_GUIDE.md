# 🚀 **PRODUCTION DEPLOYMENT & AUTHENTICATION GUIDE**

**Enterprise-Grade AWS Cognito Authentication & Production Deployment**

This guide covers the complete setup of AWS Cognito authentication and production deployment for the Pre-Work Checklist Application.

---

## 📋 **TABLE OF CONTENTS**

1. [AWS Infrastructure Setup](#aws-infrastructure-setup)
2. [Cognito Authentication Configuration](#cognito-authentication-configuration)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Process](#deployment-process)
5. [Testing & Validation](#testing-validation)
6. [Security Best Practices](#security-best-practices)
7. [Monitoring & Maintenance](#monitoring-maintenance)

---

## 🏗️ **AWS Infrastructure Setup**

### Step 1: Run Production Environment Setup

```bash
# Install dependencies for AWS setup
npm install aws-sdk

# Run the production environment setup script
node scripts/aws/setup-production-environment.js
```

### Step 2: Manual AWS Configuration

If the automated script needs adjustment, configure these AWS services manually:

#### **DynamoDB Tables**
```bash
# Templates Table
aws dynamodb create-table \
  --table-name pre-work-app-templates-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=version,AttributeType=S \
    AttributeName=categoryId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=version,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=CategoryIndex,KeySchema=[{AttributeName=categoryId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST

# Checklists Table
aws dynamodb create-table \
  --table-name pre-work-app-checklists-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=updatedAt,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=userId,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=UserStatusIndex,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=status,KeyType=RANGE}],Projection={ProjectionType=ALL} \
    IndexName=StatusTimeIndex,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=updatedAt,KeyType=RANGE}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST

# Users Table
aws dynamodb create-table \
  --table-name pre-work-app-users-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
    AttributeName=organizationId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL} \
    IndexName=OrganizationIndex,KeySchema=[{AttributeName=organizationId,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST
```

#### **S3 Buckets**
```bash
# Assets Bucket
aws s3 mb s3://pre-work-app-assets-prod
aws s3api put-bucket-versioning --bucket pre-work-app-assets-prod --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket pre-work-app-assets-prod --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Backups Bucket
aws s3 mb s3://pre-work-app-backups-prod
aws s3api put-bucket-versioning --bucket pre-work-app-backups-prod --versioning-configuration Status=Enabled

# Logs Bucket
aws s3 mb s3://pre-work-app-logs-prod
```

---

## 🔐 **Cognito Authentication Configuration**

### Step 1: Create User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name pre-work-app-users-prod \
  --policies PasswordPolicy='{MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}' \
  --mfa-configuration OPTIONAL \
  --account-recovery-setting RecoveryMechanisms='[{Name=verified_email,Priority=1},{Name=verified_phone_number,Priority=2}]' \
  --auto-verified-attributes email \
  --alias-attributes email \
  --username-attributes email \
  --schema '[{Name=email,AttributeDataType=String,Required=true,Mutable=true},{Name=given_name,AttributeDataType=String,Required=true,Mutable=true},{Name=family_name,AttributeDataType=String,Required=true,Mutable=true},{Name=organization,AttributeDataType=String,Required=false,Mutable=true},{Name=role,AttributeDataType=String,Required=false,Mutable=true}]'
```

### Step 2: Create User Pool Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id YOUR_USER_POOL_ID \
  --client-name pre-work-app-web-client-prod \
  --no-generate-secret \
  --refresh-token-validity 30 \
  --access-token-validity 24 \
  --id-token-validity 24 \
  --token-validity-units AccessToken=hours,IdToken=hours,RefreshToken=days \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH,ALLOW_USER_PASSWORD_AUTH,ALLOW_REFRESH_TOKEN_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls https://app.preworkchecklist.com/auth/callback,https://localhost:3000/auth/callback \
  --logout-urls https://app.preworkchecklist.com/auth/logout,https://localhost:3000/auth/logout \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes email,openid,profile \
  --allowed-o-auth-flows-user-pool-client
```

### Step 3: Create Identity Pool

```bash
aws cognito-identity create-identity-pool \
  --identity-pool-name pre_work_app_identity_pool_prod \
  --no-allow-unauthenticated-identities \
  --cognito-identity-providers ProviderName=cognito-idp.us-east-1.amazonaws.com/YOUR_USER_POOL_ID,ClientId=YOUR_CLIENT_ID,ServerSideTokenCheck=true
```

---

## ⚙️ **Environment Configuration**

### Step 1: Update Production Environment File

Update `.env.production` with your AWS Cognito values:

```bash
# AWS Cognito Configuration (Replace with your actual values)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### Step 2: Vercel Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TIME_SYNC=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES=true

# Security
NEXT_PUBLIC_ENABLE_CSP=true
NEXT_PUBLIC_ENABLE_HTTPS_ONLY=true
```

---

## 🚀 **Deployment Process**

### Step 1: Local Testing

```bash
# Install dependencies
npm ci

# Test authentication locally
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set custom domain (if needed)
vercel domains add app.preworkchecklist.com
```

### Step 3: AWS Lambda Functions (Optional)

Deploy serverless functions for advanced features:

```bash
# Deploy template sync processor
aws lambda create-function \
  --function-name pre-work-app-template-sync-prod \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://lambda-deployment-package.zip

# Deploy analytics processor
aws lambda create-function \
  --function-name pre-work-app-analytics-prod \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://analytics-deployment-package.zip
```

---

## ✅ **Testing & Validation**

### Step 1: Authentication Flow Testing

```bash
# Test user registration
curl -X POST https://app.preworkchecklist.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test user login
curl -X POST https://app.preworkchecklist.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

### Step 2: Feature Testing

1. **Real-time Sync**: Test template synchronization across multiple browser tabs
2. **Authentication**: Test login, registration, password reset, and email verification
3. **Templates**: Verify 200+ templates load correctly
4. **Collaboration**: Test sharing and team features
5. **Offline Mode**: Test offline functionality and sync when reconnected

### Step 3: Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery
artillery quick --count 10 --num 5 https://app.preworkchecklist.com

# Lighthouse performance audit
npx lighthouse https://app.preworkchecklist.com --output html --output-path ./lighthouse-report.html
```

---

## 🔒 **Security Best Practices**

### Step 1: Cognito Security Configuration

1. **Password Policy**: Minimum 12 characters, mixed case, numbers, symbols
2. **MFA**: Optional but recommended for admin users
3. **Account Recovery**: Email and phone verification
4. **Session Management**: 24-hour token expiry, 30-day refresh tokens

### Step 2: Application Security

1. **Content Security Policy (CSP)**: Enabled in production
2. **HTTPS Enforcement**: All traffic redirected to HTTPS
3. **Security Headers**: X-Frame-Options, X-XSS-Protection, etc.
4. **API Rate Limiting**: 1000 requests/hour, 50 burst limit

### Step 3: AWS Security

1. **IAM Roles**: Least privilege access for all services
2. **VPC Configuration**: Isolated network for sensitive resources
3. **Encryption**: At-rest and in-transit for all data
4. **CloudTrail**: Audit logging for all AWS API calls

---

## 📊 **Monitoring & Maintenance**

### Step 1: Application Monitoring

```bash
# Setup Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Setup Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id

# AWS CloudWatch for infrastructure monitoring
aws logs create-log-group --log-group-name /aws/lambda/pre-work-app
```

### Step 2: Health Checks

Create monitoring endpoints:

- `/api/health` - Application health status
- `/api/health/database` - DynamoDB connectivity
- `/api/health/auth` - Cognito service status
- `/api/health/storage` - S3 service status

### Step 3: Backup Strategy

```bash
# DynamoDB Point-in-time Recovery (already enabled)
aws dynamodb describe-table --table-name pre-work-app-templates-prod

# S3 Cross-region replication
aws s3api put-bucket-replication \
  --bucket pre-work-app-assets-prod \
  --replication-configuration file://replication-config.json

# Regular database exports
aws dynamodb export-table-to-point-in-time \
  --table-arn arn:aws:dynamodb:us-east-1:ACCOUNT:table/pre-work-app-templates-prod \
  --s3-bucket pre-work-app-backups-prod
```

---

## 🎯 **Production Checklist**

### Pre-Deployment
- [ ] AWS infrastructure provisioned
- [ ] Cognito User Pool configured
- [ ] Environment variables set
- [ ] Security headers configured
- [ ] SSL certificates installed

### Post-Deployment
- [ ] Authentication flow tested
- [ ] Real-time sync validated
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Monitoring alerts configured

### Ongoing Maintenance
- [ ] Weekly security updates
- [ ] Monthly performance reviews
- [ ] Quarterly backup testing
- [ ] Annual security audits

---

## 🆘 **Troubleshooting**

### Common Issues

1. **Cognito Authentication Errors**
   ```bash
   # Check User Pool configuration
   aws cognito-idp describe-user-pool --user-pool-id YOUR_USER_POOL_ID
   
   # Verify client settings
   aws cognito-idp describe-user-pool-client --user-pool-id YOUR_USER_POOL_ID --client-id YOUR_CLIENT_ID
   ```

2. **DynamoDB Access Issues**
   ```bash
   # Test table access
   aws dynamodb describe-table --table-name pre-work-app-templates-prod
   
   # Check IAM permissions
   aws iam get-role-policy --role-name your-lambda-role --policy-name DynamoDBAccess
   ```

3. **Deployment Failures**
   ```bash
   # Check Vercel build logs
   vercel logs

   # Test build locally
   npm run build
   npm start
   ```

### Support Contacts

- **AWS Support**: Via AWS Console
- **Vercel Support**: support@vercel.com
- **Application Issues**: Create GitHub issue

---

## 📚 **Additional Resources**

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Next.js Production Guide](https://nextjs.org/docs/deployment)
- [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

**✅ Production deployment and authentication system is now ready!**

The Pre-Work Checklist Application now has enterprise-grade authentication with AWS Cognito and is ready for production deployment with real-time synchronization, collaboration features, and comprehensive security measures.
