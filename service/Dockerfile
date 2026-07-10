# build stage: install workspace deps and bundle the service into one file
FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /repo

# copy manifests first so dependency layers cache across source changes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY service/package.json ./service/package.json
RUN pnpm install --frozen-lockfile --filter @flagpole/service...

# copy source and produce the standalone bundle
COPY service ./service
RUN pnpm --filter @flagpole/service build

# runtime stage: just the bundled file on a tiny base, no node_modules, no pnpm
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

# run as a non-root user
RUN addgroup -S flagpole && adduser -S -u 1001 -G flagpole flagpole
COPY --from=builder --chown=flagpole:flagpole /repo/service/dist/index.js ./index.js
USER flagpole

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||8080)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "index.js"]
