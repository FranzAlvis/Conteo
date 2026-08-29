-- CreateEnum
CREATE TYPE "TipoActa" AS ENUM ('ACTA', 'PIZARRA');

-- AlterTable
ALTER TABLE "actas_mesa" ADD COLUMN     "tipo" "TipoActa" NOT NULL DEFAULT 'ACTA';

