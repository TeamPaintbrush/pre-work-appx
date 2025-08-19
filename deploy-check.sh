#!/bin/bash

# 🚀 AWS Amplify Deployment Script
# This script validates your app is ready for deployment

echo "🔍 Pre-Work App - Deployment Readiness Check"
echo "=============================================="

# Check Node.js version
echo "📦 Checking Node.js version..."
node --version
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this script from your project root"
    exit 1
fi

# Check if Git is configured
echo "🔗 Checking Git status..."
git remote -v
echo ""

# Validate build
echo "🏗️  Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 READY FOR DEPLOYMENT!"
    echo "========================"
    echo ""
    echo "Next steps:"
    echo "1. Open: https://console.aws.amazon.com/amplify/"
    echo "2. Click 'New app' → 'Host web app'"
    echo "3. Connect to GitHub: TeamPaintbrush/pre-work-appx"
    echo "4. Select branch: main"
    echo "5. Click 'Save and deploy'"
    echo ""
    echo "Your app will be live in 3-5 minutes! 🎉"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi
