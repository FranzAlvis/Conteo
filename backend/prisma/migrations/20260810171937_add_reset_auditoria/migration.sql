-- CreateTable
CREATE TABLE "reset_auditoria" (
    "id" TEXT NOT NULL,
    "ejecutadoPorId" TEXT NOT NULL,
    "mesasReseteadas" INTEGER NOT NULL,
    "votosEliminados" INTEGER NOT NULL,
    "actasEliminadas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reset_auditoria_ejecutadoPorId_idx" ON "reset_auditoria"("ejecutadoPorId");

-- AddForeignKey
ALTER TABLE "reset_auditoria" ADD CONSTRAINT "reset_auditoria_ejecutadoPorId_fkey" FOREIGN KEY ("ejecutadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
