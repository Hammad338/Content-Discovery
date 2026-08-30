# Build context is the repo root (npm workspaces monorepo).
# docker build -f apps/frontend/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

COPY apps/frontend apps/frontend
RUN npm run build --workspace=apps/frontend

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Next.js standalone output bundles only the files needed to run the server.
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static

EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
