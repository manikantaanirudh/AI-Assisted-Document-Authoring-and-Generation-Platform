# Render Deployment Guide

## Complete Steps to Deploy on Render

### Prerequisites
1. GitHub account with your repository pushed
2. Render account (sign up at https://render.com)
3. Gemini API key ready

---

## Step 1: Sign Up / Log In to Render

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign In"**
3. Sign in with your GitHub account
4. Authorize Render to access your repositories

---

## Step 2: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `document-platform-db`
   - **Database**: `document_platform`
   - **User**: (auto-generated)
   - **Region**: `Oregon (US West)` (or closest to you)
   - **Plan**: **Free**
3. Click **"Create Database"**
4. Wait for database to be created (takes ~2 minutes)
5. **Copy the Internal Database URL** (you'll need this)

---

## Step 3: Deploy Backend (FastAPI)

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Select `AI-Assisted-Document-Authoring-and-Generation-Platform`
3. Configure service:
   - **Name**: `document-platform-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: **Free**

4. Add Environment Variables (click **"Advanced"** → **"Add Environment Variable"**):
   
   | Key | Value | Notes |
   |-----|-------|-------|
   | `PYTHON_VERSION` | `3.12.0` | |
   | `DATABASE_URL` | (Paste Internal Database URL from Step 2) | |
   | `JWT_SECRET` | (Click "Generate" button) | Auto-generate secure key |
   | `JWT_ALGORITHM` | `HS256` | |
   | `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
   | `LLM_PROVIDER` | `gemini` | |
   | `GEMINI_API_KEY` | `AIzaSyAawrK4VzONcMJ8B7rGfift2Mbx6Psxd2Y` | Your Gemini API key |
   | `LLM_API_KEY` | `AIzaSyAawrK4VzONcMJ8B7rGfift2Mbx6Psxd2Y` | Same as GEMINI_API_KEY |
   | `EXPORT_TMP_DIR` | `./exports` | |
   | `FRONTEND_URL` | `https://document-platform-frontend.onrender.com` | Update after Step 4 |
   | `BACKEND_URL` | `https://document-platform-backend.onrender.com` | Your backend URL |
   | `CORS_ORIGINS` | `https://document-platform-frontend.onrender.com` | Update after Step 4 |

5. Click **"Create Web Service"**
6. Wait for deployment (~5-10 minutes)
7. **Copy your backend URL** (e.g., `https://document-platform-backend.onrender.com`)
8. Test health endpoint: Visit `https://your-backend-url.onrender.com/health`

---

## Step 4: Deploy Frontend (React)

1. From Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository (same repo)
3. Configure service:
   - **Name**: `document-platform-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `build`

4. Add Environment Variable:
   
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://document-platform-backend.onrender.com` |
   
   (Use the backend URL from Step 3)

5. Click **"Create Static Site"**
6. Wait for deployment (~5-10 minutes)
7. **Copy your frontend URL** (e.g., `https://document-platform-frontend.onrender.com`)

---

## Step 5: Update Backend CORS Settings

1. Go back to your **Backend service** in Render
2. Click **"Environment"** tab
3. Update these variables with your actual frontend URL:
   - `FRONTEND_URL` → `https://document-platform-frontend.onrender.com`
   - `CORS_ORIGINS` → `https://document-platform-frontend.onrender.com`
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## Step 6: Test Your Deployment

1. Visit your frontend URL: `https://document-platform-frontend.onrender.com`
2. Click **"Create Account"**
3. Register with a valid email (e.g., `test@example.com`)
4. Login with your credentials
5. Create a new project (Word or PowerPoint)
6. Test AI content generation
7. Test document export

---

## Important Notes

### Free Tier Limitations
- **Backend & Database**: Services spin down after 15 minutes of inactivity
- **First request**: May take 30-60 seconds (cold start)
- **Database**: 90-day expiry on free plan
- **Monthly limits**: 750 hours of runtime

### Upgrade to Keep Services Active
If you need 24/7 availability:
1. Upgrade backend to **Starter Plan** ($7/month)
2. Upgrade database to **Starter Plan** ($7/month)

### Custom Domain (Optional)
1. Go to your frontend service → **"Settings"** → **"Custom Domain"**
2. Add your domain and follow DNS instructions

---

## Troubleshooting

### Backend Not Starting
- Check **"Logs"** tab in Render dashboard
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` is from the Internal Database URL (not External)

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` points to your backend URL
- Check backend CORS settings include your frontend URL
- Check backend health endpoint works

### Database Connection Errors
- Use **Internal Database URL** (not External)
- Verify database is running (green status in dashboard)

### Migrations Failing
- Check if database is accessible
- Verify `DATABASE_URL` format is correct
- Check build logs for error messages

---

## Monitoring & Maintenance

### View Logs
- Backend: Dashboard → Your Service → **"Logs"** tab
- Database: Dashboard → Database → **"Logs"** tab

### Redeploy
- **Auto-deploy**: Enabled by default on git push to `main`
- **Manual**: Dashboard → Your Service → **"Manual Deploy"** → **"Deploy latest commit"**

### Environment Variables
- Can be updated anytime in **"Environment"** tab
- Service auto-redeploys when env vars change

---

## Success! 🎉

Your AI Document Authoring Platform is now live on Render!

- **Frontend**: https://document-platform-frontend.onrender.com
- **Backend API**: https://document-platform-backend.onrender.com
- **API Docs**: https://document-platform-backend.onrender.com/docs

Share your frontend URL with users to access the platform!
