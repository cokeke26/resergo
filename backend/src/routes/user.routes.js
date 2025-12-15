import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getAllUsers, updateProfile } from "../controllers/user.controller.js";
import { prisma } from "../prisma.js";

const router = Router();

/**
 * ✏️ Actualizar perfil del usuario autenticado
 */
router.put("/me", requireAuth, updateProfile);

/**
 * 👥 Obtener todos los usuarios (solo para admin)
 */
router.get("/", requireAuth, getAllUsers);

/**
 * 🧑‍💼 Nueva ruta: Listar administradores (para el dueño)
 * Esta no rompe nada existente, solo agrega funcionalidad extra.
 */
router.get("/admins", async (req, res) => {
  try {
    const admins = await prisma.usuario.findMany({
      where: { rol: "admin" },
      select: { id: true, nombre: true, apellido: true, email: true },
    });

    res.json(admins);
  } catch (error) {
    console.error("❌ Error al obtener administradores:", error);
    res.status(500).json({ error: "Error al obtener administradores" });
  }
});

export default router;
