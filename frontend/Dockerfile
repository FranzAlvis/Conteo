# Etapa 1: build del bundle estático (tsc -b + vite build)
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NODE_OPTIONS=--max-old-space-size=3072
RUN pnpm build

# Etapa 2: servir el build estático con nginx (también hace de proxy hacia
# el backend para /api y /socket.io/, ver nginx.conf)
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --spider -q http://localhost/ || exit 1
