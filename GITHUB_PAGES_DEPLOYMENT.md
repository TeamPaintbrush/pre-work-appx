# GitHub Pages Deployment Guide for pre-work-appx

## Repository Setup

1. **Create the new GitHub repository:**
   - Go to https://github.com/TeamPaintbrush
   - Click "New repository"
   - Name it `pre-work-appx`
   - Make it public (required for GitHub Pages on free accounts)
   - Don't initialize with README (we'll push existing code)

2. **Initialize and push your code:**

```powershell
# Navigate to your project directory
cd "c:\Users\leroy\Downloads\WORDPRESS TO REACT PROJECT\The Pre-Work App - Checklist\pre-work-app"

# Initialize git repository (if not already done)
git init

# Add the new remote
git remote add origin https://github.com/TeamPaintbrush/pre-work-appx.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Pre-Work App for GitHub Pages deployment"

# Push to the new repository
git push -u origin master
```

## GitHub Pages Configuration

1. **Enable GitHub Pages:**
   - Go to your repository: https://github.com/TeamPaintbrush/pre-work-appx
   - Click on "Settings" tab
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Set up repository permissions:**
   - In Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

## Automatic Deployment

The repository is now configured for automatic deployment:

- **Trigger**: Every push to `master` or `main` branch
- **Build**: Next.js static export
- **Deploy**: Automatic deployment to GitHub Pages
- **URL**: https://teampaintbrush.github.io/pre-work-appx/

## Configuration Changes Made

1. **Updated `next.config.js`:**
   - Changed `basePath` and `assetPrefix` to `/pre-work-appx`
   - Configured for static export with GitHub Pages

2. **Added GitHub Actions workflow** (`.github/workflows/deploy.yml`):
   - Builds the Next.js application
   - Deploys to GitHub Pages automatically

3. **Added `.nojekyll` file:**
   - Ensures GitHub Pages serves Next.js files correctly

## Testing the Deployment

After pushing to GitHub:

1. Check the "Actions" tab in your repository to see the deployment progress
2. Once completed, visit: https://teampaintbrush.github.io/pre-work-appx/
3. The app should be live and functional

## Troubleshooting

- **Deployment fails**: Check the Actions tab for error details
- **404 errors**: Ensure all internal links use the `/pre-work-appx` base path
- **Permissions issues**: Verify GitHub Pages and Actions permissions are correctly set

## Local Development

For local development, the app will still work with:

```powershell
npm run dev
```

The base path configuration only affects the production build.

## Manual Build and Deploy

If needed, you can manually build and check the output:

```powershell
npm run build
```

This creates an `out` folder with the static files that will be deployed to GitHub Pages.
