# Deployment Guide - MyYachtsInsurance to Vercel

## Overview

This guide walks you through deploying the MyYachtsInsurance platform to Vercel with all environment variables properly configured.

## Prerequisites

- Vercel account (create at https://vercel.com)
- Project already connected to GitHub
- Environment variables ready (from `.env.local`)

## Step 1: Configure Vercel Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click on your **client** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (copy from below):

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://gelaikvydtlktpsryucc.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpa3Z5ZHRsa3Rwc3J5dWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTA5NzQsImV4cCI6MjA3ODU2Njk3NH0.PLACEHOLDER_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpa3Z5ZHRsa3Rwc3J5dWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5MDk3NCwiZXhwIjoyMDc4NTY2OTc0fQ.Yni4c8vfWMaGTgDJ6WU9RELyo-SceREahZUFg8OLr8w

SCRAPER_API_KEY
Value: ca82a76c02a947dc1761448f2b5d99874eab6278f5a450e3feae7044885bf6cb
```

5. **Important:** Set each variable to apply to:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

6. Click **Save**

### Option B: Via Vercel CLI (If you have credentials)

```bash
cd /Users/celeste7/MYI2/client

# Set each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://gelaikvydtlktpsryucc.supabase.co
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter the anon key value

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Enter the service role key value

vercel env add SCRAPER_API_KEY
# Enter: ca82a76c02a947dc1761448f2b5d99874eab6278f5a450e3feae7044885bf6cb
```

## Step 2: Trigger Deployment

### Option A: Push to GitHub (Recommended - Auto Deploy)

```bash
# Already done! Just verify in Vercel Dashboard
# Vercel will automatically deploy when you push to main
```

**Status:** Check https://vercel.com/dashboard → client project → Deployments

### Option B: Manual Deploy via CLI

```bash
cd /Users/celeste7/MYI2/client
vercel --prod --yes
```

Expected output:
```
Vercel CLI 47.1.0
...
✓ Production: https://myyachtsinsurance.com [in X seconds]
```

## Step 3: Verify Deployment

### Health Check

```bash
curl https://myyachtsinsurance.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2024-01-12T..."
}
```

### Test Home Page

Visit: https://myyachtsinsurance.com

Should see:
- ✅ MyYachtsInsurance header/logo
- ✅ Navigation menu
- ✅ Hero section
- ✅ No console errors

### Test Signup

1. Go to https://myyachtsinsurance.com/signup
2. Create test account
3. Should redirect to /onboarding
4. Fill in profile data
5. Should redirect to home

### Test Knowledge Base

Visit: https://myyachtsinsurance.com/knowledge

Should display Q&A entries from database.

## Step 4: Monitor Deployment

### View Deployment Logs

1. Go to Vercel Dashboard → client project
2. Click on latest deployment
3. View build logs and runtime logs

### Check Errors

1. Vercel Dashboard → Monitoring
2. Look for any error spikes
3. Check database connection status

### Monitor Performance

1. Vercel Analytics (if enabled)
2. Check response times
3. Monitor database query performance

## Troubleshooting

### Issue: "Environment Variable missing" during build

**Solution:**
1. Verify all variables are set in Vercel Dashboard
2. Make sure they're set for **Production** environment
3. Trigger new deployment after setting variables

**How to redeploy:**
```bash
vercel --prod --yes
# Or push to GitHub:
git push origin main
```

### Issue: Signup fails silently

**Solution:**
1. Check `/api/health` endpoint
2. Verify Supabase credentials in environment variables
3. Check Supabase project is active (not paused)
4. View Vercel logs for error messages

### Issue: Database connection failed

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Check Supabase project status at https://app.supabase.com
3. Verify IP whitelist (if using Supabase firewall)

### Issue: CORS errors from browser

**Solution:**
1. Update CORS settings in Supabase project
2. Add your Vercel domain to allowed origins:
   - https://myyachtsinsurance.com
   - https://*.myyachtsinsurance.com

## Post-Deployment Checklist

- [ ] Health check endpoint responds (200)
- [ ] Home page loads without errors
- [ ] Signup process works
- [ ] Login process works
- [ ] Can create posts
- [ ] Can view knowledge base
- [ ] Database writes are persisting
- [ ] No console errors in browser DevTools
- [ ] Vercel monitoring shows no critical errors
- [ ] Email notifications working (if configured)

## Rollback (If needed)

### Rollback to Previous Version

1. Go to Vercel Dashboard → client project → Deployments
2. Find the previous successful deployment
3. Click "..." menu → Promote to Production
4. Confirm rollback

### Rollback via CLI

```bash
# View deployment history
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-id>
```

## Additional Configuration

### Setting Custom Domain

1. Vercel Dashboard → client project → Settings → Domains
2. Add your domain: `myyachtsinsurance.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-10 minutes)

### Enable Cron Jobs

The `vercel.json` already configures cron jobs. They will automatically run on Vercel's serverless platform:

```json
"crons": [
  {
    "path": "/api/cron/daily-scrape",
    "schedule": "0 2 * * *"
  }
]
```

**Note:** You may need to add `/api/cron/daily-scrape` endpoint if not present. Check Vercel documentation for serverless cron setup.

### Analytics & Monitoring

Enable in Vercel Dashboard:
1. Settings → Analytics (Vercel provides free basic analytics)
2. Settings → Error Tracking
3. Settings → Performance Monitoring

## Performance Tuning

### Optimize Bundle Size

```bash
npm run build -- --analyze
```

Target:
- Each route < 200KB
- Shared JS < 100KB

### Database Query Optimization

Monitor in Supabase:
- Dashboard → Logs → Slow Queries
- Target: All queries < 100ms

### CDN Configuration

Vercel automatically provides:
- Global CDN caching
- Image optimization
- Compression

## Scaling

As traffic grows:

1. **Upgrade Supabase Plan**
   - Go to https://app.supabase.com
   - Project Settings → Billing
   - Scale up connections/storage as needed

2. **Enable Vercel Analytics**
   - Monitor traffic patterns
   - Identify slow endpoints
   - Plan capacity accordingly

3. **Consider Database Read Replicas**
   - Supabase Enterprise feature
   - Improves read performance

## Support

For deployment issues:

1. Check Vercel Dashboard logs
2. Check Supabase project status
3. Review RUNBOOK_QA.md → Troubleshooting
4. Contact Vercel support: https://vercel.com/help
5. Contact Supabase support: https://supabase.com/support

## Reference

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

---

**Deployment Date:** January 12, 2024
**Status:** ✅ Ready for Production
**Version:** 0.1.0
