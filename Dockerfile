# ── Stage 1: Install dependencies ──────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci --ignore-scripts

# ── Stage 2: Build all workspaces ──────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules 2>/dev/null || true
COPY --from=deps /app/server/node_modules ./server/node_modules 2>/dev/null || true
COPY --from=deps /app/client/node_modules ./client/node_modules 2>/dev/null || true
COPY . .

# Compile shared TS → JS so Node can resolve @basket/shared at runtime
RUN npx tsc -p shared \
 && node -e "\
    const fs = require('fs'); \
    const pkg = JSON.parse(fs.readFileSync('shared/package.json','utf8')); \
    pkg.main = './dist/index.js'; \
    pkg.exports = { '.': './dist/index.js' }; \
    fs.writeFileSync('shared/package.json', JSON.stringify(pkg, null, 2));"

RUN npm run build -w client
RUN npm run build -w server

# ── Stage 3: Production runner ─────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/src/db/migrations ./server/src/db/migrations
COPY --from=builder /app/client/dist ./client/dist
COPY package.json ./

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
