# Backend Dockerfile - Node.js/TypeScript
FROM node:18-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências apenas quando necessário
FROM base AS deps
WORKDIR /app

# Copiar arquivos de manifesto do pnpm e package.json
COPY package.json pnpm-lock.yaml ./
# Instalar dependências de produção com pnpm
RUN pnpm install --prod

# Reconstruir o código-fonte apenas quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Construir a aplicação
RUN npm run build

# Imagem de produção, copie todos os arquivos e execute o aplicativo
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copiar aplicação construída e dependências
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package.json ./package.json
COPY --from=builder --chown=backend:nodejs /app/prisma ./prisma

USER backend

EXPOSE 4000

ENV PORT 4000

CMD ["node", "dist/index.js"]