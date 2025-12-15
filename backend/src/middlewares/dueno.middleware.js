// src/middlewares/dueno.middleware.js
export function requireDueno(req, res, next) {
  if (!req.user || req.user.rol !== "dueño") {
    return res.status(403).json({ error: "Acceso permitido solo a dueños." });
  }
  next();
}