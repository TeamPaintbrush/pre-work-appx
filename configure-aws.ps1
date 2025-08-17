# AWS Configuration Script for Pre-Work App
# Run this script to configure AWS CLI and create resources

Write-Host "🚀 AWS Setup for Pre-Work App" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Refresh environment variables to pick up AWS CLI
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if AWS CLI is available
try {
    $awsVersion = & aws --version 2>&1
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found in PATH. Please restart PowerShell or add AWS CLI to PATH manually." -ForegroundColor Red
    Write-Host "AWS CLI is typically installed to: C:\Program Files\Amazon\AWSCLIV2\" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: aws configure" -ForegroundColor White
Write-Host "   - Enter your AWS Access Key ID" -ForegroundColor Gray
Write-Host "   - Enter your AWS Secret Access Key" -ForegroundColor Gray
Write-Host "   - Enter your default region (e.g., us-east-1)" -ForegroundColor Gray
Write-Host "   - Enter output format: json" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Then run: .\setup-aws-resources.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Need AWS credentials? Create them at:" -ForegroundColor Yellow
Write-Host "https://console.aws.amazon.com/iam/home#/security_credentials" -ForegroundColor Blue
