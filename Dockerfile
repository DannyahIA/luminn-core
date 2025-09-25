# Backend Dockerfile - Node.js/TypeScript
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy pnpm and package.json manifest files
COPY package.json pnpm-lock.yaml ./
# Install pnpm production dependencies
RUN pnpm install --prod

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy builded application and dependencies
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package.json ./package.json
COPY --from=builder --chown=backend:nodejs /app/prisma ./prisma

USER backend

EXPOSE 4000

ENV PORT=4000

CMD ["node", "dist/index.js"]