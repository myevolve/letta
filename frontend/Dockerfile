# 1. Install dependencies
FROM node:20-slim AS deps
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json* ./
# Set NODE_ENV to development to ensure devDependencies are installed
ENV NODE_ENV=development
# Install dependencies, ignoring peer dependency conflicts
RUN npm install --legacy-peer-deps

# 2. Build the application
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
RUN npm run build

# 3. Run the application
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
