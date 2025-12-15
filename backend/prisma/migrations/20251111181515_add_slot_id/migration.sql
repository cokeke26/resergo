-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "slotId" INTEGER;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "CanchaSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
