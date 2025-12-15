/*
  Warnings:

  - Made the column `nuevaFecha` on table `SolicitudCambio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nuevaHoraInicio` on table `SolicitudCambio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nuevaHoraFin` on table `SolicitudCambio` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SolicitudCambio" ALTER COLUMN "nuevaFecha" SET NOT NULL,
ALTER COLUMN "nuevaHoraInicio" SET NOT NULL,
ALTER COLUMN "nuevaHoraFin" SET NOT NULL;
