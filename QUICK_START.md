# 🚀 Quick Start Guide

Get the AI Content Discovery Platform running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install --workspaces
```

This installs all dependencies for both backend and frontend.

## Step 2: Set Up the Database and Environment

The backend uses PostgreSQL to store user accounts and admin document
metadata. Create the database, then configure your `.env`:

```bash
createdb ai_discovery
cp apps/backend/.env.example apps/backend/.env
```

Open `apps/backend/.env` and set a `JWT_SECRET` (used to sign login
sessions):

```bash
# generates a random value you can paste in
openssl rand -hex 32
```

Without a `JWT_SECRET`, the backend still runs using an insecure dev
default and logs a warning — fine for local testing, not for anything
real.

## Step 3: Start Backend

Open **Terminal 1** and run:

```bash
cd apps/backend
npm run dev
```

Wait for this message:
```
✅ AI Discovery Backend running on http://localhost:3001
```

## Step 4: Start Frontend

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

## Step 5: Load Sample Data

Open **Terminal 3** and run:

```bash
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d @sample-data.json
```

You should see:
```json
{"success":true,"data":{"count":20,"total":20}}
```

## Step 6: Create an Account

Go to: **http://localhost:3000** — you'll land on the login page, since
the app requires an account. Click **Sign up**, fill in your name,
email, and a password (6+ characters), and you'll be logged straight
in.

## Step 7: Search!

Try searching for:
- `machine learning`
- `deep learning`
- `neural networks`
- `agentic ai`
- `robotics`
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
- Stuck on the login page after signing up? Check the backend
  terminal for Postgres connection errors — the `users` table needs a
  working database connection to save your account

Enjoy! 🚀
