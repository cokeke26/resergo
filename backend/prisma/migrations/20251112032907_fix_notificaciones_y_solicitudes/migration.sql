/*
  Warnings:

  - Added the required column `titulo` to the `Notificacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notificacion" ADD COLUMN     "titulo" TEXT NOT NULL,
ALTER COLUMN "tipo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "slotId" INTEGER;
