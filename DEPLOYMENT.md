# SPELINX Deployment Guide

## 🚀 Quick Deploy to Render

### Step 1: Prepare Environment Variables
Create a new repository on GitHub and set these environment variables in Render:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
ALLOWED_ORIGINS=https://your-app-name.onrender.com
FRONTEND_URL=https://your-app-name.onrender.com
```

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - SPELINX Gaming Platform"
git branch -M main
git remote add origin https://github.com/yourusername/spelinx.git
git push -u origin main
```

### Step 3: Deploy on Render
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Runtime**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Production

### Step 4: Set Environment Variables
In Render dashboard, add environment variables from Step 1.

### Step 5: Deploy
Click "Create Web Service" - deployment will start automatically!

## 🔧 Build Process

The build process automatically:
1. Installs backend dependencies
2. Builds the Next.js frontend with static export
3. Generates static HTML files in `spelinx-frontend/out/`
4. Server serves static files from the `out/` directory

## 🌐 Production URLs

After deployment:
- **Website**: `https://your-app-name.onrender.com`
- **API Base**: `https://your-app-name.onrender.com/api`

## 🗄️ Database Setup

### MongoDB Atlas
1. Create cluster on MongoDB Atlas
2. Create database user
3. Get connection string
4. Add IP address (0.0.0.0/0 for testing)
5. Set `MONGO_URI` environment variable

## 🔐 Security Notes

- **JWT_SECRET**: Use a strong, random 32+ character string
- **MONGO_URI**: Never commit to version control
- **Environment Variables**: Always set in Render dashboard, never in code

## 🧪 Testing Deployment

After deployment, test:
- ✅ Homepage loads with glassmorphism design
- ✅ Games are accessible
- ✅ Authentication works
- ✅ Admin panel accessible
- ✅ API endpoints respond
- ✅ MongoDB connection established

## 📊 Monitoring

Check Render logs for:
- Build success/failure
- Runtime errors
- Database connection status
- API request logs

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (18+ required)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Static Export Not Found
- Verify `output: 'export'` in next.config.js
- Check `distDir: 'out'` configuration
- Ensure all required files are present

### Database Connection Issues
- Verify MONGO_URI format
- Check IP whitelist in MongoDB Atlas
- Confirm database user credentials

### 404 Errors on Routes
- Ensure static export is working
- Check server.js routing logic
- Verify file paths in build output

## 🎯 Performance Optimization

- Static export reduces server load
- Images are optimized and served from Next.js
- Rate limiting prevents abuse
- CORS properly configured

## 🔄 Updates

To update your deployed app:
1. Make changes locally
2. Test thoroughly
3. Push to GitHub main branch
4. Render auto-deploys changes

## 📞 Support

For issues:
- Check Render logs
- Verify environment variables
- Test locally first
- Check MongoDB Atlas status

---

**Happy deploying! 🚀**