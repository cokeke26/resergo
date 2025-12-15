// controllers/admin.controller.js
import { prisma } from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔹 Generar token
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

/* ============================================================
   ✅ Registrar un nuevo administrador
============================================================ */
export async function registerAdmin(req, res) {
  try {
    const { nombre, apellido, email, password, telefono } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    const admin = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password: hash,
        telefono: telefono || "",
        rol: "admin",
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

    const token = signToken(admin);

    res.status(201).json({
      msg: "Administrador creado correctamente ✅",
      user: admin,
      token,
    });
  } catch (error) {
    console.error("❌ Error en registerAdmin:", error);
    res.status(500).json({ error: "Error al registrar administrador" });
  }
}

/* ============================================================
   ✅ Listar RECINTOS del ADMIN
============================================================ */
export async function listarRecintosAdmin(req, res) {
  try {
    const adminId = req.user.id;

    const recintos = await prisma.recinto.findMany({
      where: { adminId },
      include: {
        dueno: { select: { nombre: true, apellido: true, email: true } },
        canchas: { select: { id: true, nombre: true, tipo: true } },
      },
    });

    res.json(recintos);
  } catch (error) {
    console.error("❌ Error al listar recintos del admin:", error);
    res.status(500).json({ error: "Error al listar recintos del admin" });
  }
}

/* ============================================================
   ✅ Listar reservas de los recintos administrados por el ADMIN
   ⭐ — AQUÍ ESTABA EL PROBLEMA
============================================================ */
export async function listarReservasAdmin(req, res) {
  try {
    const adminId = req.user.id;

    const reservas = await prisma.reserva.findMany({
      where: {
        Cancha: {
          recinto: {
            adminId: adminId,
          },
        },
      },
      include: {
        Usuario: { select: { nombre: true, apellido: true, email: true } },
        Cancha: { select: { nombre: true, tipo: true, recintoId: true } },

        // ⭐ ESTO FALTABA — Ahora sí manda la ubicación, nombre y descripción
        recinto: {
          select: {
            nombre: true,
            ubicacion: true,
            descripcion: true,
          },
        },
      },
      orderBy: [
        { fecha: "desc" },
        { horaInicio: "desc" },
      ],
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al listar reservas del admin:", error);
    res.status(500).json({
      error: "Error al listar reservas del admin",
      detalle: error.message,
    });
  }
}

/* ============================================================
   ✅ Listar TODOS los recintos (solo super admin)
============================================================ */
export async function listarTodosRecintos(req, res) {
  try {
    const recintos = await prisma.recinto.findMany({
      include: {
        dueno: { select: { nombre: true, apellido: true, email: true } },
        admin: { select: { nombre: true, apellido: true, email: true } },
        canchas: true,
      },
    });

    res.json(recintos);
  } catch (error) {
    console.error("❌ Error al listar todos los recintos:", error);
    res.status(500).json({ error: "Error al listar todos los recintos" });
  }
}

/* ============================================================
   ✅ ADMIN agregar canchas al recinto
============================================================ */
export async function agregarCanchas(req, res) {
  try {
    const { recintoId } = req.params;
    const { tipo, cantidad = 1 } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: "Debe indicar tipo de cancha" });
    }

    const recinto = await prisma.recinto.findUnique({
      where: { id: Number(recintoId) },
    });

    if (!recinto) {
      return res.status(404).json({ error: "Recinto no encontrado" });
    }

    const existentes = await prisma.cancha.count({
      where: { recintoId: Number(recintoId), tipo: String(tipo) },
    });

    for (let i = 1; i <= Number(cantidad); i++) {
      await prisma.cancha.create({
        data: {
          nombre: `${tipo} ${existentes + i}`,
          tipo: String(tipo),
          recintoId: Number(recintoId),
        },
      });
    }

    const canchas = await prisma.cancha.findMany({
      where: { recintoId: Number(recintoId) },
    });

    res.json({
      msg: "✅ Canchas agregadas correctamente",
      canchas,
    });
  } catch (error) {
    console.error("❌ Error al agregar canchas:", error);
    res.status(500).json({
      error: "Error al agregar canchas",
      detalle: error.message,
    });
  }
}
