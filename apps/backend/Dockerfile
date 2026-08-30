# Build context is the repo root (npm workspaces monorepo).
# docker build -f apps/backend/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

COPY apps/backend apps/backend
RUN npm run build --workspace=apps/backend
# npm workspace hoisting can leave some backend-only deps (e.g. typeorm)
# un-hoisted here instead of the root node_modules — ensure the dir
# exists either way so the runtime stage's COPY below never fails.
RUN mkdir -p apps/backend/node_modules

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules node_modules
# npm workspace hoisting can leave some backend-only deps (e.g. typeorm)
# un-hoisted in apps/backend/node_modules instead of the root — copy both.
COPY --from=builder /app/apps/backend/node_modules apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist apps/backend/dist
COPY apps/backend/package.json apps/backend/package.json

EXPOSE 3001
CMD ["node", "apps/backend/dist/main.js"]
