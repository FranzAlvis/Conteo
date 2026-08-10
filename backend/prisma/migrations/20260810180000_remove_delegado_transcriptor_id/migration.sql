-- DropForeignKey
ALTER TABLE "delegados" DROP CONSTRAINT "delegados_transcriptorId_fkey";

-- DropIndex
DROP INDEX "delegados_transcriptorId_idx";

-- AlterTable
ALTER TABLE "delegados" DROP COLUMN "transcriptorId";
