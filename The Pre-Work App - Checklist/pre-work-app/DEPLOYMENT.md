# GitHub Pages Deployment Instructions

## Automatic Deployment
This repository is configured for automatic GitHub Pages deployment. When you push to the `main` branch, GitHub Actions will:

1. Build the Next.js project
2. Generate static files
3. Deploy to the `gh-pages` branch
4. Make the site available at: `https://teampaintbrush.github.io/pre-work-app/`

## Manual Deployment
To test the build locally:

```bash
# Build and generate static files
npm run build

# The static files will be in the 'out' folder
# You can serve them locally with:
npx serve out
```

## GitHub Pages Setup
1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Set source to "Deploy from a branch"
4. Select the `gh-pages` branch
5. Your site will be available at: `https://teampaintbrush.github.io/pre-work-app/`

## Configuration
- `next.config.js`: Configured for static export with basePath `/pre-work-app`
- `.github/workflows/gh-pages.yml`: GitHub Actions workflow for automatic deployment
- `public/.nojekyll`: Prevents GitHub from treating this as a Jekyll site

## Notes
- The app is configured as a static site (no server-side features)
- All paths are prefixed with `/pre-work-app/` for GitHub Pages project sites
- Images are unoptimized for static hosting compatibility
