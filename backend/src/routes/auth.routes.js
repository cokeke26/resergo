import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { registerAdmin } from "../controllers/admin.controller.js";

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Registrar un nuevo usuario normal
 * @access Público
 */
router.post("/register", register);

/**
 * @route POST /api/auth/register-usuario
 * @desc Alias para compatibilidad con frontend (RegisterUsuarioView.vue)
 * @access Público
 */
router.post("/register-usuario", register); // 👈 usa la misma función 'register'

/**
 * @route POST /api/auth/register-admin
 * @desc Registrar un nuevo administrador
 * @access Público
 */
router.post("/register-admin", registerAdmin);

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Público
 */
router.post("/login", login);

/**
 * @route GET /api/auth/me
 * @desc Obtener datos del usuario autenticado
 * @access Privado
 */
router.get("/me", requireAuth, me);

export default router;
