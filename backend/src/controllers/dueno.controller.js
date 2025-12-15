// controllers/dueno.controller.js
import { prisma } from "../prisma.js";

/* ============================================================================
   🏟️ CREAR NUEVO RECINTO DEL DUEÑO (GUARDA COORDENADAS + DIRECCIÓN)
============================================================================ */
export async function crearRecintoDueno(req, res) {
  try {
    const { 
      nombre,
      ubicacion, 
      direccion,
      latitud,
      longitud,
      adminId,
      canchas 
      
    } = req.body;
    console.log("📌 Datos recibidos:", req.body);

    const duenoId = req.user.id;

    if (!nombre || !ubicacion || !adminId) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // ✔ Validar administrador
    const admin = await prisma.usuario.findUnique({
      where: { id: Number(adminId) },
    });

    if (!admin || admin.rol !== "admin") {
      return res.status(400).json({
        error: "El ID enviado no corresponde a un administrador válido.",
      });
    }

    // ✔ Crear recinto con coordenadas
    const recinto = await prisma.recinto.create({
      data: {
        nombre,
        ubicacion,                // texto
        direccion: direccion || ubicacion,
        latitud: latitud ? Number(latitud) : null,
        longitud: longitud ? Number(longitud) : null,

        duenoId,
        adminId: Number(adminId),
      },
    });

    // ✔ Crear canchas automáticas
    if (Array.isArray(canchas)) {
      for (const c of canchas) {
        const tipo = String(c.tipo || "").trim();
        const cantidad = Math.max(1, parseInt(c.cantidad ?? 1));

        if (!tipo) continue;

        for (let i = 1; i <= cantidad; i++) {
          await prisma.cancha.create({
            data: {
              nombre: `${tipo} ${i}`,
              tipo,
              recintoId: recinto.id,
            },
          });
        }
      }
    }

    // ✔ Obtener datos del dueño
    const dueno = await prisma.usuario.findUnique({
      where: { id: duenoId },
      select: { nombre: true, apellido: true }
    });

    /* =====================================================
       🔔 Crear notificación al admin
    ======================================================*/
    await prisma.notificacion.create({
      data: {
        usuarioId: Number(adminId),
        titulo: "Nuevo recinto asignado 🏟️",
        mensaje: `El dueño ${dueno?.nombre} ${dueno?.apellido} ha creado el recinto "${recinto.nombre}".`,
        tipo: "asignacion_recinto",
      },
    });

    // ✔ Devolver recinto completo
    const recintoCompleto = await prisma.recinto.findUnique({
      where: { id: recinto.id },
      include: {
        canchas: true,
        admin: true,
        dueno: true,
      },
    });

    return res.status(201).json({
      msg: "✅ Recinto creado correctamente con ubicación y coordenadas",
      recinto: recintoCompleto,
    });

  } catch (error) {
    console.error("❌ Error al crear recinto del dueño:", error);
    return res.status(500).json({
      error: "Error al crear recinto del dueño",
      detalle: error.message,
    });
  }
}

/* ============================================================================
   🟢 LISTAR RECINTOS DEL DUEÑO
============================================================================ */
export async function listarRecintosDueno(req, res) {
  try {
    const duenoId = req.user.id;

    const recintos = await prisma.recinto.findMany({
      where: { duenoId },
      include: {
        dueno: true,
        admin: true,
        canchas: true,
      },
    });

    res.json(recintos);
  } catch (error) {
    console.error("❌ Error al listar recintos del dueño:", error);
    res.status(500).json({
      error: "Error al listar recintos del dueño",
      detalle: error.message,
    });
  }
}

/* ============================================================================
   🔥 RESERVAS DE TODOS LOS RECINTOS DEL DUEÑO
============================================================================ */
export async function obtenerReservasDeDueno(req, res) {
  try {
    const duenoId = req.user.id;

    const reservas = await prisma.reserva.findMany({
      where: {
        recinto: { duenoId }
      },
      include: {
        Usuario: true,
        Cancha: true,
        recinto: true,
      },
      orderBy: [
        { fecha: "desc" },
        { horaInicio: "desc" }
      ]
    });

    res.json(reservas);

  } catch (error) {
    console.error("❌ Error al obtener reservas del dueño:", error);
    res.status(500).json({
      error: "Error al obtener reservas del dueño",
      detalle: error.message
    });
  }
}
