import { prisma } from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Función para firmar el token JWT
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

/**
 * Registro de usuario (cliente, admin o dueño)
 */
export async function register(req, res) {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario (rol dinámico)
    const user = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password: hash,
        telefono: telefono || "",
        rol: rol || "cliente", // 👈 permite definir "dueño", "admin" o "cliente"
        estado: "activo",
      },
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

    // Generar token
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (e) {
    console.error("❌ Error en registro:", e);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}

/**
 * Inicio de sesión
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Debe ingresar email y contraseña" });
    }

    // Buscar usuario
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar token seguro
    const safe = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      estado: user.estado,
    };

    const token = signToken(safe);

    res.json({ user: safe, token });
  } catch (e) {
    console.error("❌ Error en login:", e);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function me(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ user });
  } catch (e) {
    console.error("❌ Error en me():", e);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
}
