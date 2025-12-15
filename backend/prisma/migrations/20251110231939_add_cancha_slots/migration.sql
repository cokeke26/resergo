/*
  Warnings:

  - You are about to drop the column `canchaId` on the `Disponibilidad` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ubicacion]` on the table `Recinto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recintoId` to the `Disponibilidad` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Disponibilidad" DROP CONSTRAINT "Disponibilidad_canchaId_fkey";

-- AlterTable
ALTER TABLE "Disponibilidad" DROP COLUMN "canchaId",
ADD COLUMN     "recintoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CanchaSlot" (
    "id" SERIAL NOT NULL,
    "canchaId" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',

    CONSTRAINT "CanchaSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CanchaSlot_canchaId_fecha_idx" ON "CanchaSlot"("canchaId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CanchaSlot_canchaId_fecha_horaInicio_horaFin_key" ON "CanchaSlot"("canchaId", "fecha", "horaInicio", "horaFin");

-- CreateIndex
CREATE UNIQUE INDEX "Recinto_ubicacion_key" ON "Recinto"("ubicacion");

-- AddForeignKey
ALTER TABLE "Disponibilidad" ADD CONSTRAINT "Disponibilidad_recintoId_fkey" FOREIGN KEY ("recintoId") REFERENCES "Recinto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanchaSlot" ADD CONSTRAINT "CanchaSlot_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "Cancha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
