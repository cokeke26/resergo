import pkg from "transbank-sdk";
const { WebpayPlus, Options, Environment } = pkg;

import { prisma } from "../prisma.js";

// =========================================
// CONFIGURACIÓN TRANSBANK (INTEGRACIÓN)
// =========================================
const commerceCode = "597055555532";
const apiKey = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";

const tx = new WebpayPlus.Transaction(
  new Options(commerceCode, apiKey, Environment.Integration)
);

// =========================================
// 1) CREAR TRANSACCIÓN
// =========================================
export const crearPago = async (req, res) => {
  try {
    const {
      recintoId,
      usuarioId,
      canchaId,
      slotId,
      precio,
      fecha,
      horaInicio,
      horaFin,
    } = req.body;

    // 🔥 Conversión crítica: Webpay NO acepta strings
    const monto = Number(precio);

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const buyOrder = "orden-" + Date.now();
    const sessionId = "usuario-" + usuarioId;
    const returnUrl = "http://localhost:5173/webpay/retorno";

    // Crear transacción Webpay
    const response = await tx.create(buyOrder, sessionId, monto, returnUrl);

    // Guardar temporalmente mientras se confirma el pago
    await prisma.pagoTemp.create({
      data: {
        buyOrder,
        usuarioId,
        recintoId,
        canchaId,
        slotId,
        precio: monto, // 🔥 guardamos el monto como número
        fecha,
        horaInicio,
        horaFin,
      },
    });

    res.json({
      url: response.url,
      token: response.token,
    });

  } catch (error) {
    console.error("❌ Error creando transacción:", error);
    res.status(500).json({ error: "Error creando transacción" });
  }
};

// =========================================
// 2) CONFIRMAR TRANSACCIÓN
// =========================================
export const confirmarPago = async (req, res) => {
  try {
    const { token_ws } = req.query;

    const result = await tx.commit(token_ws);

    const temp = await prisma.pagoTemp.findUnique({
      where: { buyOrder: result.buy_order },
    });

    if (!temp) {
      console.error("⚠ No se encontró pago temporal para:", result.buy_order);
      return res.redirect("http://localhost:5173/resultado?estado=error");
    }

    // ⛔ Pago rechazado
    if (result.response_code !== 0) {
      return res.redirect("http://localhost:5173/resultado?estado=rechazado");
    }

    // 🟢 Pago aprobado → crear la reserva real
    await prisma.reserva.create({
      data: {
        recintoId: temp.recintoId,
        usuarioId: temp.usuarioId,
        canchaId: temp.canchaId,
        slotId: temp.slotId,
        fecha: temp.fecha,
        horaInicio: temp.horaInicio,
        horaFin: temp.horaFin,
        precio: temp.precio,
      },
    });

    // Cambiar slot a ocupado
   // Cambiar el slot a ocupado
await prisma.canchaSlot.update({
  where: { id: temp.slotId },
  data: { estado: "ocupado" },
});


    return res.redirect("http://localhost:5173/resultado?estado=ok");

  } catch (error) {
    console.error("❌ Error confirmando pago:", error);
    return res.redirect("http://localhost:5173/resultado?estado=error");
  }
};
