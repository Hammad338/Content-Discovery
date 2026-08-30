# 🚀 Quick Start Guide

Get the AI Content Discovery Platform running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install --workspaces
```

This installs all dependencies for both backend and frontend.

## Step 2: Start Backend

Open **Terminal 1** and run:

```bash
cd apps/backend
npm run dev
```

Wait for this message:
```
✅ AI Discovery Backend running on http://localhost:3001
```

## Step 3: Start Frontend

Open **Terminal 2** and run:

```bash
cd apps/frontend
npm run dev
```

Wait for this message:
```
▲ Next.js 14
Local: http://localhost:3000
```

## Step 4: Load Sample Data

Open **Terminal 3** and run:

```bash
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d @sample-data.json
```

You should see:
```json
{"success":true,"data":{"count":6,"total":6}}
```

## Step 5: Open Browser

Go to: **http://localhost:3000**

## Step 6: Search!

Try searching for:
- `machine learning`
- `deep learning`
- `neural networks`
- `NLP`
- `semantic search`
- `reinforcement learning`

## 🎯 That's It!

Your AI Content Discovery Platform is now running! 🎉

## 📝 Sample Queries

```bash
# Search via API
curl -X POST http://localhost:3001/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning"}'

# Check stats
curl http://localhost:3001/api/rag/stats

# Health check
curl http://localhost:3001/health
```

## 🔑 Enable Claude API (Optional)

1. Get your key from https://console.anthropic.com/
2. Edit `apps/backend/.env`:
   ```
   CLAUDE_API_KEY=sk-ant-...
   ```
3. Restart backend

Now answers will be powered by Claude AI!

## ❓ Need Help?

- Backend issues? Check `apps/backend` is running
- Frontend not loading? Clear cache and refresh
- No search results? Make sure you loaded sample data

Enjoy! 🚀
