# 🚀 Quick Start Guide - Pre-Work App

## Overview
This is an enterprise-grade Next.js application with AWS backend integration for user management, media uploads, and workflow tracking.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: AWS DynamoDB, S3, Lambda-ready API routes
- **Authentication**: Multi-role user profiles (Admin, Manager, User)
- **Media**: S3 file storage with presigned URLs
- **Validation**: Zod schemas for type safety

## 🎯 Prerequisites
- Node.js 18+ installed
- AWS Account with programmatic access
- AWS CLI installed and configured

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS credentials when prompted
   ```

3. **Create AWS Resources**
   ```bash
   # Windows PowerShell
   .\setup-aws-resources.ps1
   
   # macOS/Linux
   chmod +x setup-aws-resources.sh
   ./setup-aws-resources.sh
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Visit Application**
   Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

After running the setup script, your `.env.local` will contain:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Tables
DYNAMODB_USERS_TABLE=prework-users
DYNAMODB_PROFILES_TABLE=prework-user-profiles
DYNAMODB_AUDIT_TABLE=prework-audit-logs

# S3 Configuration
S3_BUCKET_NAME=prework-media-bucket-[random]
S3_REGION=us-east-1

# Application
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Test AWS integration
npm run test:aws

# Run all tests
npm test

# Type checking
npm run type-check
```

## 📱 Features

### User Management
- Multi-role profiles (Admin, Manager, User)
- User registration and authentication
- Profile customization with custom fields

### Media Handling
- Secure S3 file uploads
- Image processing and optimization
- Before/after photo comparisons

### Workflow Features
- Dynamic checklist creation
- Progress tracking and analytics
- Compliance checking
- Audit logging

### Enterprise Features
- Template sharing and management
- Export to PDF functionality
- Mobile-responsive design
- Accessibility compliance

## 🚀 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions to AWS, Vercel, or other platforms.

## 📚 Additional Resources

- [AWS Setup Guide](./AWS_SETUP_GUIDE.md) - Detailed AWS configuration
- [API Documentation](./API_REFERENCE.md) - Complete API reference
- [Component Guide](./COMPONENTS.md) - UI component documentation
- [UI Style Guide](./UI_STYLE_GUIDE.md) - Design system and styling standards
- [Database Schema](./DATABASE_SCHEMA.md) - Data structure reference
