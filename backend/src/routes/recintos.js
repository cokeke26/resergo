import express from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = express.Router();

/* =======================================================
   ✅ Obtener todos los recintos
======================================================= */
router.get("/", requireAuth, async (req, res) => {
  try {
    const recintos = await prisma.recinto.findMany({
      include: { disponibilidades: true },
      orderBy: { id: "asc" },
    });

    // Normalizamos las fechas (sin UTC)
    const data = recintos.map((r) => ({
      ...r,
      disponibilidades: r.disponibilidades.map((d) => ({
        ...d,
        fecha:
          d.fecha instanceof Date
            ? d.fecha.toLocaleDateString("en-CA") // yyyy-mm-dd
            : d.fecha,
      })),
    }));

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener recintos:", err);
    res.status(500).json({ error: "Error al obtener recintos" });
  }
});

/* =======================================================
   ✅ Crear recinto
======================================================= */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nombre, ubicacion, descripcion, disponibilidad } = req.body;

    if (!nombre || !ubicacion) {
      return res
        .status(400)
        .json({ error: "El nombre y la ubicación son obligatorios." });
    }

    const nuevo = await prisma.recinto.create({
      data: {
        nombre,
        ubicacion,
        descripcion,
        duenoId: req.user.id, // dueño logueado
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

    res.json({
      msg: "✅ Recinto creado correctamente",
      recinto: nuevo,
    });
  } catch (err) {
    console.error("🧨 Error al crear recinto:", err);
    res.status(500).json({
      error: "Error interno al crear recinto",
      detalle: err.message,
    });
  }
});

/* =======================================================
   ✅ Obtener disponibilidad real del recinto
======================================================= */
router.get("/:id/disponibilidad", requireAuth, async (req, res) => {
  try {
    const recintoId = Number(req.params.id);

    if (!recintoId) {
      return res.status(400).json({ error: "Falta el ID del recinto." });
    }

    const disponibilidades = await prisma.disponibilidad.findMany({
      where: { recintoId },
      orderBy: { fecha: "asc" },
    });

    const reservas = await prisma.reserva.findMany({
      where: { recintoId },
      select: { fecha: true, horaInicio: true },
    });

    // Unir disponibilidad con reservas
    const data = disponibilidades.map((d) => {
      const fechaDisp = d.fecha;
      const horasOcupadas = reservas
        .filter((r) => r.fecha === fechaDisp)
        .map((r) => r.horaInicio);

      return {
        id: d.id,
        fecha: fechaDisp,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
        horasOcupadas,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener disponibilidad:", err);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
});

/* =======================================================
   ✅ Mis recintos (admin)
======================================================= */
router.get("/mis", requireAuth, requireAdmin, async (req, res) => {
  try {
    const recintos = await prisma.recinto.findMany({
      where: { duenoId: req.user.id },
      include: { disponibilidades: true, canchas: true },
      orderBy: { id: "asc" },
    });

    res.json(recintos);
  } catch (err) {
    console.error("❌ Error al obtener recintos del admin:", err);
    res
      .status(500)
      .json({ error: "Error al obtener los recintos del administrador" });
  }
});

/* =======================================================
   ✅ Calendario completo → /api/recintos/:id/disponibilidad-todo
======================================================= */
router.get("/:id/disponibilidad-todo", requireAuth, async (req, res) => {
  try {
    const recintoId = Number(req.params.id);
    if (!recintoId) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // 1️⃣ Obtener todas las disponibilidades del recinto
    const disponibilidades = await prisma.disponibilidad.findMany({
      where: { recintoId },
      orderBy: { fecha: "asc" },
    });

    // 2️⃣ Obtener reservas del recinto
    const reservas = await prisma.reserva.findMany({
      where: { recintoId },
      select: { fecha: true, horaInicio: true },
    });

    // 3️⃣ Construir calendario
    const calendario = disponibilidades.map((d) => {
      const fecha = d.fecha;
      const horasOcupadas = reservas
        .filter((r) => r.fecha === fecha)
        .map((r) => r.horaInicio);

      const bloques = [];
      const hInicio = parseInt(d.horaInicio.split(":")[0]);
      const hFin = parseInt(d.horaFin.split(":")[0]);

      for (let h = hInicio; h < hFin; h++) {
        const inicio = `${String(h).padStart(2, "0")}:00`;
        const fin = `${String(h + 1).padStart(2, "0")}:00`;

        bloques.push({
          inicio,
          fin,
          disponible: !horasOcupadas.includes(inicio),
        });
      }

      return { fecha, bloques };
    });

    res.json(calendario);
  } catch (err) {
    console.error("❌ Error en disponibilidad-todo:", err);
    res.status(500).json({ error: "Error obteniendo calendario completo" });
  }
});

export default router;
