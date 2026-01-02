# 🚀 Netlify Deployment Guide for BookBarn

## 📋 Overview

We'll deploy:
- **Frontend** → Netlify
- **Backend** → Railway (free tier with MySQL)

## Part 1: Deploy Backend to Railway

### Step 1: Sign Up for Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `bookbarn` repository
4. Railway will detect it's a Spring Boot app

### Step 3: Configure Backend Service

1. **Root Directory:** Set to `bookapp`
2. **Build Command:** `mvn clean install -DskipTests`
3. **Start Command:** `java -jar target/book-0.0.1-SNAPSHOT.jar`

### Step 4: Add MySQL Database

1. In your project, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will create a MySQL database
3. Copy the connection details

### Step 5: Set Environment Variables

In Railway dashboard → Your service → Variables, add:

```
DATABASE_URL=<Railway will auto-populate this>
SPRING_DATASOURCE_URL=${DATABASE_URL}
EMAIL_USERNAME=saibittu594@gmail.com
EMAIL_PASSWORD=zsxr jcis fzym epyq
JWT_SECRET=nLkPvZ3CJMb2pZVZ6oWRqF2u3Tt0tV8J5c71v0Z5XgA=
PORT=8080
```

root
FhDTWFHtgcBOGtWrpEwdgoMYQpeolArD

### Step 6: Deploy Backend

1. Railway will automatically deploy
2. Wait for deployment to complete (2-3 minutes)
3. Copy your backend URL (e.g., `https://bookbarn-production.up.railway.app`)

## Part 2: Deploy Frontend to Netlify

### Step 1: Prepare Frontend

First, update the API URL in your frontend code.

**Update `frontend_bookapp/src/services/api.js`:**

```javascript
import axios from 'axios';

// Use environment variable or fallback to Railway URL
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.up.railway.app';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
```

### Step 2: Create Netlify Configuration

Create `frontend_bookapp/netlify.toml`:

```toml
[build]
  base = "frontend_bookapp"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Step 3: Create Environment File Template

Create `frontend_bookapp/.env.example`:

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

### Step 4: Deploy to Netlify

#### Option A: Using Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com/
2. Sign up/Login with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. Select your `bookbarn` repository
6. Configure build settings:
   - **Base directory:** `frontend_bookapp`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend_bookapp/dist`
7. Click **"Show advanced"** → **"New variable"**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.up.railway.app` (from Railway)
8. Click **"Deploy site"**

#### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Navigate to frontend
cd frontend_bookapp

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

When prompted:
- Create & configure a new site: Yes
- Team: Your team
- Site name: bookbarn (or your choice)

### Step 5: Set Environment Variables in Netlify

1. Go to Netlify Dashboard → Your site → **Site settings**
2. **Environment variables** → **Add a variable**
3. Add:
   ```
   VITE_API_URL = https://your-backend-url.up.railway.app
   ```
4. Click **"Save"**
5. **Trigger redeploy** → Deploys → Trigger deploy → Deploy site

## Part 3: Update Backend CORS

After getting your Netlify URL, update backend CORS settings.

**Update `bookapp/src/main/java/com/example/book/config/SecurityConfig.java`:**

```java
// CORS Configuration
http.cors(cors -> cors.configurationSource(request -> {
    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
    corsConfig.setAllowedOrigins(java.util.List.of(
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://your-site.netlify.app"  // Add your Netlify URL
    ));
    corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    corsConfig.setAllowedHeaders(java.util.List.of("*"));
    corsConfig.setAllowCredentials(true);
    return corsConfig;
}));
```

**Commit and push:**

```bash
git add .
git commit -m "Update CORS for Netlify deployment"
git push
```

Railway will auto-redeploy with the new CORS settings.

## ✅ Verification Checklist

Test your deployed application:

- [ ] Frontend loads at Netlify URL
- [ ] Backend API accessible (test: `https://your-backend.railway.app/otp/test`)
- [ ] User registration works
- [ ] OTP email is received
- [ ] Login works
- [ ] Books display correctly
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] Vendor registration works
- [ ] Delivery agent registration works
- [ ] All images load correctly

## 🔧 Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:** Check CORS settings in backend and ensure Netlify URL is added.

### Issue: API calls failing

**Solution:** 
1. Verify `VITE_API_URL` in Netlify environment variables
2. Check Railway backend is running
3. Test backend directly: `https://your-backend.railway.app/otp/test`

### Issue: Images not loading

**Solution:** Ensure image paths are relative, not absolute.

### Issue: 404 on page refresh

**Solution:** The `netlify.toml` redirect rule should fix this. If not, check it's in the correct location.

### Issue: Build fails on Netlify

**Solution:**
```bash
# Locally test build
cd frontend_bookapp
npm run build

# If successful, push to GitHub
git add .
git commit -m "Fix build issues"
git push
```

## 📊 Monitor Your Deployment

### Railway (Backend)
- Dashboard: https://railway.app/dashboard
- Logs: Click on your service → View logs
- Metrics: CPU, Memory, Network usage

### Netlify (Frontend)
- Dashboard: https://app.netlify.com/
- Deploy logs: Site → Deploys → Click on latest deploy
- Analytics: Site → Analytics

## 🔄 Update & Redeploy

When you make changes:

```bash
# Make changes to code
git add .
git commit -m "Description of changes"
git push
```

**Automatic deployments:**
- Railway: Auto-deploys on push to main branch
- Netlify: Auto-deploys on push to main branch

## 🎯 Your Live URLs

After deployment, you'll have:

- **Frontend:** `https://bookbarn.netlify.app` (or your custom domain)
- **Backend:** `https://bookbarn-production.up.railway.app`
- **Database:** Managed by Railway

## 🌐 Custom Domain (Optional)

### For Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### For Railway:
1. Go to your service → Settings
2. Add custom domain
3. Configure DNS records

## 💰 Cost Estimation

**Free Tier Limits:**
- **Railway:** 500 hours/month, $5 credit
- **Netlify:** 100GB bandwidth, 300 build minutes/month

Both are sufficient for development and small-scale production!

## 🎉 Success!

Your BookBarn application is now live! Share your URLs:

- Frontend: `https://your-site.netlify.app`
- Backend: `https://your-backend.railway.app`

Test all features and enjoy your deployed application! 🚀📚
