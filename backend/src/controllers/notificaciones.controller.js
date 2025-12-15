// controllers/notificaciones.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =====================================================
   ✅ Crear notificación
===================================================== */
export const crearNotificacion = async (req, res) => {
  try {
    const { usuarioId, titulo, mensaje } = req.body;

    if (!usuarioId || !titulo || !mensaje)
      return res.status(400).json({ error: "Datos incompletos" });

    const nueva = await prisma.notificacion.create({
      data: {
        usuarioId: Number(usuarioId),
        titulo,
        mensaje,
        leida: false,
      },
    });

    res.json(nueva);
  } catch (err) {
    console.error("❌ Error al crear notificación:", err);
    res.status(500).json({ error: "Error al crear notificación" });
  }
};

/* =====================================================
   ✅ Obtener notificaciones por usuario
===================================================== */
export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);

    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { fecha: "desc" }, // 🔥 ordenadas por fecha más reciente
    });

    res.json(notificaciones);
  } catch (err) {
    console.error("❌ Error al obtener notificaciones:", err);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

/* =====================================================
   ✅ Marcar UNA como leída
===================================================== */
export const marcarLeida = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const noti = await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });

    res.json(noti);
  } catch (err) {
    console.error("❌ Error al actualizar notificación:", err);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

/* =====================================================
   🟢 Marcar TODAS como leídas (NUEVA)
===================================================== */
export const marcarTodas = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    await prisma.notificacion.updateMany({
      where: {
        usuarioId: userId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    res.json({ msg: "Todas las notificaciones fueron marcadas como leídas" });
  } catch (err) {
    console.error("❌ Error al marcar todas:", err);
    res.status(500).json({ error: "Error al marcar todas como leídas" });
  }
};
