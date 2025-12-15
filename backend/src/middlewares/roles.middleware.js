// middlewares/roles.middleware.js

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ error: "Solo administradores" });
  }
  next();
}