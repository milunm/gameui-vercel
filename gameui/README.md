# GAMEUI.CSS — Deployment Guide

## Your file structure
```
gameui/
├── api/
│   └── generate.js     ← serverless proxy (keeps API key safe)
├── public/
│   └── index.html      ← the app
├── vercel.json         ← routing config
└── README.md
```

## Deploy to Vercel in 4 steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Push to GitHub (or deploy directly)
```bash
cd gameui
vercel
```
Follow the prompts — choose "No" for existing project, let it auto-detect.

### 3. Add your Anthropic API key
Go to your Vercel dashboard:
- Project → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = `sk-ant-...your key...`
- Get your key at: https://console.anthropic.com

### 4. Redeploy
```bash
vercel --prod
```

That's it. Your app is live at `https://your-project.vercel.app`.

## Custom domain (optional)
In Vercel dashboard → Project → Domains → Add `gameui.css` or whatever you bought.

## Costs
- Vercel free tier: plenty for a new project (100GB bandwidth/mo)
- Anthropic API: ~$0.003 per generation (Claude Sonnet)
  - 1000 generations/day = ~$3/day → offset with a Pro tier at $6/mo

## Going Pro (monetization)
When ready to add a paywall:
1. Add Stripe to `api/create-checkout.js`
2. Gate `/api/generate` behind a session check
3. Free tier: 5 generations/day
4. Pro: unlimited + save collections
