# 🗳️ Sistema de Conteo de Votos — Vicerrectorado 2026
### *Candidatura a Vicerrectorado de Yamile Hayes Michel*

Plataforma fullstack de control electoral interno para la transcripción de actas, consolidación de votos por mesa y visualización de resultados en tiempo real con WebSockets y gráficos interactivos.

---

## 🚀 Stack Tecnológico

### **Backend**
- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **ORM & Base de Datos**: [Prisma ORM](https://www.prisma.io/) + **PostgreSQL** (Docker Compose)
- **Tiempo Real**: Socket.io Gateway (WebSockets con aislamiento de información por **Rooms**)
- **Autenticación & Seguridad**: Passport.js + JWT (JSON Web Tokens) + bcrypt

### **Frontend**
- **Base / Layout**: Template [`satnaing/shadcn-admin`](https://github.com/satnaing/shadcn-admin)
- **Librería UI & Framework**: React (Vite) + TypeScript + Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- **Enrutamiento**: TanStack Router (Rutas protegidas por rol)
- **Estado Global**: Zustand (`auth-store.ts`, `election-store.ts`)
- **Gráficos**: Recharts (Gráfico de barras horizontales con resalte dinámico del candidato líder)

---

## 🎨 Identidad Visual (Rojo Vino Institucional)

El tema de color original (`zinc`) del template ha sido adaptado al color institucional **Rojo Vino** en `frontend/src/styles/theme.css`:

- **Modo Claro (`:root`)**:
  - `--primary: hsl(350 65% 38%)` (Rojo vino institucional)
  - `--secondary: hsl(350 20% 95%)`
  - `--accent: hsl(350 55% 92%)`
  - `--ring: hsl(350 65% 38%)`

- **Modo Oscuro (`.dark`)**:
  - `--primary: hsl(350 70% 52%)` (Rojo brillante para alto contraste)
  - `--secondary: hsl(222 20% 14%)`
  - `--accent: hsl(350 40% 20%)`
  - `--ring: hsl(350 70% 52%)`

---

## 👥 Control de Acceso por Roles

| Rol | Descripción | Módulos Accesibles |
| :--- | :--- | :--- |
| **`ADMIN`** | Administrador del sistema electoral | Resumen, Mesas, Delegados, Usuarios, Configuración, Resultados Live |
| **`TRANSCRIPTOR`** | Personal encargado de cargar actas | Resumen, Mesas (Carga y bloqueo), Resultados Live |
| **`AYUDANTE`** | Apoyo logístico | Resumen, Delegados, Resultados Live |
| **`VISOR`** | Observadores y público autorizado | Resumen, Resultados Live |

---

## 🛠️ Requisitos e Instalación

### **Prerrequisitos**
- [Node.js](https://nodejs.org/) v20+ o v22+
- [Docker](https://www.docker.com/) & Docker Compose
- `pnpm` o `npm`

---

### **1. Configuración de la Base de Datos (Docker Compose)**

Para levantar la base de datos **PostgreSQL** y la interfaz de gestión **Adminer**:

```bash
# Desde la raíz del proyecto o desde la carpeta /backend:
docker compose up -d
```

- **PostgreSQL**: `localhost:5432` (Usuario: `conteo_user`, Password: `conteo_password`, DB: `conteo_votos_db`)
- **Adminer (Web UI)**: `http://localhost:8080`

---

### **2. Configuración y Puesta en Marcha del Backend (NestJS)**

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Sincronizar el esquema Prisma con PostgreSQL
npx prisma db push

# 3. Ejecutar el Seed Script de parametrización inicial
npx ts-node prisma/seed.ts

# 4. Iniciar el servidor backend en modo desarrollo
npm run start:dev
```
*Servidor Backend escuchando en: `http://localhost:3000`*

---

### **3. Configuración y Puesta en Marcha del Frontend (React + Vite)**

```bash
cd frontend

# 1. Instalar dependencias con pnpm
pnpm install

# 2. Iniciar el servidor de desarrollo
pnpm dev
```
*Servidor Frontend escuchando en: `http://localhost:5173`*

---

## 🚀 Despliegue en Producción (día del evento, Docker Compose)

Este es el flujo pensado para la laptop del evento: **una sola máquina**, red LAN local (sin salir a internet), atendiendo hasta ~1000 personas conectadas simultáneamente. Todo corre en 3 contenedores (Postgres + backend + nginx sirviendo el frontend), orquestados con `docker-compose.prod.yml`. No reemplaza el `docker-compose.yml` de desarrollo — son archivos independientes.

### Prerrequisitos en la laptop del evento
- Solo necesita **[Docker](https://docs.docker.com/engine/install/ubuntu/) y Docker Compose** instalados (nada de Node, pnpm ni PostgreSQL a mano).
- Verificar: `docker --version` y `docker compose version`.

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio> conteo
cd conteo
```

### 2. Configurar los secretos reales

```bash
cp .env.docker.example .env
nano .env   # completar POSTGRES_PASSWORD, JWT_SECRET y ADMIN_PASSWORD reales
```

Generar valores seguros si hace falta:

```bash
openssl rand -base64 24   # para POSTGRES_PASSWORD / ADMIN_PASSWORD
openssl rand -base64 32   # para JWT_SECRET
```

> El `.env` de esta raíz **nunca se sube a git** (ya está en `.gitignore`). Es el único archivo que hay que tocar a mano.

### 3. Levantar todo con un solo comando

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

La primera vez construye las imágenes (unos minutos) y parametriza la base de datos automáticamente con los **datos reales**: candidatos, facultades y las mesas del CSV oficial (`backend/prisma/data/mesas_facultades.csv`), todas en estado `PENDIENTE`, más un único usuario `ADMIN` con la contraseña que pusiste en `.env`. **No se crean votos, delegados ni mesas de ejemplo falsas** — eso es exclusivo del seed de desarrollo (`prisma/seed.ts`), nunca corre en producción.

Si el contenedor se reinicia (corte de luz, reinicio de la laptop, etc.), este parametrizado inicial **no se repite ni borra nada**: al arrancar detecta que ya hay datos y los deja intactos.

### 4. Verificar que levantó bien

```bash
docker compose -f docker-compose.prod.yml ps      # los 3 servicios en estado "healthy"
curl http://localhost/api/health                  # respuesta del backend vía nginx
```

### 5. Conectar los dispositivos del evento

Todos los dispositivos deben estar en la **misma red WiFi/LAN** que la laptop. Averiguar la IP local de la laptop:

```bash
hostname -I   # o: ip addr show | grep "inet "
```

Compartir esa IP con los transcriptores/visores: `http://<ip-de-la-laptop>` (puerto 80, no hace falta escribirlo). Si el firewall (`ufw`) está activo, abrir el puerto:

```bash
sudo ufw allow 80/tcp
```

### 6. Después de levantar: pasos manuales pendientes

El seed solo deja la **estructura** lista. Antes de la votación real, entrar como ADMIN y:
- Crear los usuarios reales `TRANSCRIPTOR`/`VISOR`/`AYUDANTE` (módulo Usuarios) — no se generan automáticamente.
- Asignar mesas a cada transcriptor (módulo Usuarios o Grupos de WhatsApp).
- Cargar el padrón real (`totalPadron`) de cada mesa si corresponde (por defecto queda en 0).
- Registrar los delegados de mesa reales.

### Comandos útiles

```bash
# Ver logs en vivo (los 3 servicios)
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un solo servicio
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Detener todo (los datos quedan guardados en volúmenes de Docker)
docker compose -f docker-compose.prod.yml down

# Reconstruir después de bajar cambios nuevos del repo
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Arquitectura del despliegue

```
Dispositivos del evento (celulares/PCs en el WiFi del lugar)
              │  http://<ip-laptop>
              ▼
        ┌───────────────┐
        │  nginx (:80)  │  sirve el build estático del frontend
        │  (frontend)   │  + proxy /api/ → backend
        └───────┬───────┘  + proxy /socket.io/ → backend (WebSocket)
                │
                ▼
        ┌───────────────┐
        │  NestJS (:3000)│  API REST + Gateway WebSocket
        │  (backend)    │  solo accesible dentro de la red de Docker
        └───────┬───────┘  (127.0.0.1:3000 expuesto solo para debug local)
                │
                ▼
        ┌───────────────┐
        │  PostgreSQL   │  volumen persistente (sobrevive a reinicios)
        └───────────────┘
```

El frontend nunca llama a una IP fija: usa rutas relativas (`/api`, `/socket.io/`) que nginx resuelve al mismo origen, así que funciona sin importar qué IP le asigne el router el día del evento.

---

## 🔑 Credenciales de Prueba (Seed Data — solo desarrollo)

El script de parametrización (`prisma/seed.ts`) crea automáticamente los siguientes usuarios de prueba:

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` |
| **Transcriptor** | `transcriptor` | `trans123` |
| **Visor** | `visor` | `visor123` |

---

## 🛰️ Arquitectura de WebSockets (Socket.io Rooms)

Para optimizar el tráfico de red y garantizar la privacidad de los datos en edición:

1. **Room `admin_transcriptor`**:
   - Recibe eventos en tiempo real `mesaActualizada` (incluye detalles de mesas en proceso de carga o edición por transcriptores).
2. **Room `todos` (Broadcast Global)**:
   - Recibe eventos `resumenVotosActualizado` y `conteoEstadoCambiado` (abierto/cerrado).

---

## 📂 Estructura del Proyecto

```
Conteo/
├── docker-compose.yml       # Orquestación de PostgreSQL y Adminer (desarrollo)
├── docker-compose.prod.yml  # Orquestación completa de producción (postgres+backend+frontend)
├── .env.docker.example      # Plantilla de secretos para docker-compose.prod.yml
├── README.md                # Documentación del proyecto
├── backend/                 # API NestJS + Prisma ORM
│   ├── Dockerfile           # Imagen de producción del backend
│   ├── docker-entrypoint.sh # Migraciones + seed idempotente + arranque
│   ├── docker-compose.yml   # Docker Compose backend (desarrollo)
│   ├── prisma/
│   │   ├── schema.prisma    # Modelos: User, Cargo, Candidato, Mesa, VotoMesa, ActaMesa
│   │   ├── seed.ts          # Seed de DESARROLLO (con datos falsos de demo)
│   │   ├── seed.production.ts # Seed de PRODUCCIÓN (solo datos reales, idempotente)
│   │   └── data/mesas_facultades.csv # Fuente oficial de mesas y facultades
│   └── src/
│       ├── events/          # Gateway WebSockets (Socket.io Rooms)
│       └── main.ts          # Punto de entrada NestJS
└── frontend/                # Cliente React (sobre template shadcn-admin)
    ├── Dockerfile           # Build estático + nginx
    ├── nginx.conf           # Sirve el SPA + proxy /api y /socket.io/ al backend
    ├── .env.production      # VITE_API_URL=/api (ruta relativa, sin IP fija)
    ├── src/
    │   ├── components/      # UI primitives & layout (LiveStatusBadge, ProfileDropdown, etc.)
    │   ├── features/        # Módulos por dominio (auth/sign-in, dashboard, mesas, users, configuracion, resultados)
    │   ├── routes/          # TanStack Router subrutas protegidas
    │   ├── stores/          # Zustand state management (election-store.ts)
    │   └── styles/          # Hojas de estilo y paleta institucional en theme.css
```

---

## 📝 Licencia
Este proyecto es de uso exclusivo para la campaña institucional de **Yamile Hayes Michel — Vicerrectorado 2026**.
