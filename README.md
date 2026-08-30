# AI Content Discovery Platform

A full-stack application for intelligent content search powered by AI. Built with NestJS, Next.js, and Claude API for semantic understanding.

## 🚀 Features

- **RAG Pipeline**: Retrieval Augmented Generation with Claude AI
- **Semantic Search**: Find relevant content using AI understanding
- **Authentication**: Email/password signup and login, JWT-based sessions
- **Blog-Style Feed**: Articles and community discussions with category
  filtering, a sidebar (headlines, categories, newsletter), and a compose
  flow for publishing new posts
- **Admin Dashboard**: Manage ingested documents, view analytics
- **Full-Stack TypeScript**: Type-safe frontend and backend
- **Dark/Light Theme**: Persisted per browser
- **Claude API Integration**: Optional integration for enhanced answers

## 📋 Tech Stack

### Backend
- NestJS 10.x
- PostgreSQL + TypeORM (users, document metadata)
- JWT auth with bcrypt password hashing
- Node.js 18+
- TypeScript 5.x
- Axios (HTTP client)

### Frontend
- Next.js 14.x (App Router)
- React 18.x
- TypeScript 5.x
- CSS Modules

## 🔧 Installation

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ running locally (used for user accounts and admin
  document metadata)

### Quick Start

1. **Clone the project**
   ```bash
   git clone https://github.com/Hammad338/Content-Discovery.git
   cd Content-Discovery
   ```

2. **Install dependencies**
   ```bash
   npm install --workspaces
   ```

3. **Create the database**
   ```bash
   createdb ai_discovery
   ```
   TypeORM runs with `synchronize: true` in this project, so tables
   (`users`, `documents`) are created automatically on first boot —
   no migrations to run.

4. **Configure environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
   Edit `apps/backend/.env` and set:
   - `JWT_SECRET` — a long random string used to sign auth tokens
     (generate one with `openssl rand -hex 32`). Required for auth to
     work securely; the app falls back to an insecure dev default and
     logs a warning if this is left unset.
   - `CLAUDE_API_KEY` — optional, enables AI-generated answers (see
     [Claude API Integration](#-claude-api-integration))
   - `ADMIN_EMAILS` — comma-separated emails that get the `admin` role
     and can reach the Admin Dashboard (see [Roles](#roles))
   - `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` — match your local
     Postgres setup if it differs from the defaults

5. **Start Backend** (Terminal 1)
   ```bash
   cd apps/backend
   npm run dev
   ```
   
   You should see:
   ```
   ✅ AI Discovery Backend running on http://localhost:3001
   ```

6. **Start Frontend** (Terminal 2)
   ```bash
   cd apps/frontend
   npm run dev
   ```
   
   You should see:
   ```
   ▲ Next.js 14
   Local: http://localhost:3000
   ```

7. **Load Sample Data**
   ```bash
   curl -X POST http://localhost:3001/api/rag/ingest \
     -H "Content-Type: application/json" \
     -d @sample-data.json
   ```

8. **Open Browser**
   - Frontend: http://localhost:3000 — you'll land on `/login` first;
     use **Sign up** to create an account, then you're in
   - Backend Health: http://localhost:3001/health

## 🔐 Authentication

The frontend requires a logged-in session before it lets you into the
feed, admin dashboard, or any source page — unauthenticated visits
redirect to `/login`. Accounts are stored in Postgres (`users` table)
with bcrypt-hashed passwords; a successful signup or login returns a
JWT that the frontend keeps in `localStorage` and uses to restore the
session on reload via `GET /api/auth/me`.

There's no email verification or password reset flow — this is a demo
auth system, not production-hardened.

### Roles

Every account has a `role` of `user` or `admin`. Only `admin` accounts
can reach the Admin Dashboard — the link is hidden from the nav menu
and footer for everyone else, and the backend enforces it too: every
`/api/admin/*` route is behind an `AdminGuard` that checks the JWT's
role server-side, so it can't be bypassed by calling the API directly.

There's no in-app way to promote a user — it's controlled by the
`ADMIN_EMAILS` env var (comma-separated). Any account whose email is
in that list becomes `admin` on signup, or gets promoted automatically
the next time it logs in if it already existed. Leaving `ADMIN_EMAILS`
unset means no account has admin access, and the backend logs a
warning on startup.

### Sign up
```bash
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "at-least-6-characters"
}
```

### Log in
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "at-least-6-characters"
}
```

Both return `{ success: true, data: { user, token } }`. Send the token
on subsequent requests that need it as `Authorization: Bearer <token>`.

### Current user
```bash
GET http://localhost:3001/api/auth/me
Authorization: Bearer <token>
```

## 📚 API Endpoints

### Health Check
```bash
GET http://localhost:3001/health
GET http://localhost:3001/
```

### Ingest Documents
```bash
POST http://localhost:3001/api/rag/ingest
Content-Type: application/json

{
  "documents": [
    {
      "content": "Your document text here",
      "metadata": {
        "title": "Document Title",
        "author": "Author Name",
        "tags": ["tag1", "tag2"]
      }
    }
  ]
}
```

### Search
```bash
POST http://localhost:3001/api/rag/search
Content-Type: application/json

{
  "query": "machine learning"
}
```

### Semantic Search
```bash
GET http://localhost:3001/api/semantic-search?q=AI&k=10
```

### Get Statistics
```bash
GET http://localhost:3001/api/rag/stats
```

## 🎯 Usage Examples

### Example 1: Search with Sample Data
```bash
# The sample data includes documents about ML, deep learning, and NLP
# Try searching for:
# - "machine learning"
# - "neural networks"
# - "deep learning"
# - "natural language processing"
```

### Example 2: Add Custom Documents
```bash
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "GraphQL is a query language for APIs",
        "metadata": {
          "title": "GraphQL Basics",
          "author": "Your Name"
        }
      }
    ]
  }'
