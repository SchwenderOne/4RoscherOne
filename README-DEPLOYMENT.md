# Railway Deployment Guide

## Quick Deploy to Railway

1. **Create a Railway account**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Connect your repository**: Click "Deploy from GitHub repo" and select this repository
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

## What Railway Will Do

- **Build**: Run `npm ci` → `npm run build`
- **Start**: Run `npm run start` 
- **Health checks**: Monitor `/api/health` endpoint
- **WebSocket support**: Full WebSocket support for real-time features
- **Automatic SSL**: HTTPS certificate provided
- **Custom domain**: You can add your own domain later

## Expected URLs

After deployment, you'll get:
- **Production URL**: `https://your-app-name.up.railway.app`
- **Health check**: `https://your-app-name.up.railway.app/api/health`

## Free Tier Limits

- **500 hours/month** runtime
- **Your usage**: ~10-15 hours/month (3% of limit)
- **$5 credit monthly** for overages (you won't need it)

## Post-Deployment

1. Test all features work in production
2. Share the URL with your roommate
3. Both add the URL to your home screen as a PWA

## Troubleshooting

- **Build fails**: Check build logs in Railway dashboard
- **App crashes**: Check deployment logs for errors
- **WebSocket issues**: Verify WSS connections work in browser dev tools