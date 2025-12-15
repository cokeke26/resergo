// routes/notificaciones.routes.js
import { Router } from "express";
import {
  crearNotificacion,
  obtenerNotificaciones,
  marcarLeida,
  marcarTodas,      // 🟢 IMPORTANTE: nueva función
} from "../controllers/notificaciones.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔹 Crear nueva notificación
router.post("/", requireAuth, crearNotificacion);

// 🔹 Obtener todas las notificaciones de un usuario
router.get("/:usuarioId", requireAuth, obtenerNotificaciones);

// 🔹 Marcar UNA como leída
router.patch("/:id/leida", requireAuth, marcarLeida);

// 🔹 🟢 Marcar TODAS como leídas (NUEVA)
router.put("/marcar-todas/:userId", requireAuth, marcarTodas);

export default router;
