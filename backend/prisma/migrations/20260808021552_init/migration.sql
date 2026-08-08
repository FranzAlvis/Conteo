-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TRANSCRIPTOR', 'AYUDANTE', 'VISOR');

-- CreateEnum
CREATE TYPE "EstadoMesa" AS ENUM ('PENDIENTE', 'EN_CARGA', 'CARGADA');

-- CreateEnum
CREATE TYPE "TipoMesa" AS ENUM ('ESTUDIANTIL', 'DOCENTE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VISOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facultades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facultades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "lista" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "esPropio" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "facultadId" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL DEFAULT 'Por definir',
    "totalPadron" INTEGER NOT NULL DEFAULT 0,
    "tipo" "TipoMesa" NOT NULL DEFAULT 'ESTUDIANTIL',
    "ponderacion" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoMesa" NOT NULL DEFAULT 'PENDIENTE',
    "transcriptorId" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegados" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "correo" TEXT,
    "mesaId" TEXT,
    "transcriptorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delegados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votos_mesa" (
    "id" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "votos_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actas_mesa" (
    "id" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "observaciones" TEXT,
    "subidoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actas_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "conteoAbierto" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "facultades_nombre_key" ON "facultades"("nombre");

-- CreateIndex
CREATE INDEX "candidatos_cargoId_idx" ON "candidatos"("cargoId");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_codigo_key" ON "mesas"("codigo");

-- CreateIndex
CREATE INDEX "mesas_facultadId_idx" ON "mesas"("facultadId");

-- CreateIndex
CREATE INDEX "mesas_transcriptorId_idx" ON "mesas"("transcriptorId");

-- CreateIndex
CREATE INDEX "mesas_estado_idx" ON "mesas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "delegados_ci_key" ON "delegados"("ci");

-- CreateIndex
CREATE INDEX "delegados_mesaId_idx" ON "delegados"("mesaId");

-- CreateIndex
CREATE INDEX "delegados_transcriptorId_idx" ON "delegados"("transcriptorId");

-- CreateIndex
CREATE UNIQUE INDEX "votos_mesa_mesaId_candidatoId_key" ON "votos_mesa"("mesaId", "candidatoId");

-- CreateIndex
CREATE INDEX "actas_mesa_mesaId_idx" ON "actas_mesa"("mesaId");

-- AddForeignKey
ALTER TABLE "candidatos" ADD CONSTRAINT "candidatos_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "facultades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_transcriptorId_fkey" FOREIGN KEY ("transcriptorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegados" ADD CONSTRAINT "delegados_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegados" ADD CONSTRAINT "delegados_transcriptorId_fkey" FOREIGN KEY ("transcriptorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos_mesa" ADD CONSTRAINT "votos_mesa_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos_mesa" ADD CONSTRAINT "votos_mesa_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "candidatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_mesa" ADD CONSTRAINT "actas_mesa_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_mesa" ADD CONSTRAINT "actas_mesa_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