```

### Example 3: Search
```bash
curl -X POST http://localhost:3001/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "GraphQL APIs"}'
```

## 🎨 Frontend Features

- **Real-time Search**: Instant results as you type
- **Source Attribution**: See which documents matched your query
- **AI-Generated Answers**: (When Claude API key is provided)
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Clear error messages and guidance

## 🔌 Claude API Integration

To enable AI-powered answers:

1. Get your Claude API key from https://console.anthropic.com/
2. Create `apps/backend/.env` with:
   ```
   CLAUDE_API_KEY=sk-ant-...
   ```
3. Restart the backend
4. Answers will now use Claude AI for better responses

## 📁 Project Structure

```
ai-discovery-platform/
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── src/
│   │   │   ├── main.ts         # Entry point
│   │   │   ├── app.module.ts   # Root module
│   │   │   ├── auth/           # Signup/login, JWT, users table
│   │   │   ├── rag/            # RAG search, ingest, feed
│   │   │   ├── admin/          # Document management & analytics
│   │   │   ├── database/       # TypeORM config & entities
│   │   │   └── health/         # Health check endpoint
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── frontend/                # Next.js UI
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx           # Home feed (protected)
│       │   │   ├── login/             # Login page
│       │   │   ├── signup/            # Signup page
│       │   │   ├── admin/             # Admin dashboard (protected)
│       │   │   ├── source/[id]/       # Post detail page (protected)
│       │   │   ├── layout.tsx         # Root layout
│       │   │   └── globals.css        # Global styles + theme tokens
│       │   ├── components/            # PostCard, Sidebar, NavMenu,
│       │   │                          # ComposeModal, AuthGuard, etc.
│       │   └── context/                # Theme + Auth providers
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.js
├── sample-data.json            # Example documents
├── package.json                # Workspace root
└── README.md                   # This file
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3001/health
```

### Test Frontend Connection
The frontend will automatically detect if the backend is running. If you see a warning, make sure the backend is running on port 3001.

## 🚨 Troubleshooting

### Backend won't start
```bash
# Clear build artifacts and reinstall
cd apps/backend
rm -rf dist node_modules
npm install
npm run dev
```

### Frontend won't connect to backend
- Make sure backend is running on port 3001
- Check CORS is enabled (it is by default)
- Check browser console for errors

### No search results
- Make sure you loaded the sample data first
- Use the `/api/rag/stats` endpoint to check if documents are ingested

## 🎓 Learning Resources

- **NestJS**: https://docs.nestjs.com/
- **Next.js**: https://nextjs.org/docs
- **Claude API**: https://docs.anthropic.com/
- **TypeScript**: https://www.typescriptlang.org/docs/

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
CLAUDE_API_KEY=your_key_here (optional)
JWT_SECRET=your_long_random_string (required for secure auth)
ADMIN_EMAILS=you@example.com (comma-separated, grants admin role)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_user
DB_PASSWORD=
DB_NAME=ai_discovery
```

## 📦 Building for Production

### Build Backend
```bash
cd apps/backend
npm run build
```

### Build Frontend
```bash
cd apps/frontend
npm run build
npm run start
```

## 🤝 Contributing

Feel free to fork and extend this project! Some ideas:
- Persist the RAG document store in Postgres (it's currently in-memory
  and resets on backend restart, separate from the `users`/`documents`
  tables)
- Implement Redis caching
- Add vector embeddings with Weaviate
- Password reset / email verification for auth
- Deploy with Docker

## 📝 License

MIT

## 👤 Author

Hammad Alam
- GitHub: [@Hammad338](https://github.com/Hammad338)
- Email: hammadalam3381@gmail.com

---

**Built with ❤️ for the AI community**
# Content-Discovery
