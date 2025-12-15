import { prisma } from "../prisma.js";

/* ============================================================
   🔐 VALIDAR QUE LA CANCHA PERTENECE AL ADMIN
   ============================================================ */
async function validarCanchaAdmin(canchaId, adminId) {
  const cancha = await prisma.cancha.findUnique({
    where: { id: canchaId },
    include: {
      recinto: { select: { adminId: true } }
    }
  });

  if (!cancha) return null;
  if (cancha.recinto.adminId !== adminId) return false;
  return cancha;
}

/* ============================================================
   📌 GENERAR SLOTS (CON CAMPOS NUEVOS)
   ============================================================ */
export async function generarSlotsCancha(req, res) {
  try {
    const canchaId = Number(req.params.canchaId);
    const adminId = req.user.id;

    const cancha = await validarCanchaAdmin(canchaId, adminId);
    if (!cancha)
      return res.status(404).json({ error: "Cancha no encontrada" });
    if (cancha === false)
      return res.status(403).json({ error: "No tienes permisos sobre esta cancha" });

    const { meses = 1, horaInicio = "08:00", horaFin = "22:00", desde } = req.body;

    const start = desde ? new Date(desde) : new Date();
    start.setHours(0, 0, 0, 0);

    function addDays(d, n) {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    }

    function addMonths(d, n) {
      return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
    }

    const end = addMonths(start, Number(meses));

    const fechas = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      fechas.push(`${yyyy}-${mm}-${dd}`);
    }

    const toMin = (h) => {
      const [hr, m] = h.split(":").map(Number);
      return hr * 60 + m;
    };

    const fmt = (min) =>
      `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

    const startMin = toMin(horaInicio);
    const endMin = toMin(horaFin);

    const data = [];

    for (const fecha of fechas) {
      for (let t = startMin; t < endMin; t += 60) {
        data.push({
          canchaId,
          fecha,
          horaInicio: fmt(t),
          horaFin: fmt(t + 60),
          estado: "disponible",
          tipoBloqueo: null,
          bloqueadoDesde: null,
          bloqueadoHasta: null
        });
      }
    }

    const chunk = 1000;
    for (let i = 0; i < data.length; i += chunk) {
      await prisma.canchaSlot.createMany({
        data: data.slice(i, i + chunk),
        skipDuplicates: true
      });
    }

    res.json({
      ok: true,
      msg: "Disponibilidad generada correctamente",
      diasGenerados: fechas.length,
      slotsCreados: data.length
    });

  } catch (error) {
    console.error("❌ generarSlotsCancha:", error);
    res.status(500).json({ error: "Error al generar disponibilidad." });
  }
}

/* ============================================================
   🔥 BLOQUEAR POR HORAS (USADO INTERNAMENTE)
   ============================================================ */
async function aplicarBloqueoHoras(canchaId, fecha, desde, hasta) {
  return prisma.canchaSlot.updateMany({
    where: {
      canchaId,
      fecha,
      horaInicio: { gte: desde },
      horaFin: { lte: hasta }
    },
    data: {
      estado: "bloqueado",
      tipoBloqueo: "horas",
      bloqueadoDesde: desde,
      bloqueadoHasta: hasta
    }
  });
}

/* ============================================================
   🟦 OBTENER SLOTS DEL MES
   ============================================================ */
export async function getSlotsMes(req, res) {
  try {
    const canchaId = Number(req.params.canchaId);
    const { mes } = req.query;
    const adminId = req.user.id;
    const rol = req.user.rol;

    if (rol === "admin") {
      const cancha = await validarCanchaAdmin(canchaId, adminId);
      if (!cancha)
        return res.status(404).json({ error: "Cancha no encontrada" });
      if (cancha === false)
        return res.status(403).json({ error: "Sin permisos" });
    }

    if (!mes || !/^\d{4}-\d{2}$/.test(mes))
      return res.status(400).json({ error: "Mes inválido (YYYY-MM)" });

    const [y, m] = mes.split("-").map(Number);
    const last = new Date(y, m, 0);

    const slots = await prisma.canchaSlot.findMany({
      where: {
        canchaId,
        fecha: {
          gte: `${y}-${String(m).padStart(2, "0")}-01`,
          lte: `${y}-${String(m).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`
        }
      },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }]
    });

    res.json(slots);

  } catch (error) {
    console.error("❌ getSlotsMes:", error);
    res.status(500).json({ error: "Error al obtener slots." });
  }
}

/* ============================================================
   🔁 TOGGLE SLOT INDIVIDUAL
   ============================================================ */
export async function toggleSlot(req, res) {
  try {
    const slotId = Number(req.params.slotId);
    const adminId = req.user.id;

    const slot = await prisma.canchaSlot.findUnique({
      where: { id: slotId },
      include: { cancha: { include: { recinto: true } } }
    });

    if (!slot)
      return res.status(404).json({ error: "Slot no encontrado" });

    if (slot.cancha.recinto.adminId !== adminId)
      return res.status(403).json({ error: "No tienes permisos" });

    const nuevoEstado = slot.estado === "disponible" ? "bloqueado" : "disponible";

    const updated = await prisma.canchaSlot.update({
      where: { id: slotId },
      data: {
        estado: nuevoEstado,
        tipoBloqueo: null,
        bloqueadoDesde: null,
        bloqueadoHasta: null
      }
    });

    res.json(updated);

  } catch (error) {
    console.error("❌ toggleSlot:", error);
    res.status(500).json({ error: "Error al actualizar slot." });
  }
}

/* ============================================================
   🔥 BLOQUEAR DÍA COMPLETO O HORAS (FRONTEND USA ESTE)
   ============================================================ */
export async function setDiaCompleto(req, res) {
  try {
    const canchaId = Number(req.params.canchaId);
    const adminId = req.user.id;

    const {
      fecha,
      estado = "bloqueado",
      tipoBloqueo,
      horaInicio,
      horaFin
    } = req.body;

    if (!fecha)
      return res.status(400).json({ error: "Falta la fecha" });

    const cancha = await validarCanchaAdmin(canchaId, adminId);
    if (!cancha)
      return res.status(404).json({ error: "No existe la cancha" });
    if (cancha === false)
      return res.status(403).json({ error: "No tienes permisos" });

    /* ----------------------------------------------
       🔥 BLOQUEO POR HORAS
    ---------------------------------------------- */
    if (tipoBloqueo === "horas" && horaInicio && horaFin) {
      const r = await aplicarBloqueoHoras(canchaId, fecha, horaInicio, horaFin);
      return res.json({ ok: true, msg: "Bloqueo por horas aplicado", modificados: r.count });
    }

    /* ----------------------------------------------
       🔥 BLOQUEO DE DÍA COMPLETO
    ---------------------------------------------- */
    const upd = await prisma.canchaSlot.updateMany({
      where: { canchaId, fecha },
      data: {
        estado,
        tipoBloqueo: estado === "bloqueado" ? "dia" : null,
        bloqueadoDesde: null,
        bloqueadoHasta: null
      }
    });

    res.json({ ok: true, msg: "Día completo actualizado", modificados: upd.count });

  } catch (error) {
    console.error("❌ setDiaCompleto:", error);
    res.status(500).json({ error: "Error al actualizar disponibilidad" });
  }
}

/* ============================================================
   🔄 REGENERAR TODO
   ============================================================ */
export async function regenerarDisponibilidadCompleta(req, res) {
  try {
    const canchaId = Number(req.params.canchaId);
    const adminId = req.user.id;

    const cancha = await validarCanchaAdmin(canchaId, adminId);
    if (!cancha)
      return res.status(404).json({ error: "No existe la cancha" });
    if (cancha === false)
      return res.status(403).json({ error: "No tienes permisos" });

    await prisma.canchaSlot.deleteMany({ where: { canchaId } });

    req.body.desde = new Date().toISOString().slice(0, 10);

    return generarSlotsCancha(req, res);

  } catch (error) {
    console.error("❌ regenerarDisponibilidadCompleta:", error);
    res.status(500).json({ error: "Error al regenerar" });
  }
}
