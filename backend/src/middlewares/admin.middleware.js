// src/middlewares/admin.middleware.js

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso permitido solo a administradores." });
  }
  next();
}
