# Production Deployment Guide

## System Status

✅ **Deep Crawl Pipeline:** Fully operational and tested
✅ **Orchestration System:** Running 3x daily via cron jobs
✅ **Database:** 1,308+ Q&A entries
✅ **Build:** Next.js project builds successfully

## Current Setup

### Local Collection (Running Now)
- **Script:** `orchestrate.py`
- **Frequency:** 3x daily (8 AM, 2 PM, 8 PM)
- **Process:**
  1. Deep crawl all 16 domains (238 pages)
  2. Extract Q&A pairs (1,000+ pairs)
  3. Push to Supabase database via API

### Cron Jobs Status
```
0 8 * * * cd /Users/celeste7/MYI2 && python3 orchestrate.py >> /Users/celeste7/MYI2/logs/orchestrate_8am.log 2>&1
0 14 * * * cd /Users/celeste7/MYI2 && python3 orchestrate.py >> /Users/celeste7/MYI2/logs/orchestrate_2pm.log 2>&1
0 20 * * * cd /Users/celeste7/MYI2 && python3 orchestrate.py >> /Users/celeste7/MYI2/logs/orchestrate_8pm.log 2>&1
```

## Deployment Steps

### 1. Verify Local Collection is Working
```bash
# Check recent logs
tail -f /Users/celeste7/MYI2/logs/orchestrate_8am.log
```

### 2. Push Code to GitHub
```bash
cd /Users/celeste7/MYI2/client
git add .
git commit -m "Production ready: Deep crawler + 3x daily pipeline"
git push origin main
```

### 3. Deploy to Vercel
```bash
# Option A: Push to GitHub (auto-deploys if connected)
# Option B: Use Vercel CLI
npm i -g vercel
cd /Users/celeste7/MYI2/client
vercel --prod
```

### 4. Verify Production
- Frontend: https://myyachtsinsurance.com
- Check /posts endpoint for Q&A entries

## What Gets Deployed

**Frontend (Vercel):**
- Next.js React app
- API routes for CRUD operations
- Database connections (Supabase)

**Backend (Local/Your Server):**
- Python orchestration (`orchestrate.py`)
- Deep crawler (`deep_crawler.py`)
- Q&A extractor (`extract_from_deep_crawl.py`)
- Cron jobs (3x daily)

## Database Growth Projection

- **Current:** 1,308 entries
- **Per day:** ~100-150 new entries (3 crawls × 30-50 unique pairs)
- **Per week:** ~700-1,050 entries
- **Per month:** ~3,000-4,500 entries

## Monitoring

### Check Collection Status
```bash
# View latest orchestration run
tail -20 /Users/celeste7/MYI2/orchestration.log

# Check stats
cat /Users/celeste7/MYI2/orchestration_stats.json | jq .
```

### Monitor Cron Jobs
```bash
# View system logs for cron execution
log stream --predicate 'eventMessage contains[cd] "orchestrate"' --level debug
```

## Troubleshooting

### If collection stops:
1. Check cron jobs: `crontab -l | grep orchestrate`
2. Check Python environment: `python3 --version`
3. Check logs: `/Users/celeste7/MYI2/logs/`

### If imports fail:
- Check database connection in API route
- Verify Supabase credentials in `.env.local`
- Check duplicate constraints (expected after multiple runs)

## Next Steps

1. Deploy frontend to Vercel (connects to production DB)
2. Monitor cron jobs for 24 hours
3. Verify database is growing daily
4. Consider scaling to more domains if needed

