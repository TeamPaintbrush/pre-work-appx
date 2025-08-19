# AWS Amplify Live Deployment Guide

## Pre-Deployment Checklist ✅

### Application Status
- ✅ Build successful (Next.js App Router with SSR/API routes)
- ✅ AWS Amplify configuration ready (`amplify.yml`)
- ✅ Environment variables template ready (`.env.example`)
- ✅ All template data validated (149 templates)
- ✅ Static and dynamic routes working
- ✅ AmplifyProvider integrated in layout

### AWS Prerequisites
1. **AWS Account** with billing enabled
2. **GitHub Repository** with your code
3. **Amplify CLI** installed (already done)

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for AWS Amplify deployment"
git push origin main
```

### Step 2: Deploy via AWS Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Select your repository and branch
5. Amplify will automatically detect the `amplify.yml` configuration

### Step 3: Configure Environment Variables
In the Amplify Console, add these environment variables:

```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1

# DynamoDB Tables (will be created by Amplify)
NEXT_PUBLIC_DYNAMODB_TEMPLATES_TABLE=PreWorkApp-Templates-prod
NEXT_PUBLIC_DYNAMODB_USERS_TABLE=PreWorkApp-Users-prod
NEXT_PUBLIC_DYNAMODB_INTEGRATIONS_TABLE=PreWorkApp-Integrations-prod

# S3 Buckets (will be created by Amplify)
NEXT_PUBLIC_S3_TEMPLATES_BUCKET=prework-app-templates-prod
NEXT_PUBLIC_S3_UPLOADS_BUCKET=prework-app-uploads-prod

# Cognito (optional - for authentication)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your-client-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AWS_INTEGRATION=true
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES=true
```

### Step 4: Deploy and Test
1. Amplify will build and deploy your app
2. You'll get a live URL like: `https://main.d1234567890.amplifyapp.com`
3. Test all features:
   - Template gallery (149 templates)
   - Checklist creation
   - Settings page
   - Profile page
   - Debug console (if enabled)

## Post-Deployment Configuration

### AWS Resources Created
- **Amplify App**: Hosting your Next.js application
- **CloudFront CDN**: Global content delivery
- **DynamoDB Tables**: For template and user data storage
- **S3 Buckets**: For file uploads and template assets
- **IAM Roles**: For secure access to AWS services

### Optional: Custom Domain
1. In Amplify Console, go to "Domain management"
2. Add your custom domain
3. Amplify will handle SSL certificates automatically

### Optional: Backend API
If you need server-side APIs:
1. Use `amplify add api` to add GraphQL or REST APIs
2. Deploy with `amplify push`

## Monitoring and Maintenance

### Amplify Console Features
- **Build logs**: Monitor deployment status
- **Performance monitoring**: Track app performance
- **Auto-scaling**: Handles traffic spikes automatically
- **Rollback**: Easy rollback to previous versions

### Environment Management
- **Development**: Connect a dev branch for testing
- **Staging**: Set up a staging environment
- **Production**: Your main branch for live users

## Cost Optimization

### Amplify Pricing
- **Free tier**: 1,000 build minutes, 5GB storage, 15GB served
- **Pay-as-you-go**: $0.01 per build minute, $0.023 per GB served
- **No servers to manage**: Fully serverless

### Best Practices
- Use environment variables for different stages
- Monitor CloudWatch metrics
- Set up billing alerts
- Use caching headers for static assets

## Troubleshooting

### Common Issues
1. **Build failures**: Check build logs in Amplify Console
2. **Environment variables**: Ensure all required vars are set
3. **API routes**: Verify they work in SSR mode
4. **AWS permissions**: Check IAM roles and policies

### Support Resources
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js on Amplify Guide](https://docs.amplify.aws/nextjs/)
- AWS Support (if you have a support plan)

## Security Considerations

### Built-in Security
- ✅ HTTPS/SSL certificates (automatic)
- ✅ WAF protection (Web Application Firewall)
- ✅ DDoS protection via CloudFront
- ✅ IAM-based access control

### Additional Security
- Enable MFA for AWS account
- Use least-privilege IAM policies
- Monitor CloudTrail logs
- Set up security alerts

---

## Quick Commands

```bash
# Local development
npm run dev

# Build and test locally
npm run build
npm run start

# Deploy to Amplify (after initial setup)
git push origin main
```

**Your Pre-Work App is now ready for production deployment on AWS Amplify! 🚀**
