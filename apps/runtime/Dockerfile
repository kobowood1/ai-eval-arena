FROM node:22-alpine AS base
WORKDIR /app

# Install deps first (layer-cached if package.json unchanged)
COPY package*.json ./
COPY apps/runtime/package*.json ./apps/runtime/
COPY packages/lib/package*.json ./packages/lib/
COPY packages/db/package*.json ./packages/db/
COPY packages/providers/package*.json ./packages/providers/
RUN npm ci --workspace apps/runtime --workspace packages/lib --workspace packages/db --workspace packages/providers --omit=dev

# Copy source
COPY tsconfig.base.json ./
COPY apps/runtime ./apps/runtime
COPY packages ./packages

# Build
RUN npm run build --workspace apps/runtime

EXPOSE 3001
CMD ["node", "apps/runtime/dist/server.js"]
