// routes/dueno.reservas.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireDueno } from "../middlewares/dueno.middleware.js";
import { obtenerReservasDeRecinto } from "../controllers/duenoReservas.controller.js";

const router = Router();

// 🔥 ESTA ES LA RUTA QUE EL FRONT NECESITA
router.get("/reservas/:recintoId", requireAuth, requireDueno, obtenerReservasDeRecinto);

export default router;
