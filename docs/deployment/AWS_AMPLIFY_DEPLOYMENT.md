# AWS Amplify Deployment Guide

## 🚀 Deploying Pre-Work App to AWS Amplify

### Prerequisites
1. ✅ AWS Account with billing configured
2. ✅ AWS CLI installed and configured
3. ✅ Amplify CLI installed globally
4. ✅ Project built successfully

### Option A: Deploy via Amplify Console (Recommended)

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add AWS Amplify configuration"
git push origin master
```

#### Step 2: Create Amplify App in AWS Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New App" → "Host web app"
3. Connect your GitHub repository
4. Select the `master` branch
5. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `out`
   - Node version: `18` or `20`

#### Step 3: Set Environment Variables
In the Amplify Console → App Settings → Environment Variables, add:

```
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_ENABLE_AWS_FEATURES=true
NEXT_PUBLIC_ENABLE_REAL_TIME_SYNC=true
NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS=true
NODE_ENV=production
```

#### Step 4: Deploy
- Amplify will automatically build and deploy your app
- Access your live app at: `https://master.xxxxx.amplifyapp.com`

### Option B: Deploy via CLI (Advanced)

#### Step 1: Initialize Amplify (if not done)
```bash
amplify init
```

#### Step 2: Add Hosting
```bash
amplify add hosting
# Choose Amazon CloudFront and S3
```

#### Step 3: Deploy Backend Services
```bash
amplify add auth      # Add Cognito authentication
amplify add storage   # Add S3 storage
amplify add api       # Add API Gateway + DynamoDB
```

#### Step 4: Push to AWS
```bash
amplify push
```

#### Step 5: Publish App
```bash
amplify publish
```

### 🎯 Features Enabled with Amplify

1. **Authentication**: AWS Cognito for user management
2. **Storage**: S3 for file uploads and media
3. **Database**: DynamoDB for templates and user data
4. **API**: GraphQL/REST APIs via API Gateway
5. **Hosting**: CloudFront CDN for fast global delivery
6. **Analytics**: AWS Pinpoint for user analytics
7. **Real-time**: AppSync for real-time features
8. **CI/CD**: Automatic deployments from Git

### 🔧 Environment Configuration

#### Development
```bash
cp .env.example .env.local
# Update with your actual AWS resource IDs
```

#### Production
Environment variables are managed in Amplify Console.

### 📊 Monitoring & Analytics

- **CloudWatch**: Application logs and metrics
- **X-Ray**: Distributed tracing
- **Pinpoint**: User analytics and engagement
- **Cost Explorer**: Usage and billing monitoring

### 🚨 Troubleshooting

#### Build Failures
- Check Node.js version (use 18.x or 20.x)
- Verify all dependencies are installed
- Check environment variables

#### AWS Permission Issues
- Ensure IAM user has necessary permissions
- Verify billing is properly configured
- Check service quotas and limits

#### Performance Issues
- Enable CloudFront caching
- Optimize images and assets
- Use lazy loading for large components

### 📞 Support

1. **AWS Support**: Contact AWS Support for infrastructure issues
2. **Documentation**: [AWS Amplify Docs](https://docs.amplify.aws/)
3. **Community**: [Amplify Discord](https://discord.gg/amplify)

### 🎉 Post-Deployment

1. Test all features in production
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up backup and disaster recovery
5. Monitor costs and usage

---

**Next Steps**: After AWS billing is resolved, follow Option A for the easiest deployment experience!
