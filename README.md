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

## 🔑 Credenciales de Prueba (Seed Data)

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
├── docker-compose.yml       # Orquestación de PostgreSQL y Adminer
├── README.md                # Documentación del proyecto
├── backend/                 # API NestJS + Prisma ORM
│   ├── docker-compose.yml   # Docker Compose backend
│   ├── prisma/
│   │   ├── schema.prisma    # Modelos: User, Cargo, Candidato, Mesa, VotoMesa, ActaMesa
│   │   └── seed.ts          # Script de parametrización inicial
│   └── src/
│       ├── events/          # Gateway WebSockets (Socket.io Rooms)
│       └── main.ts          # Punto de entrada NestJS
└── frontend/                # Cliente React (sobre template shadcn-admin)
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
