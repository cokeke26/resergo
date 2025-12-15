// controllers/reservas.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =======================================================
   💠 Obtener TODAS las reservas (solo super admin)
======================================================= */
export const obtenerReservas = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        Usuario: { select: { nombre: true, email: true } },
        Cancha: { select: { nombre: true, tipo: true } },
        recinto: { select: { nombre: true, ubicacion: true } },
      },
      orderBy: { id: "asc" },
    });
    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas:", error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

/* =======================================================
   💠 Reservas por usuario (cliente) — FIX UBICACIÓN + MAPAS
======================================================= */
export const obtenerReservasPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const reservas = await prisma.reserva.findMany({
      where: { usuarioId: Number(id) },
      include: {
        Usuario: { select: { nombre: true, apellido: true, email: true } },
        recinto: { 
          select: { 
            nombre: true,
            ubicacion: true,
            direccion: true,
            latitud: true,
            longitud: true
          }
        },
        Cancha: { select: { nombre: true, tipo: true } },
      },
      orderBy: [{ fecha: "desc" }, { horaInicio: "desc" }],
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas usuario:", error);
    res.status(500).json({ error: "Error al obtener reservas del usuario" });
  }
};

/* =======================================================
   💠 Reservas para ADMIN (solo recintos asignados)
======================================================= */
export const obtenerReservasAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;

    const reservas = await prisma.reserva.findMany({
      where: {
        Cancha: {
          recinto: { adminId },
        },
      },
      include: {
        Usuario: { select: { nombre: true, email: true } },
        Cancha: { select: { nombre: true, tipo: true, recintoId: true } },
      },
      orderBy: [{ fecha: "desc" }, { horaInicio: "desc" }],
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas admin:", error);
    res.status(500).json({
      error: "Error al obtener reservas admin",
      detalle: error.message,
    });
  }
};

