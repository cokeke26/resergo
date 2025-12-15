// controllers/duenoReservas.controller.js
import { prisma } from "../prisma.js";

/**
 * 🔍 Obtener reservas SOLO de un recinto del dueño
 */
export const obtenerReservasDeRecinto = async (req, res) => {
  try {
    const duenoId = req.user.id;
    const recintoId = Number(req.params.recintoId);

    if (!recintoId) {
      return res.status(400).json({ error: "Falta ID del recinto" });
    }

    // 1️⃣ Verificar que el recinto sea del dueño logeado
    const recinto = await prisma.recinto.findUnique({
      where: { id: recintoId },
    });

    if (!recinto || recinto.duenoId !== duenoId) {
      return res.status(403).json({
        error: "No tienes permiso para ver las reservas de este recinto",
      });
    }

    // 2️⃣ Obtener reservas de las canchas de ese recinto
    const reservas = await prisma.reserva.findMany({
      where: { recintoId },
      include: {
        Usuario: { select: { nombre: true, email: true } },
        Cancha: { select: { nombre: true, tipo: true } },
        recinto: { select: { nombre: true } },
      },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas del recinto:", error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};
