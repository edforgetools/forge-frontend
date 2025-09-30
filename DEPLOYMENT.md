# Deployment Guide

This guide covers deploying the Forge Frontend to Vercel and the backend server to Render.

## Frontend Deployment (Vercel)

### Prerequisites

- Vercel account
- GitHub repository with your code
- Backend server deployed and accessible

### Steps

1. **Connect Repository to Vercel**

   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect this as a Vite project

2. **Configure Build Settings**

   - Framework Preset: Vite
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   In Vercel dashboard, go to Project Settings > Environment Variables:

   ```
   VITE_API_BASE=https://your-backend-domain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your app will be available at `https://your-project-name.vercel.app`

### Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

- Build command: `npm run build:prod`
- Output directory: `dist`
- Asset caching for better performance
- SPA routing support

## Backend Server Deployment (Render)

### Prerequisites

- Render account
- Backend code repository
- Environment variables ready

### Steps

1. **Create New Web Service**

   - Go to [render.com](https://render.com) and sign in
   - Click "New +" > "Web Service"
   - Connect your repository

2. **Configure Service Settings**

   - **Name**: `forge-backend` (or your preferred name)
   - **Runtime**: Node.js (or appropriate for your backend)
   - **Build Command**: `npm install` (or your build command)
   - **Start Command**: `npm start` (or your start command)
   - **Port**: `8787`

3. **Set Environment Variables**
   In Render dashboard, go to Environment tab:

   ```
   NODE_ENV=production
   PORT=8787
   # Add your backend-specific environment variables
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Your API will be available at `https://your-service-name.onrender.com`

## Environment Variables

### Frontend (.env.local)

```bash
# Copy from .env.example and update
VITE_API_BASE=https://your-backend-domain.com
VITE_DEBUG=false
```

### Backend

Set these in your Render environment variables:

```bash
NODE_ENV=production
PORT=8787
# Add your specific backend environment variables
```

## Post-Deployment Checklist

### Frontend

- [ ] Verify all pages load correctly
- [ ] Test API connectivity
- [ ] Check console for errors
- [ ] Verify environment variables are loaded
- [ ] Test all tool functionality

### Backend

- [ ] Verify API endpoints respond correctly
- [ ] Check logs for errors
- [ ] Test CORS settings for frontend domain
- [ ] Verify database connections (if applicable)
- [ ] Test file uploads/downloads (if applicable)

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure backend CORS is configured for your frontend domain
   - Check that VITE_API_BASE points to the correct backend URL

2. **Environment Variables Not Loading**

   - Verify variable names start with `VITE_` for frontend
   - Check that variables are set in the correct environment (production)

3. **Build Failures**

   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Check for missing environment variables

4. **Routing Issues**
   - Ensure Vercel rewrites are configured correctly
   - Check that all HTML files are included in vite.config.ts

### Useful Commands

```bash
# Local development
npm run dev

# Production build
npm run build:prod

# Type checking
npm run type-check

# Preview production build locally
npm run preview
```

## Monitoring

- **Frontend**: Use Vercel Analytics for performance monitoring
- **Backend**: Use Render logs and metrics for server monitoring
- **Errors**: Set up error tracking (Sentry, etc.) for both frontend and backend

## Updates

To update your deployment:

1. Push changes to your repository
2. Vercel will automatically redeploy the frontend
3. Render will automatically redeploy the backend (if auto-deploy is enabled)
4. Verify the updates work correctly in production
