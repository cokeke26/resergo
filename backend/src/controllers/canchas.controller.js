// controllers/canchas.controller.js
import { prisma } from "../prisma.js";
import { generarSlotsCancha } from "./canchaDisponibilidad.controller.js";

/* =======================================================
   🟢 RUTA PÚBLICA (CLIENTE)
======================================================= */
export const obtenerCanchasPublic = async (req, res) => {
  try {
    const recintoId = Number(req.params.recintoId);

    const canchas = await prisma.cancha.findMany({
      where: { recintoId },
      orderBy: { id: "asc" },
    });

    res.json(canchas);
  } catch (error) {
    console.error("❌ Error al obtener canchas (cliente):", error);
    res.status(500).json({ error: "Error al obtener canchas" });
  }
};

/* =======================================================
   🔒 VALIDAR CANCHA DEL ADMIN
======================================================= */
async function validarCanchaAdmin(canchaId, adminId) {
  const cancha = await prisma.cancha.findUnique({
    where: { id: canchaId },
    include: { recinto: true },
  });

  if (!cancha) return null;
  if (cancha.recinto.adminId !== adminId) return false;

  return cancha;
}

/* =======================================================
   🔵 RUTA PROTEGIDA (ADMIN)
======================================================= */
export const obtenerCanchasAdmin = async (req, res) => {
  try {
    const recintoId = Number(req.params.recintoId);
    const adminId = req.user.id;

    const recinto = await prisma.recinto.findUnique({
      where: { id: recintoId },
    });

    if (!recinto)
      return res.status(404).json({ error: "Recinto no encontrado" });

    if (recinto.adminId !== adminId)
      return res.status(403).json({
        error: "No tienes permiso para ver las canchas de este recinto",
      });

    const canchas = await prisma.cancha.findMany({
      where: { recintoId },
      orderBy: { id: "asc" },
    });

    res.json(canchas);
  } catch (error) {
    console.error("❌ Error al obtener canchas admin:", error);
    res.status(500).json({ error: "Error al obtener canchas" });
  }
};

/* =======================================================
   🔵 Crear cancha (ADMIN)
======================================================= */
export const crearCancha = async (req, res) => {
  try {
    const recintoId = Number(req.params.recintoId);
    const adminId = req.user.id;
    const { nombre, tipo } = req.body;

    if (!nombre || !tipo)
      return res.status(400).json({ error: "Faltan datos obligatorios" });

    const recinto = await prisma.recinto.findUnique({
      where: { id: recintoId },
    });

    if (!recinto)
      return res.status(404).json({ error: "Recinto no encontrado" });

    if (recinto.adminId !== adminId)
      return res.status(403).json({
        error: "No tienes permiso para crear canchas en este recinto",
      });

    const cancha = await prisma.cancha.create({
      data: { nombre, tipo, recintoId },
    });

    req.params.canchaId = cancha.id;
    req.body.meses = 1;
    req.body.horaInicio = "08:00";
    req.body.horaFin = "22:00";

    await generarSlotsCancha(req, {
      json: () => {},
      status: () => ({ json: () => {} }),
    });

    res.json({
      msg: "✔ Cancha creada y disponibilidad generada",
      cancha,
    });
  } catch (error) {
    console.error("❌ Error al crear cancha:", error);
    res.status(500).json({ error: "Error al crear cancha" });
  }
};

/* =======================================================
   🔵 Editar cancha (ADMIN)
======================================================= */
export const editarCancha = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const adminId = req.user.id;
    const { nombre, tipo } = req.body;

    const valido = await validarCanchaAdmin(id, adminId);
    if (!valido)
      return res
        .status(403)
        .json({ error: "No tienes permiso para editar esta cancha" });

    const cancha = await prisma.cancha.update({
      where: { id },
      data: { nombre, tipo },
    });

    res.json(cancha);
  } catch (error) {
    console.error("❌ Error al editar cancha:", error);
    res.status(500).json({ error: "Error al editar cancha" });
  }
};

/* =======================================================
   🔵 Eliminar cancha (ADMIN)
======================================================= */
export const eliminarCancha = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const adminId = req.user.id;

    const valido = await validarCanchaAdmin(id, adminId);
    if (!valido)
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar esta cancha" });

    await prisma.cancha.delete({ where: { id } });

    res.json({ msg: "✔ Cancha eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar cancha:", error);
    res.status(500).json({ error: "Error al eliminar cancha" });
  }
};
