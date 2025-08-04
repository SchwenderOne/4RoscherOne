# Railway Deployment Guide for 4Roscher

This guide covers deploying the **4Roscher** household management app to Railway.

## Quick Deploy to Railway

1. **Create a Railway account**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Connect your repository**: Click "Deploy from GitHub repo" and select `SchwenderOne/4RoscherOne`
3. **Set environment variables**: In Railway dashboard, go to your service → Variables tab and add:

```
DATABASE_URL=postgresql://postgres:muncy4-Genjan-ceddup@db.fdmcfjhzgakxtevudvnv.supabase.co:5432/postgres
SUPABASE_URL=https://fdmcfjhzgakxtevudvnv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWNmamh6Z2FreHRldnVkdm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDc0MjcsImV4cCI6MjA2OTg4MzQyN30.RiCF1-qAfjyuPRVWt-xHc_n47lLOZOdUoTDjih3BcWY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWNmamh6Z2FreHRldnVkdm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwNzQyNywiZXhwIjoyMDY5ODgzNDI3fQ.EniA8oB4Ck_v20pDJMWx5PfC3Nj0kcoKRRLjPaZMnY0
NODE_ENV=production
VITE_SUPABASE_URL=https://fdmcfjhzgakxtevudvnv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWNmamh6Z2FreHRldnVkdm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDc0MjcsImV4cCI6MjA2OTg4MzQyN30.RiCF1-qAfjyuPRVWt-xHc_n47lLOZOdUoTDjih3BcWY
```

4. **Deploy**: Railway will automatically build and deploy your app

## What Railway Does

- **Build**: Run `npm ci --include=dev` → `npm run build` (Vite + esbuild)
- **Start**: Run `npm run start` (Node.js production server)
- **Health checks**: Monitor `/api/health` endpoint every 300s
- **WebSocket support**: Full WSS support for real-time collaboration
- **Automatic SSL**: HTTPS certificate provided
- **Auto-restart**: Restarts on failures with exponential backoff
- **Node.js 20**: Uses latest stable Node.js with ES modules support

## Expected URLs

After deployment, you'll get:
- **Production URL**: `https://4roscherone-production.up.railway.app` (or similar)
- **Health check**: `https://your-url/api/health`
- **API endpoints**: `https://your-url/api/dashboard`, `/api/shopping-lists`, etc.

## Free Tier Reality

- **500 hours/month** runtime limit
- **Your actual usage**: ~10-15 hours/month (only 3% of limit!)
- **$5 credit monthly** for overages (you'll never need it)
- **Perfect for household apps** with light usage patterns

## Post-Deployment Setup

1. **Test core features**: Dashboard, shopping lists, real-time updates
2. **Share URL with roommate**: Both can use simultaneously
3. **Install as PWA**: Add to home screen on mobile devices
4. **Test WebSocket**: Verify real-time sync between devices

## Troubleshooting

Common issues and solutions:

### Build Issues
- **Build fails**: Check build logs in Railway dashboard
- **Dependencies missing**: Ensure `nixpacks.toml` includes `--include=dev`
- **Node.js version**: Should be using Node.js 20 for ES modules

### Runtime Issues  
- **App crashes on start**: Check deployment logs for path resolution errors
- **Database connection**: Verify all Supabase environment variables are set
- **Static files 404**: Ensure build output is in `dist/public/`

### Real-time Issues
- **WebSocket connection fails**: Check WSS connections in browser dev tools
- **Updates not syncing**: Verify `/ws` endpoint is accessible
- **Polling fallback**: App should still work with 5-second polling if WebSocket fails

### Performance
- **Slow loading**: Normal for free tier cold starts (~10-30s)
- **Memory issues**: Monitor Railway dashboard metrics
- **Database timeouts**: Check Supabase connection pooling

## Success Indicators

✅ **Deployment successful** when you see:
- Health check returns `{"status":"ok","timestamp":"..."}`
- WebSocket server logs "New WebSocket client connected"  
- Dashboard loads with real data from Supabase
- Real-time updates work between browser tabs