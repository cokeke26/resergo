import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireDueno } from "../middlewares/dueno.middleware.js";

import {
  crearRecintoDueno,
  listarRecintosDueno,
  obtenerReservasDeDueno
} from "../controllers/dueno.controller.js";

// ✔️ ESTA LÍNEA FALTABA — SIN ESTO EL ROUTER NO EXISTE
const router = Router();

/* =======================================================
   🟢 DUEÑO CREA RECINTO
======================================================= */
router.post("/recintos", requireAuth, requireDueno, crearRecintoDueno);

/* =======================================================
   🟢 LISTAR RECINTOS DEL DUEÑO
======================================================= */
router.get("/recintos", requireAuth, requireDueno, listarRecintosDueno);

/* =======================================================
   🟣 NUEVO: LISTAR TODAS LAS RESERVAS DE LOS RECINTOS DEL DUEÑO
======================================================= */
router.get(
  "/reservas",
  requireAuth,
  requireDueno,
  obtenerReservasDeDueno
);

export default router;
