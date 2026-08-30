# AI Content Discovery Platform

A full-stack application for intelligent content search powered by AI. Built with NestJS, Next.js, and Claude API for semantic understanding.

## 🚀 Features

- **RAG Pipeline**: Retrieval Augmented Generation with Claude AI
- **Semantic Search**: Find relevant content using AI understanding
- **Full-Stack TypeScript**: Type-safe frontend and backend
- **Beautiful UI**: Modern, responsive design
- **Claude API Integration**: Optional integration for enhanced answers
- **In-Memory Storage**: Fast, zero-database setup (perfect for prototyping)

## 📋 Tech Stack

### Backend
- NestJS 10.x
- Node.js 18+
- TypeScript 5.x
- Axios (HTTP client)

### Frontend
- Next.js 14.x
- React 18.x
- TypeScript 5.x
- CSS Modules

## 🔧 Installation

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start

1. **Extract the project**
   ```bash
   unzip ai-discovery-platform.zip
   cd ai-discovery-platform
   ```

2. **Install dependencies**
   ```bash
   npm install --workspaces
   ```

3. **(Optional) Add Claude API Key**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit .env and add your Claude API key
   # CLAUDE_API_KEY=sk-ant-...
   ```

4. **Start Backend** (Terminal 1)
   ```bash
   cd apps/backend
   npm run dev
   ```
   
   You should see:
   ```
   ✅ AI Discovery Backend running on http://localhost:3001
   ```

5. **Start Frontend** (Terminal 2)
   ```bash
   cd apps/frontend
   npm run dev
   ```
   
   You should see:
   ```
   ▲ Next.js 14
   Local: http://localhost:3000
   ```

6. **Load Sample Data**
   ```bash
   curl -X POST http://localhost:3001/api/rag/ingest \
     -H "Content-Type: application/json" \
     -d @sample-data.json
   ```

7. **Open Browser**
   - Frontend: http://localhost:3000
   - Backend Health: http://localhost:3001/health

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
│   │   │   ├── rag/            # RAG service & controller
│   │   │   └── health/         # Health check endpoint
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── frontend/                # Next.js UI
│       ├── src/app/
│       │   ├── page.tsx        # Main page
│       │   ├── layout.tsx      # Root layout
│       │   ├── page.module.css # Styles
│       │   └── globals.css     # Global styles
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

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
CLAUDE_API_KEY=your_key_here (optional)
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
- Add database persistence (PostgreSQL)
- Implement Redis caching
- Add vector embeddings with Weaviate
- Improve UI with animations
- Add user authentication
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
