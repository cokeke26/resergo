import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ===============================
// 📦 Importar rutas del sistema
// ===============================
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import recintosRoutes from "./routes/recintos.js";
import reservasRoutes from "./routes/reservas.routes.js";
import duenoRoutes from "./routes/dueno.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import canchasRoutes from "./routes/canchas.routes.js";
import duenoReservasRoutes from "./routes/dueno.reservas.routes.js";

// Rutas adicionales
import canchaDisponibilidadRoutes from "./routes/canchaDisponibilidad.routes.js";
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import solicitudesRoutes from "./routes/solicitudes.routes.js";

// ===============================
// 🆕 RUTA DE PAGOS (WEBPAY)
// ===============================
import pagosRoutes from "./routes/pagos.routes.js";

// ===============================
// ⚙️ Configuración inicial
// ===============================
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Manejo correcto de preflight en Express 5
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// ===============================
// 🧭 Registro de rutas
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recintos", recintosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/dueno", duenoRoutes);
app.use("/api/dueno", duenoReservasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/canchas", canchasRoutes);

app.use("/api", canchaDisponibilidadRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);

// ===============================
// 🆕 Registro de Pagos (Webpay)
// ===============================
app.use("/api/pagos", pagosRoutes);

// ===============================
// 🧪 Ruta base de prueba
// ===============================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    msg: "✅ API funcionando correctamente en ReserGO Backend",
  });
});

// ===============================
// 🚀 Servidor HTTP
// ===============================
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 Servidor iniciado en: http://localhost:${port}`);
});

