-- CreateEnum
CREATE TYPE "TipoReset" AS ENUM ('PUESTA_EN_CERO', 'AVANCE_VUELTA');

-- DropIndex
DROP INDEX "votos_mesa_mesaId_candidatoId_key";

-- AlterTable
ALTER TABLE "actas_mesa" ADD COLUMN     "vuelta" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "configuracion" ADD COLUMN     "vuelta" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "reset_auditoria" ADD COLUMN     "tipo" "TipoReset" NOT NULL DEFAULT 'PUESTA_EN_CERO',
ADD COLUMN     "vuelta" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "votos_mesa" ADD COLUMN     "vuelta" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "votos_mesa_mesaId_candidatoId_vuelta_key" ON "votos_mesa"("mesaId", "candidatoId", "vuelta");
