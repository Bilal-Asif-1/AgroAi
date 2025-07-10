# Vercel Deployment Guide

## Configuration Files Added

### 1. `vercel.json`
This file tells Vercel how to build and deploy your project:
- `buildCommand`: Specifies to run the build from the frontend directory
- `outputDirectory`: Points to the frontend/dist folder where the built files are located
- `installCommand`: Installs dependencies from the frontend directory
- `framework`: Specifies Vite as the framework
- `rewrites`: Handles client-side routing for React Router

### 2. `.vercelignore`
Excludes unnecessary files from deployment to reduce build time and size.

### 3. Updated `frontend/vite.config.ts`
- Added proper build configuration
- Set base path to '/'
- Configured output directory and build options

### 4. Fixed `frontend/index.html`
- Corrected the favicon path

## Deployment Steps

1. **Push your code to GitHub** (if not already done)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Deploy**:
   - Vercel will use the `vercel.json` configuration
   - Build will run from the frontend directory
   - Output will be served from frontend/dist

## Build Process

The build process now:
1. Changes to the frontend directory
2. Installs dependencies with `npm install`
3. Runs `npm run build` (TypeScript compilation + Vite build)
4. Outputs files to `frontend/dist`
5. Serves the built files

## Troubleshooting

If you encounter issues:

1. **Check Vercel logs** for specific error messages
2. **Verify file paths** in vercel.json match your project structure
3. **Test build locally** with `cd frontend && npm run build`
4. **Check for TypeScript errors** before deploying

## Environment Variables

If your app needs environment variables:
1. Add them in Vercel dashboard under Project Settings > Environment Variables
2. Prefix with `VITE_` for client-side variables
3. Use regular names for server-side variables

## Custom Domain

After deployment:
1. Go to Vercel dashboard
2. Navigate to your project
3. Go to Settings > Domains
4. Add your custom domain 