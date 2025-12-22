# Production Deployment Guide - Next.js 15 + PM2

## Issues Fixed

### ✅ Header Error: `TypeError: Invalid character in header content ["x-action-redirect"]`

**Root Causes Identified:**
1. Missing explicit status codes in `NextResponse.redirect()` calls
2. Middleware redirects without proper error handling
3. Invalid characters in header values
4. Next.js 15 stricter header validation in production

**Solutions Applied:**
- Added explicit `{ status: 307 }` to all redirects
- Wrapped middleware in try-catch for production safety
- Improved URL construction for redirects
- Added production-specific error logging

---

## Critical Changes Made

### 1. Middleware (`src/middleware.ts`)

**Before (Causing Crashes):**
```typescript
return NextResponse.redirect(new URL('/login', request.url));
```

**After (Production-Safe):**
```typescript
const loginUrl = new URL('/login', request.url);
return NextResponse.redirect(loginUrl, { status: 307 });
```

**Key Improvements:**
- ✅ Explicit status codes prevent header corruption
- ✅ Separate URL construction prevents invalid characters
- ✅ Try-catch wrapper prevents middleware crashes
- ✅ Production-specific error logging

### 2. Next.js Config (`next.config.ts`)

**Added:**
- Server actions body size limit
- Proper headers configuration
- Compression enabled
- Disabled powered-by header

### 3. PM2 Config (`ecosystem.config.js`)

**Improvements:**
- Increased `min_uptime` to prevent rapid restart loops
- Added `restart_delay` for exponential backoff
- Better memory limits
- Graceful shutdown handling
- Kill timeout configuration

---

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Test Production Build Locally
```bash
npm start
```

### 3. Deploy with PM2
```bash
# Stop existing instance
pm2 stop mark-international-frontend

# Delete old instance
pm2 delete mark-international-frontend

# Start with new config
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 4. Monitor for Issues
```bash
# Watch logs in real-time
pm2 logs mark-international-frontend

# Check status
pm2 status

# Monitor resources
pm2 monit
```

---

## Troubleshooting

### If You Still See Restart Loops:

1. **Check PM2 Logs:**
   ```bash
   pm2 logs mark-international-frontend --lines 100
   ```

2. **Check Error Logs:**
   ```bash
   tail -f logs/err.log
   ```

3. **Verify Environment Variables:**
   ```bash
   pm2 env 0
   ```

4. **Check Port Availability:**
   ```bash
   netstat -ano | findstr :3000
   ```

### Common Issues:

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# or
taskkill /F /PID <PID>
```

#### Memory Issues
- Increase `max_memory_restart` in ecosystem.config.js
- Check for memory leaks using `pm2 monit`

#### Middleware Still Crashing
- Check PM2 logs for the exact error
- Verify JWT secret is set correctly
- Ensure backend URL is configured

---

## Environment Variables Required

Create `.env` file with:
```env
NEXT_PUBLIC_BACKEND_URI=https://your-backend-url.com
NODE_ENV=production
PORT=3000
```

---

## Next.js 15 Specific Notes

### Redirect Best Practices:
1. ✅ Always use explicit status codes: `{ status: 307 }` for temporary, `{ status: 308 }` for permanent
2. ✅ Construct URLs separately before passing to redirect
3. ✅ Use try-catch in middleware to prevent crashes
4. ✅ Avoid setting custom redirect headers manually

### Avoid These Patterns:
```typescript
// ❌ BAD - Can cause header errors
return NextResponse.redirect(new URL('/login', request.url));

// ❌ BAD - No error handling
response.headers.set('x-redirect', url);

// ✅ GOOD - Explicit status, separate URL construction
const loginUrl = new URL('/login', request.url);
return NextResponse.redirect(loginUrl, { status: 307 });
```

---

## Monitoring Commands

```bash
# Real-time logs
pm2 logs --lines 50

# Restart with zero downtime
pm2 reload mark-international-frontend

# Flush logs
pm2 flush

# Show detailed info
pm2 show mark-international-frontend
```

---

## Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
npm run build -- --profile

# Check for duplicate packages
npx npm-check-duplicates
```

### 2. PM2 Clustering
If your server has multiple cores, update ecosystem.config.js:
```javascript
instances: 'max', // Use all CPU cores
exec_mode: 'cluster'
```

### 3. Memory Optimization
Monitor memory usage:
```bash
pm2 monit
```

If memory grows continuously, investigate memory leaks in your code.

---

## Rollback Plan

If deployment fails:
```bash
# Stop current version
pm2 stop mark-international-frontend

# Restore from backup
cd /path/to/backup
pm2 start ecosystem.config.js

# Or restore previous PM2 config
pm2 resurrect
```

---

## Health Check Endpoint

Consider adding a health check API route:

Create `src/app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

Test with:
```bash
curl http://localhost:3000/api/health
```

---

## Success Indicators

✅ No PM2 restart loops
✅ No "Invalid character in header" errors
✅ Logs show successful requests
✅ Application accessible via browser
✅ Authentication flow works correctly

---

## Support

If issues persist:
1. Check PM2 logs: `pm2 logs`
2. Check system resources: `pm2 monit`
3. Verify Next.js build succeeded: `ls -la .next`
4. Test locally first: `npm start`
5. Check this documentation for similar issues
