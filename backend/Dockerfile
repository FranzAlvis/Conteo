# Imagen única de producción: se prioriza simplicidad y confiabilidad sobre
# tamaño de imagen (hay RAM de sobra en el hardware de despliegue). Se
# mantienen las devDependencies (ts-node, typescript) porque el seed de
# producción corre con ts-node directamente, sin paso de compilación aparte.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate && npm run build && chmod +x docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD wget --spider -q http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
