/*
  Warnings:

  - Added the required column `precio` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Recinto_ubicacion_key";

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "precio" INTEGER NOT NULL;