/* =======================================================
   🚀 CREAR RESERVA — Validación fuerte + Slots + Notificación
======================================================= */
export const crearReserva = async (req, res) => {
  const { recintoId, usuarioId, canchaId, slotId } = req.body;

  try {
    if (!recintoId || !usuarioId || !canchaId || !slotId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    /* =======================================================
       📌 Obtener el slot
    ======================================================== */
    const slot = await prisma.canchaSlot.findUnique({
      where: { id: Number(slotId) },
    });

    if (!slot) {
      return res.status(404).json({ error: "El slot no existe" });
    }

    /* =======================================================
       ❌ Validar que NO exista reserva ocupando ese horario
    ======================================================== */
    const slotOcupado = await prisma.canchaSlot.findFirst({
      where: {
        canchaId: Number(canchaId),
        fecha: slot.fecha,
        horaInicio: slot.horaInicio,
        horaFin: slot.horaFin,
        estado: "ocupado",
      },
    });

    if (slotOcupado) {
      return res.status(409).json({
        error: "Este horario ya está reservado por otro usuario.",
      });
    }

    /* =======================================================
       ❌ Validar que NO exista solicitud pendiente
    ======================================================== */
    const solicitudPendiente = await prisma.solicitudCambio.findFirst({
      where: {
        canchaId: Number(canchaId),
        nuevaFecha: slot.fecha,
        nuevaHoraInicio: slot.horaInicio,
        nuevaHoraFin: slot.horaFin,
        estado: "pendiente",
      },
    });

    if (solicitudPendiente) {
      return res.status(409).json({
        error: "Este horario está en una solicitud pendiente.",
      });
    }

    /* =======================================================
       🟢 Crear reserva + bloquear slot en transacción
    ======================================================== */
    const reserva = await prisma.$transaction(async (tx) => {
      const upd = await tx.canchaSlot.updateMany({
        where: {
          id: Number(slotId),
          estado: "disponible",
          canchaId: Number(canchaId),
        },
        data: { estado: "ocupado" },
      });

      if (upd.count === 0) throw new Error("SLOT_TOMADO");

      return await tx.reserva.create({
        data: {
          recintoId: Number(recintoId),
          usuarioId: Number(usuarioId),
          canchaId: Number(canchaId),
          fecha: slot.fecha,
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin,
          slotId: Number(slotId),
        },
        include: {
          Usuario: { select: { nombre: true } },
        },
      });
    });

    /* =======================================================
       🔔 Notificación al admin
    ======================================================== */
    try {
      const recinto = await prisma.recinto.findUnique({
        where: { id: Number(recintoId) },
        select: { adminId: true, nombre: true },
      });

      if (recinto?.adminId) {
        await prisma.notificacion.create({
          data: {
            usuarioId: recinto.adminId,
            titulo: "Nueva reserva creada 🏟️",
            mensaje: `El usuario ${reserva.Usuario.nombre} reservó en ${recinto.nombre} — ${slot.fecha} (${slot.horaInicio} - ${slot.horaFin}).`,
            tipo: "reserva_creada",
          },
        });
      }
    } catch (err) {
      console.error("⚠️ Error notificando:", err);
    }

    res.json({
      msg: "✅ Reserva creada correctamente",
      reserva,
    });

  } catch (error) {
    console.error("❌ Error al crear reserva:", error);

    if (error.message === "SLOT_TOMADO")
      return res.status(409).json({ error: "Este horario ya fue tomado." });

    res.status(500).json({
      error: "Error al crear la reserva",
      detalle: error.message,
    });
  }
};

/* =======================================================
   🚀 ELIMINAR RESERVA — Libera slot correctamente
======================================================= */
export const eliminarReservaAdmin = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      return res.status(404).json({ error: "La reserva no existe" });
    }

    await prisma.$transaction(async (tx) => {
      if (reserva.slotId) {
        await tx.canchaSlot.update({
          where: { id: reserva.slotId },
          data: { estado: "disponible" },
        });
      }

      await tx.reserva.delete({ where: { id } });
    });

    res.json({ msg: "✅ Reserva eliminada correctamente" });

  } catch (error) {
    console.error("🧨 Error eliminando reserva:", error);
    res.status(500).json({ error: "Error al eliminar la reserva" });
  }
};

/* =======================================================
   🚀 EDITAR RESERVA (Admin)
======================================================= */
export const editarReservaAdmin = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { recintoId, canchaId, usuarioId, slotId } = req.body;

    const slotNuevo = await prisma.canchaSlot.findUnique({
      where: { id: Number(slotId) },
    });

    if (!slotNuevo)
      return res.status(404).json({ error: "El slot no existe" });

    if (slotNuevo.estado !== "disponible")
      return res.status(409).json({ error: "El horario ya está ocupado" });

    const actualizada = await prisma.$transaction(async (tx) => {
      const reservaExistente = await tx.reserva.findUnique({ where: { id } });
      if (!reservaExistente) throw new Error("NO_EXISTE");

      if (reservaExistente.slotId) {
        await tx.canchaSlot.update({
          where: { id: reservaExistente.slotId },
          data: { estado: "disponible" },
        });
      }

      await tx.canchaSlot.update({
        where: { id: Number(slotId) },
        data: { estado: "ocupado" },
      });

      return await tx.reserva.update({
        where: { id },
        data: {
          recintoId: Number(recintoId),
          canchaId: Number(canchaId),
          usuarioId: Number(usuarioId),
          fecha: slotNuevo.fecha,
          horaInicio: slotNuevo.horaInicio,
          horaFin: slotNuevo.horaFin,
          slotId: Number(slotId),
        },
      });
    });

    res.json({ msg: "✅ Reserva actualizada correctamente", reserva: actualizada });

  } catch (error) {
    console.error("❌ Error al editar reserva:", error);

    if (error.message === "NO_EXISTE")
      return res.status(404).json({ error: "La reserva no existe" });

    res.status(500).json({ error: "Error al editar reserva" });
  }
};
