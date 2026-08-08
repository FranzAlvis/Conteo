# API — Conteo de Votos Vicerrectorado USFX 2026

Backend en NestJS + Prisma + PostgreSQL + WebSockets (Socket.IO) para el sistema de conteo de votos.

## Stack

- NestJS 11 (REST + Gateway WebSocket)
- Prisma ORM 6 + PostgreSQL
- JWT (passport-jwt) para autenticación, con guard global de roles (`ADMIN`, `TRANSCRIPTOR`, `AYUDANTE`, `VISOR`)
- class-validator / class-transformer para validación de DTOs en todos los endpoints
- Multer para carga de fotos de actas, servidas de forma estática en `/uploads`

## Puesta en marcha

```bash
cp .env.example .env        # ajustar si es necesario
docker compose up -d        # levanta Postgres (puerto 5433) + Adminer (puerto 8080)
npm install
npx prisma migrate dev      # crea el esquema
npm run seed                # carga usuarios, candidatos, facultades y las 95 mesas del CSV
npm run start:dev
```

La API queda en `http://localhost:3000`. Health check: `GET /health` (público).

> El puerto de Postgres se mapeó a **5433** (no 5432) para no chocar con una instalación local de PostgreSQL que ya pudiera estar corriendo en la máquina.

## Origen de las mesas

`prisma/data/mesas_facultades.csv` es la fuente oficial de las 95 mesas estudiantiles y sus facultades/sedes (incluye asientos universitarios de provincia: Monteagudo, Muyupampa, Padilla, etc.). El seeder (`prisma/seed.ts`) crea el catálogo de `Facultad` a partir de ese CSV y una mesa docente de ejemplo (`MESA-DOC-01`, ponderación 45).

La columna `q_ejemplo` del CSV es un identificador de relleno del archivo original, no un tamaño de padrón real, por lo que no se usa para `totalPadron` (queda en 0 salvo en las mesas de demo).

## Usuarios de prueba (creados por el seed)

| Usuario         | Contraseña  | Rol          |
| --------------- | ----------- | ------------ |
| `admin`         | `admin123`  | ADMIN        |
| `transcriptor`  | `trans123`  | TRANSCRIPTOR |
| `transcriptor2` | `trans123`  | TRANSCRIPTOR |
| `visor`         | `visor123`  | VISOR        |

## Módulos principales

| Módulo          | Responsabilidad                                                         |
| ---------------- | ------------------------------------------------------------------------ |
| `auth`            | Login JWT, `/auth/me`                                                    |
| `users`            | CRUD de usuarios (solo ADMIN)                                            |
| `facultades`       | Catálogo de facultades/sedes (mapa electoral)                            |
| `mesas`            | CRUD de mesas, filtros, asignación de transcriptor                       |
| `delegados`        | CRUD de delegados de mesa                                                |
| `candidatos`       | CRUD de candidatos (baja lógica, preserva histórico de votos)            |
| `votos`            | `POST /mesas/:id/transcribir` — carga de acta, valida padrón y autoría   |
| `actas`            | `POST /actas/upload` — sube la foto del acta, devuelve la URL a usar     |
| `resultados`       | Cómputo agregado ponderado (1 voto docente = 45 votos estudiantiles)     |
| `dashboard`        | Resumen general + últimas mesas con actividad                            |
| `asignaciones`     | Asignación exclusiva de mesas por transcriptor + sus delegados           |
| `configuracion`    | Apertura/cierre global del conteo                                        |
| `events`           | Gateway WebSocket: `mesaActualizada`, `resumenVotosActualizado`, `conteoEstadoCambiado` |

Todos los endpoints requieren JWT salvo `POST /auth/login` y `GET /health`. Las acciones de escritura sensibles (crear mesas/facultades/usuarios, reasignar transcriptores, cerrar el conteo) están restringidas a `ADMIN`; transcribir una mesa está restringido a `ADMIN` o al transcriptor asignado a esa mesa específica.

## Scripts útiles

```bash
npm run prisma:studio   # explorar la base de datos
npm run prisma:migrate  # nueva migración en desarrollo
npm run seed             # re-ejecutar el seed (borra y recarga todo)
npm run build            # compilación de producción
npm run test              # unit tests
npm run test:e2e          # e2e
```
