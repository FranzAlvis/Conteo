#!/bin/sh
# Arranque de producción: aplica migraciones, parametriza la base si está
# vacía (seed idempotente, sin datos falsos de demo) y recién ahí levanta
# el servidor. Pensado para poder reiniciar el contenedor las veces que
# haga falta el día del evento sin arriesgar los votos ya cargados.
set -e

echo "⏳ Aplicando migraciones de base de datos..."
until npx prisma migrate deploy; do
  echo "   Postgres no está listo todavía, reintentando en 3s..."
  sleep 3
done

echo "🌱 Verificando parametrización inicial (candidatos, facultades, mesas, admin)..."
npx ts-node --transpile-only prisma/seed.production.ts

echo "🚀 Iniciando servidor NestJS..."
exec node dist/main.js
