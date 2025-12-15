// routes/reservas.routes.js
import { Router } from "express";

// Controladores de reservas
import {
  crearReserva,
  obtenerReservas,
  obtenerReservasPorUsuario,
  eliminarReservaAdmin,
  editarReservaAdmin,
} from "../controllers/reservas.controller.js";

// Controlador REAL para listar reservas del admin
import { listarReservasAdmin } from "../controllers/admin.controller.js";

// Middlewares
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

/* ========================================================
   ✅ RUTAS DE RESERVAS
======================================================== */

// 🔹 Obtener TODAS las reservas → solo superadmin (si lo usas)
router.get("/", requireAuth, requireAdmin, obtenerReservas);

// 🔹 Obtener reservas por usuario (cliente)
router.get("/usuario/:id", requireAuth, obtenerReservasPorUsuario);

// 🔹 Crear una nueva reserva (cliente)
router.post("/", requireAuth, crearReserva);

// 🔥🔥🔥 RUTA CORRECTA PARA ADMIN → SOLO SUS RECINTOS 🔥🔥🔥
// Usa el controlador "listarReservasAdmin" del admin.controller.js
router.get("/admin", requireAuth, requireAdmin, listarReservasAdmin);

// 🔹 Editar reserva (solo admin)
router.put("/admin/:id", requireAuth, requireAdmin, editarReservaAdmin);

// 🔹 Eliminar reserva (solo admin)
router.delete("/:id", requireAuth, requireAdmin, eliminarReservaAdmin);

export default router;
