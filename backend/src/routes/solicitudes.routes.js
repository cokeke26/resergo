// routes/solicitudes.routes.js
import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

import {
  crearSolicitudCambio,
  obtenerSolicitudesPendientes,
  responderSolicitud,
} from "../controllers/solicitudes.controller.js";

const router = express.Router();

/* =======================================================
   🧩 Cliente solicita cambio de hora
======================================================= */
router.post("/", requireAuth, crearSolicitudCambio);

/* =======================================================
   🧩 Admin obtiene solicitudes pendientes
======================================================= */
router.get("/pendientes", requireAuth, requireAdmin, obtenerSolicitudesPendientes);

/* =======================================================
   🧩 Admin responde (aceptar / rechazar)
======================================================= */
router.put("/:id/responder", requireAuth, requireAdmin, responderSolicitud);

export default router;
