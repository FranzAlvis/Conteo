-- CreateEnum
CREATE TYPE "EstadoRevision" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CONTROL_CALIDAD';

-- AlterTable
ALTER TABLE "mesas" ADD COLUMN     "controlCalidadId" TEXT;

-- CreateTable
CREATE TABLE "revisiones_mesa" (
    "id" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,
    "vuelta" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoRevision" NOT NULL DEFAULT 'PENDIENTE',
    "comentario" TEXT,
    "revisadoPorId" TEXT,
    "revisadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revisiones_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revisiones_mesa_mesaId_idx" ON "revisiones_mesa"("mesaId");

-- CreateIndex
CREATE UNIQUE INDEX "revisiones_mesa_mesaId_vuelta_key" ON "revisiones_mesa"("mesaId", "vuelta");

-- CreateIndex
CREATE INDEX "mesas_controlCalidadId_idx" ON "mesas"("controlCalidadId");

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_controlCalidadId_fkey" FOREIGN KEY ("controlCalidadId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisiones_mesa" ADD CONSTRAINT "revisiones_mesa_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisiones_mesa" ADD CONSTRAINT "revisiones_mesa_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

