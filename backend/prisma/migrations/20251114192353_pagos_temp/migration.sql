-- CreateTable
CREATE TABLE "PagoTemp" (
    "buyOrder" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "recintoId" INTEGER NOT NULL,
    "canchaId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "PagoTemp_pkey" PRIMARY KEY ("buyOrder")
);
