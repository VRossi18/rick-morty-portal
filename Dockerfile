# --- Frontend build ---
FROM node:24-alpine AS frontend-build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_BASE=/
ARG VITE_STRIPE_CHECKOUT_API_URL=/api/stripe/create-checkout-session
ENV NODE_ENV=production
ENV VITE_BASE=$VITE_BASE
ENV VITE_STRIPE_CHECKOUT_API_URL=$VITE_STRIPE_CHECKOUT_API_URL
RUN pnpm exec tsc -b && pnpm exec vite build && node ./scripts/copy-404.mjs

# --- Server build ---
FROM node:24-alpine AS server-build
WORKDIR /app/server
RUN corepack enable
COPY server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY server/tsconfig.json server/vitest.config.ts ./
COPY server/src ./src
RUN pnpm run build

# --- Runtime ---
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=frontend-build /app/dist ./dist
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY --from=server-build /app/server/package.json ./server/package.json
EXPOSE 8080
CMD ["node", "server/dist/index.js"]
