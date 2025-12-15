import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Middleware de autenticación JWT mejorado
 * Verifica el token, busca al usuario real en la BD y lo agrega a req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 🔹 1. Verificar que el header exista
    if (!authHeader) {
      return res.status(401).json({ error: "Falta cabecera Authorization" });
    }

    // 🔹 2. Verificar formato correcto: "Bearer <token>"
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Formato del token inválido. Debe comenzar con 'Bearer '" });
    }

    // 🔹 3. Extraer token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    // 🔹 4. Verificar token y decodificar datos
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 5. Buscar usuario real en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado o eliminado" });
    }

    // ✅ 6. Adjuntar usuario completo (con rol actualizado)
    req.user = user;

    // ✅ 7. Continuar normalmente
    next();
  } catch (error) {
    console.error("❌ Error en requireAuth:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado. Inicia sesión nuevamente." });
    }

    if (error.name === "JsonWebTokenError" || error.message.includes("malformed")) {
      return res.status(401).json({ error: "Token malformado o inválido." });
    }

    return res
      .status(401)
      .json({ error: "Error en autenticación. Intenta iniciar sesión nuevamente." });
  }
}
