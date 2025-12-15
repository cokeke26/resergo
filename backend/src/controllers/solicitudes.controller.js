// controllers/solicitudes.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =======================================================
   ✅ Crear solicitud de cambio (Cliente → Admin)
======================================================= */
export const crearSolicitudCambio = async (req, res) => {
  try {
    const usuarioIdToken = req.user?.id;
    const {
      usuarioId,          // opcional
      reservaId,
      canchaId,
      nuevaFecha,
      nuevaHoraInicio,
      nuevaHoraFin,
    } = req.body;

    const usuarioIdFinal = Number(usuarioId || usuarioIdToken);

    if (
      !usuarioIdFinal ||
      !reservaId ||
      !canchaId ||
      !nuevaFecha ||
      !nuevaHoraInicio ||
      !nuevaHoraFin
    ) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: Number(reservaId) },
      include: {
        Usuario: true,
        Cancha: {
          include: { recinto: true },
        },
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: "La reserva no existe" });
    }

    // Solicitud pendiente existente
    const existe = await prisma.solicitudCambio.findFirst({
      where: { reservaId: Number(reservaId), estado: "pendiente" },
    });

    if (existe) {
      return res.status(409).json({
        error: "Ya existe una solicitud pendiente para esta reserva.",
      });
    }

    // Crear solicitud
    const solicitud = await prisma.solicitudCambio.create({
      data: {
        usuarioId: usuarioIdFinal,
        reservaId: Number(reservaId),
        canchaId: Number(canchaId),
        nuevaFecha,
        nuevaHoraInicio,
        nuevaHoraFin,
        estado: "pendiente",
      },
    });

    /* =======================================================
       🔔 NOTIFICACIÓN AL ADMIN DEL RECINTO
    ======================================================== */
    try {
      const adminIdCorrecto = reserva.Cancha.recinto.adminId;

      if (adminIdCorrecto) {
        await prisma.notificacion.create({
          data: {
            usuarioId: adminIdCorrecto,
            titulo: "Solicitud de cambio de hora",
            mensaje:
              `El usuario ${reserva.Usuario.nombre} solicita cambiar su reserva ` +
              `del ${reserva.fecha} (${reserva.horaInicio}-${reserva.horaFin}) ` +
              `a ${nuevaFecha} (${nuevaHoraInicio}-${nuevaHoraFin}).`,
            tipo: "solicitud_cambio",
          },
        });
      }
    } catch (errorNoti) {
      console.error("⚠️ Error creando notificación para admin:", errorNoti);
    }

    res.status(201).json({
      msg: "✅ Solicitud creada correctamente",
      solicitud,
    });
  } catch (error) {
    console.error("❌ Error al crear solicitud:", error);
    res.status(500).json({ error: "Error al crear solicitud de cambio" });
  }
};

/* =======================================================
   ✅ Obtener solicitudes pendientes (Solo del ADMIN)
======================================================= */
export const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const adminId = req.user.id;

    const solicitudes = await prisma.solicitudCambio.findMany({
      where: {
        estado: "pendiente",
        cancha: {
          recinto: {
            adminId: adminId,
          },
        },
      },
      include: {
        usuario: { select: { nombre: true, email: true } },
        reserva: true,
        cancha: true,
      },
      orderBy: { creadaEn: "desc" },
    });

    res.json(solicitudes);
  } catch (error) {
    console.error("❌ Error al obtener solicitudes:", error);
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};

/* =======================================================
   ✅ Responder solicitud (Admin → Cliente)
======================================================= */
export const responderSolicitud = async (req, res) => {
  try {
    const solicitudId = Number(req.params.id);
    const { accion } = req.body;

    if (!solicitudId || !accion) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const solicitud = await prisma.solicitudCambio.findUnique({
      where: { id: solicitudId },
      include: {
        reserva: true,
        usuario: true,
        cancha: { include: { recinto: true } },
      },
    });

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    if (solicitud.cancha.recinto.adminId !== req.user.id) {
      return res.status(403).json({
        error: "No tienes permisos para gestionar esta solicitud.",
      });
    }

    if (solicitud.estado !== "pendiente") {
      return res.status(400).json({
        error: "Esta solicitud ya fue procesada.",
      });
    }

    /* =======================================================
       ❌ RECHAZAR SOLICITUD
    ======================================================== */
    if (accion === "rechazar") {
      await prisma.solicitudCambio.update({
        where: { id: solicitudId },
        data: { estado: "rechazada" },
      });

      // Notificación al usuario
      await prisma.notificacion.create({
        data: {
          usuarioId: solicitud.usuarioId,
          titulo: "Solicitud rechazada",
          mensaje: "Tu solicitud de cambio de hora fue rechazada por el administrador.",
          tipo: "solicitud_cambio",
        },
      });

      return res.json({ msg: "❌ Solicitud rechazada correctamente" });
    }

    /* =======================================================
       ✅ ACEPTAR SOLICITUD — ACTUALIZA RESERVA + SLOTS
    ======================================================== */
    if (accion === "aceptar") {
      const resultado = await prisma.$transaction(async (tx) => {
        const reserva = solicitud.reserva;

        // 1️⃣ Liberar slot antiguo
        await tx.canchaSlot.updateMany({
          where: {
            canchaId: reserva.canchaId,
            fecha: reserva.fecha,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin,
          },
          data: { estado: "disponible" },
        });

        // 2️⃣ Ocupar slot nuevo
        await tx.canchaSlot.updateMany({
          where: {
            canchaId: solicitud.canchaId,
            fecha: solicitud.nuevaFecha,
            horaInicio: solicitud.nuevaHoraInicio,
            horaFin: solicitud.nuevaHoraFin,
          },
          data: { estado: "ocupado" },
        });

        // 3️⃣ Actualizar reserva
        const reservaActualizada = await tx.reserva.update({
          where: { id: reserva.id },
          data: {
            fecha: solicitud.nuevaFecha,
            horaInicio: solicitud.nuevaHoraInicio,
            horaFin: solicitud.nuevaHoraFin,
          },
        });

        // 4️⃣ Marcar solicitud como aceptada
        await tx.solicitudCambio.update({
          where: { id: solicitudId },
          data: { estado: "aceptada" },
        });

        return reservaActualizada;
      });

      // 5️⃣ Notificar al cliente
      await prisma.notificacion.create({
        data: {
          usuarioId: solicitud.usuarioId,
          titulo: "Solicitud aceptada",
          mensaje: `Tu solicitud fue aceptada. Nueva fecha: ${solicitud.nuevaFecha} (${solicitud.nuevaHoraInicio}-${solicitud.nuevaHoraFin}).`,
          tipo: "solicitud_cambio",
        },
      });

      return res.json({
        msg: "✅ Solicitud aceptada y reserva actualizada correctamente",
        reservaActualizada: resultado,
      });
    }

    return res.status(400).json({
      error: "Acción inválida (use 'aceptar' o 'rechazar')",
    });

  } catch (error) {
    console.error("❌ Error al responder solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};
