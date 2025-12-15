// routes/canchas.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

import {
  obtenerCanchasPublic,
  obtenerCanchasAdmin,
  crearCancha,
  editarCancha,
  eliminarCancha
} from "../controllers/canchas.controller.js";

import {
  generarSlotsCancha,
  getSlotsMes,
  toggleSlot,
  setDiaCompleto,
  regenerarDisponibilidadCompleta
} from "../controllers/canchaDisponibilidad.controller.js";

const router = Router();

/* =====================================================
   🟢 CLIENTE — Obtener canchas SIN validación admin
   ===================================================== */
router.get("/:recintoId", obtenerCanchasPublic);

/* =====================================================
   🔵 ADMIN — Obtener canchas del recinto administrado
   ===================================================== */
router.get(
  "/admin/:recintoId",
  requireAuth,
  requireAdmin,
  obtenerCanchasAdmin
);

/* =====================================================
   🔵 CRUD DE CANCHAS (ADMIN)
   ===================================================== */
router.post(
  "/:recintoId",
  requireAuth,
  requireAdmin,
  crearCancha
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  editarCancha
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  eliminarCancha
);

/* =====================================================
   🔵 DISPONIBILIDAD (ADMIN)
   ===================================================== */
router.post(
  "/:canchaId/disponibilidad/generar",
  requireAuth,
  requireAdmin,
  generarSlotsCancha
);

router.post(
  "/:canchaId/disponibilidad/regenerar",
  requireAuth,
  requireAdmin,
  regenerarDisponibilidadCompleta
);

router.patch(
  "/slots/:slotId/toggle",
  requireAuth,
  requireAdmin,
  toggleSlot
);

router.post(
  "/:canchaId/disponibilidad/dia",
  requireAuth,
  requireAdmin,
  setDiaCompleto
);

/* =====================================================
   🟢 CLIENTE + ADMIN — Obtener slots (SIN validar admin)
   ===================================================== */
router.get(
  "/:canchaId/disponibilidad",
  requireAuth,
  getSlotsMes
);

export default router;
