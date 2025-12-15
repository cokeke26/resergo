import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  registerAdmin,
  listarRecintosAdmin,
  listarReservasAdmin,
  listarTodosRecintos, // 👈 agregado para futuros super admin
} from "../controllers/admin.controller.js";

const router = Router();

/**
 * ✅ Registrar un nuevo administrador
 * (solo temporal, puedes comentar esta ruta luego del primer registro)
 */
router.post("/register", registerAdmin);

/**
 * 🏟️ Obtener los recintos administrados por el admin autenticado
 */
router.get("/recintos", requireAuth, requireAdmin, listarRecintosAdmin);

/**
 * 📅 Obtener todas las reservas de los recintos administrados por el admin
 */
router.get("/reservas", requireAuth, requireAdmin, listarReservasAdmin);

/**
 * 🌐 (Opcional) Ver todos los recintos del sistema — solo para super admin
 */
router.get("/recintos/todos", requireAuth, requireAdmin, listarTodosRecintos);

export default router;
