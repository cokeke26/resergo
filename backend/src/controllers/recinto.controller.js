import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* =======================================================
   ✅ Obtener todos los recintos (con disponibilidad incluida)
======================================================= */
export const obtenerRecintos = async (req, res) => {
  try {
    const recintos = await prisma.recinto.findMany({
      include: { disponibilidades: true },
      orderBy: { id: "asc" },
    });

    const data = recintos.map((r) => ({
      ...r,
      disponibilidades: r.disponibilidades.map((d) => ({
        ...d,
        fecha:
          d.fecha instanceof Date
            ? d.fecha.toLocaleDateString("en-CA")
            : d.fecha,
      })),
    }));

    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener recintos:", error);
    res.status(500).json({ error: "Error al obtener recintos" });
  }
};

/* =======================================================
   ✅ Crear un nuevo recinto (GUARDA COORDENADAS + DIRECCIÓN)
======================================================= */
export const crearRecinto = async (req, res) => {
  try {
    const { 
      nombre, 
      ubicacion, 
      descripcion, 
      disponibilidad, 
      duenoId, 
      adminId,
      latitud,
      longitud,
      direccion
    } = req.body;

    // 🔍 Validar campos obligatorios
    if (!nombre || !ubicacion || !duenoId || !adminId) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: nombre, ubicación, dueño o admin."
      });
    }

    // 🚫 Verificar duplicados
    const existente = await prisma.recinto.findFirst({
      where: {
        OR: [
          { nombre: { equals: nombre, mode: "insensitive" } },
          { ubicacion: { equals: ubicacion, mode: "insensitive" } },
        ],
      },
    });

    if (existente) {
      return res.status(409).json({
        error: `Ya existe un recinto con el mismo ${
          existente.nombre === nombre ? "nombre" : "ubicación"
        }.`,
      });
    }

    // 🧩 Crear recinto
    const nuevoRecinto = await prisma.$transaction(async (tx) => {
      return await tx.recinto.create({
        data: {
          nombre,
          ubicacion,
          descripcion,

          duenoId: Number(duenoId),
          adminId: Number(adminId),

          // ⭐ Ubicación REAL del mapa (si existe)
          direccion: direccion || ubicacion,
          latitud: latitud ? Number(latitud) : null,
          longitud: longitud ? Number(longitud) : null,

          disponibilidades: {
            create: (disponibilidad || []).map((d) => ({
              fecha: d.fecha,
              horaInicio: d.horaInicio,
              horaFin: d.horaFin,
            })),
          },
        },
        include: { disponibilidades: true },
      });
    });

    /* ==============================================
       🔔 Crear notificación automática al admin
    ============================================== */
    try {
      const dueno = await prisma.usuario.findUnique({
        where: { id: Number(duenoId) },
        select: { nombre: true },
      });

      await prisma.notificacion.create({
        data: {
          usuarioId: Number(adminId),
          titulo: "Nuevo recinto asignado 🏟️",
          mensaje: `El dueño "${dueno?.nombre || "Desconocido"}" te ha asignado el recinto "${nuevoRecinto.nombre}".`,
          tipo: "asignacion_recinto",
        },
      });

      console.log(`📩 Notificación enviada al admin (ID: ${adminId})`);
    } catch (errorNoti) {
      console.error("⚠️ Error al crear notificación:", errorNoti);
    }

    res.status(201).json({
      msg: "✅ Recinto creado correctamente con ubicación",
      recinto: nuevoRecinto,
    });

  } catch (error) {
    console.error("🧨 Error al crear recinto:", error);
    res.status(500).json({
      error: "Error al crear el recinto",
      detalle: error.message,
    });
  }
};

/* =======================================================
   ✅ Eliminar recinto
======================================================= */
export const eliminarRecinto = async (req, res) => {
  try {
    const { id } = req.params;

    const recinto = await prisma.recinto.findUnique({ where: { id: Number(id) } });
    if (!recinto) return res.status(404).json({ error: "El recinto no existe." });

    await prisma.recinto.delete({ where: { id: Number(id) } });

    res.json({ msg: "✅ Recinto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar recinto:", error);
    res.status(500).json({ error: "Error al eliminar recinto" });
  }
};

/* =======================================================
   ✅ Obtener disponibilidad real del recinto
======================================================= */
export const obtenerDisponibilidad = async (req, res) => {
  try {
    const recintoId = Number(req.params.id);
    if (!recintoId)
      return res.status(400).json({ error: "Falta ID del recinto." });

    const disponibilidades = await prisma.disponibilidad.findMany({
      where: { recintoId },
      orderBy: { fecha: "asc" },
    });

    const reservas = await prisma.reserva.findMany({
      where: { recintoId },
      select: { fecha: true, horaInicio: true, horaFin: true },
    });

    const data = disponibilidades.map((d) => {
      const fechaNormal =
        d.fecha instanceof Date
          ? d.fecha.toLocaleDateString("en-CA")
          : d.fecha;

      const reservasDelDia = reservas.filter((r) => {
        const f =
          r.fecha instanceof Date
            ? r.fecha.toLocaleDateString("en-CA")
            : r.fecha;
        return f === fechaNormal;
      });

      return {
        id: d.id,
        recintoId: d.recintoId,
        fecha: fechaNormal,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
        horasOcupadas: reservasDelDia.map((r) => r.horaInicio),
      };
    });

    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener disponibilidad:", error);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};
