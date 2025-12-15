// routes/canchaDisponibilidad.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";

import {
  generarSlotsCancha,
  getSlotsMes,
  toggleSlot,
  setDiaCompleto
} from "../controllers/canchaDisponibilidad.controller.js";

const router = Router();

/* ============================================================
   GENERAR SLOTS
============================================================ */
router.post(
  "/:canchaId/disponibilidad/generar",
  requireAuth,
  generarSlotsCancha
);

/* ============================================================
   OBTENER SLOTS DEL MES
============================================================ */
router.get(
  "/:canchaId/disponibilidad",
  requireAuth,
  getSlotsMes
);

/* ============================================================
   BLOQUEAR DÍA O HORAS (usa setDiaCompleto en el controlador)
============================================================ */
router.post(
  "/:canchaId/disponibilidad/dia",
  requireAuth,
  setDiaCompleto
);

/* ============================================================
   TOGGLE SLOT INDIVIDUAL
============================================================ */
router.patch(
  "/slots/:slotId/toggle",
  requireAuth,
  toggleSlot
);

export default router;
