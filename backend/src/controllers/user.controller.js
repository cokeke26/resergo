import { prisma } from "../prisma.js";
import bcrypt from "bcryptjs";

/**
 * Actualiza los datos del perfil del usuario autenticado.
 */
export async function updateProfile(req, res) {
  try {
    const { nombre, apellido, telefono, password } = req.body;

    // Verifica que haya usuario autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Datos a actualizar
    const data = {};
    if (nombre) data.nombre = nombre;
    if (apellido) data.apellido = apellido;
    if (telefono) data.telefono = telefono;

    // Si se envía un nuevo password, se cifra antes de guardar
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // Actualizar usuario
    const updated = await prisma.usuario.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        estado: true,
      },
    });

    res.json({ user: updated });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
}

/**
 * Obtiene todos los usuarios (solo para administradores)
 */
export async function getAllUsers(req, res) {
  try {
    if (!req.user || req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        estado: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

