# 🚀 PsyTrade Frontend - Setup & Deployment Guide

**Application**: PsyTrade Multi-Agent Trading Dashboard  
**Framework**: Next.js 16 (React)  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Backend Integration](#backend-integration)
6. [Environment Variables](#environment-variables)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   # Should output: v18.x.x or higher
   ```

2. **npm** (v9 or higher)
   ```bash
   # Check version
   npm --version
   # Should output: 9.x.x or higher
   ```

3. **Git** (for cloning repository)
   ```bash
   git --version
   ```

### System Requirements

- **OS**: macOS, Linux, or Windows
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 500MB for dependencies
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

---

## 📦 Installation

### Step 1: Navigate to Project Directory

```bash
cd /path/to/multi_agent_trader
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output**:
```
added 342 packages, and audited 343 packages in 45s
```

**If you see errors**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## ⚙️ Configuration

### Step 1: Create Environment File

The project includes a `.env.local` file with default configuration. Verify it exists:

```bash
ls -la .env.local
```

If it doesn't exist, create it:

```bash
cat > .env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TRADING=false
NEXT_PUBLIC_ENABLE_OBSERVER=true
NEXT_PUBLIC_ENABLE_SENTINEL=true
NEXT_PUBLIC_ENABLE_MOCKING=true

# Polling Intervals (milliseconds)
NEXT_PUBLIC_POLL_INTERVAL_ACTIVE=5000
NEXT_PUBLIC_POLL_INTERVAL_IDLE=30000
EOF
```

### Step 2: Verify Configuration

```bash
cat .env.local
```

**Important**: The file should contain all the variables shown above.

---

## 🏃 Running the Application

### Development Mode (Recommended for Testing)

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

**Access the application**:
- Open browser and navigate to: **http://localhost:3000**

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

**Expected output**:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000

✓ Ready in 1.2s
```

---

## 🔌 Backend Integration

The frontend can run in **two modes**:

### Mode 1: Mock Data (Default)

**When to use**: Backend is not running or not ready

**Configuration**:
```bash
# In .env.local
NEXT_PUBLIC_ENABLE_MOCKING=true
```

**What happens**:
- Frontend uses Mock Service Worker (MSW)
- All API calls return fake data
- No backend required
- Perfect for frontend development

**How to verify**:
1. Start the app: `npm run dev`
2. Open browser console (F12)
3. Look for: `[MSW] Mocking enabled - API requests will be intercepted`

---

### Mode 2: Real Backend

**When to use**: Backend is running and ready

**Configuration**:
```bash
# In .env.local
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key
```

**Prerequisites**:
1. Backend server must be running on `http://localhost:8000`
2. Backend must have CORS enabled for `http://localhost:3000`
3. API key must match backend configuration

**How to verify**:
1. Start the app: `npm run dev`
2. Open browser console (F12)
3. Look for: `[MSW] Mocking disabled - using real backend API`
4. Check Network tab for API calls to `localhost:8000`

**Testing backend connection**:
```bash
# Test if backend is accessible
curl http://localhost:8000/api/v1/monitor/list \
  -H "X-API-Key: dev_secret_key"

# Should return JSON array of watchlist tickers
```

---

## 🌍 Environment Variables

### API Configuration

#### `NEXT_PUBLIC_API_URL`
- **Purpose**: Backend API base URL
- **Default**: `http://localhost:8000/api/v1`
- **Production**: Change to your deployed backend URL
- **Example**: `https://api.psytrade.com/api/v1`

#### `NEXT_PUBLIC_API_KEY`
- **Purpose**: Authentication key for API requests
- **Default**: `dev_secret_key`
- **Production**: Use secure, randomly generated key
- **Note**: Visible in browser (client-side)

---

### Feature Flags

#### `NEXT_PUBLIC_ENABLE_REAL_TRADING`
- **Purpose**: Enable/disable real money trading
- **Default**: `false` (paper trading only)
- **Values**: `true` | `false`
- **⚠️ WARNING**: Only set to `true` in production with real Alpaca account

#### `NEXT_PUBLIC_ENABLE_OBSERVER`
- **Purpose**: Enable user behavior tracking
- **Default**: `true`
- **Values**: `true` | `false`
- **What it tracks**: Chart views, ticker clicks, trade actions

#### `NEXT_PUBLIC_ENABLE_SENTINEL`
- **Purpose**: Enable alert system
- **Default**: `true`
- **Values**: `true` | `false`
- **What it shows**: Risk warnings, opportunities, info alerts

#### `NEXT_PUBLIC_ENABLE_MOCKING`
- **Purpose**: Use mock data vs real backend
- **Default**: `true` (mock data)
- **Values**: `true` | `false`
- **Change to `false`**: When backend is ready

---

### Polling Intervals

#### `NEXT_PUBLIC_POLL_INTERVAL_ACTIVE`
- **Purpose**: Update frequency when user is active (milliseconds)
- **Default**: `5000` (5 seconds)
- **Recommended**: 2000-10000 (2-10 seconds)
- **Lower = more real-time, higher server load**

#### `NEXT_PUBLIC_POLL_INTERVAL_IDLE`
- **Purpose**: Update frequency when tab is in background
- **Default**: `30000` (30 seconds)
- **Recommended**: 5-10x the active interval

---

## 🏗️ Build & Deployment

### Development Build

```bash
npm run dev
```
- Hot reload enabled
- Source maps included
- Slower performance
- Use for development only

---

### Production Build

```bash
# Step 1: Build
npm run build
```

**Expected output**:
```
▲ Next.js 16.1.6 (Turbopack)
- Environments: .env.local

Creating an optimized production build ...
✓ Compiled successfully in 2.9s
✓ Generating static pages (4/4) in 195.4ms
✓ Finalizing page optimization in 7.8ms

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

```bash
# Step 2: Start production server
npm start
```

**Production optimizations**:
- Minified JavaScript
- Optimized images
- Tree-shaking (removes unused code)
- Better performance

---

### Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_ENABLE_MOCKING=false`
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend
- [ ] Update `NEXT_PUBLIC_API_KEY` to production key
- [ ] Set `NEXT_PUBLIC_ENABLE_REAL_TRADING` appropriately
- [ ] Test all features with production backend
- [ ] Verify CORS is configured on backend
- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm start`

---

## 🐛 Troubleshooting

### Issue 1: Port 3000 Already in Use

**Error**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
```

---

### Issue 2: Module Not Found Errors

**Error**:
```
Module not found: Can't resolve '@/components/...'
```

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

---

### Issue 3: CORS Errors

**Error** (in browser console):
```
Access to fetch at 'http://localhost:8000/api/v1/...' has been blocked by CORS policy
```

**Solution**:
Backend must enable CORS for `http://localhost:3000`:

```python
# Backend CORS configuration (FastAPI example)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

---

### Issue 4: Environment Variables Not Loading

**Symptom**: Changes to `.env.local` not reflected

**Solution**:
```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Verify .env.local exists
cat .env.local

# 3. Restart dev server
npm run dev

# 4. Check console for confirmation
# Should see: [MSW] Mocking enabled/disabled
```

**Note**: Environment variables are loaded at build time. Always restart after changes.

---

### Issue 5: Build Fails with TypeScript Errors

**Error**:
```
Failed to compile.
Type error: ...
```

**Solution**:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# If errors are in node_modules, try:
rm -rf node_modules package-lock.json
npm install

# If errors are in your code, fix them before building
```

---

### Issue 6: MSW Not Intercepting Requests

**Symptom**: Mock data not showing, seeing network errors

**Solution**:
```bash
# 1. Verify MSW is enabled
grep ENABLE_MOCKING .env.local
# Should show: NEXT_PUBLIC_ENABLE_MOCKING=true

# 2. Check browser console for MSW initialization
# Should see: [MSW] Mocking enabled

# 3. Verify service worker is registered
# Open DevTools → Application → Service Workers
# Should see: mockServiceWorker.js

# 4. If not working, clear cache and reload
# Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

### Issue 7: Blank Screen on Load

**Symptom**: Application shows blank white screen

**Solution**:
```bash
# 1. Check browser console for errors (F12)

# 2. Verify build is successful
npm run build

# 3. Clear browser cache
# Chrome: Settings → Privacy → Clear browsing data

# 4. Try incognito/private mode

# 5. Check if JavaScript is enabled in browser
```

---

## 📊 Verification Steps

After setup, verify everything works:

### 1. Check Application Loads
- [ ] Open http://localhost:3000
- [ ] See PsyTrade dashboard
- [ ] No errors in console

### 2. Check Mock Data (if MOCKING=true)
- [ ] See stock tickers in watchlist
- [ ] Charts display data
- [ ] Can add/remove tickers
- [ ] Console shows: `[MSW] Mocking enabled`

### 3. Check Backend Connection (if MOCKING=false)
- [ ] Console shows: `[MSW] Mocking disabled`
- [ ] Network tab shows requests to `localhost:8000`
- [ ] API responses return successfully
- [ ] No CORS errors

### 4. Check Features
- [ ] Analysis tab displays reports
- [ ] Auto Trade tab shows positions
- [ ] Charts render correctly
- [ ] Trade execution works
- [ ] Alerts display (if Sentinel enabled)

---

## 🔄 Switching Between Mock and Real Backend

### Switch to Mock Data

```bash
# 1. Edit .env.local
NEXT_PUBLIC_ENABLE_MOCKING=true

# 2. Restart server
# Stop: Ctrl+C
npm run dev

# 3. Verify in console
# Should see: [MSW] Mocking enabled
```

### Switch to Real Backend

```bash
# 1. Ensure backend is running
curl http://localhost:8000/api/v1/monitor/list \
  -H "X-API-Key: dev_secret_key"

# 2. Edit .env.local
NEXT_PUBLIC_ENABLE_MOCKING=false

# 3. Restart server
# Stop: Ctrl+C
npm run dev

# 4. Verify in console
# Should see: [MSW] Mocking disabled
```

---

## 📝 Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npx tsc --noEmit

# Clear cache and reinstall
rm -rf node_modules package-lock.json && npm install

# Test backend connection
curl http://localhost:8000/api/v1/monitor/list -H "X-API-Key: dev_secret_key"
```

---

## 🎯 Common Scenarios

### Scenario 1: First Time Setup
```bash
cd multi_agent_trader
npm install
npm run dev
# Open http://localhost:3000
```

### Scenario 2: Backend Integration
```bash
# 1. Ensure backend is running on port 8000
# 2. Edit .env.local: NEXT_PUBLIC_ENABLE_MOCKING=false
# 3. Restart: npm run dev
# 4. Test in browser
```

### Scenario 3: Production Deployment
```bash
# 1. Update .env.local with production values
# 2. Build: npm run build
# 3. Test: npm start
# 4. Deploy to hosting platform
```

---

## 📞 Support

### Logs to Check

1. **Browser Console** (F12 → Console)
   - JavaScript errors
   - MSW status messages
   - API request/response logs

2. **Network Tab** (F12 → Network)
   - API requests
   - Response status codes
   - CORS errors

3. **Terminal Output**
   - Build errors
   - TypeScript errors
   - Server startup messages

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `EADDRINUSE` | Port already in use | Kill process or use different port |
| `Module not found` | Missing dependency | Run `npm install` |
| `CORS policy` | Backend CORS not configured | Configure backend CORS |
| `Failed to compile` | TypeScript/build error | Check terminal for details |
| `Network error` | Backend not reachable | Verify backend is running |

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file configured
- [ ] Application runs (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] No errors in browser console
- [ ] Mock data displays (if MOCKING=true)
- [ ] Backend connection works (if MOCKING=false)
- [ ] All features tested and working

---

## 🎉 Success!

If you've completed all steps and the application is running without errors, you're all set!

**Next Steps**:
1. Explore the application features
2. Test with real backend when ready
3. Customize as needed
4. Deploy to production

**Happy Trading!** 📈
