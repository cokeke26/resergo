<template> 
  <div class="mis-reservas">
    <h2>🏟️ Mis Reservas</h2>

    <!-- 🔍 BUSCADOR PRO -->
    <input
      type="text"
      v-model="busqueda"
      class="buscador"
      placeholder="🔍 Buscar por fecha, cancha, tipo, cliente..."
    />

    <!-- Cuando no hay reservas -->
    <div v-if="reservasFiltradas.length === 0" class="no-reservas">
      <p>No se encontraron reservas.</p>
    </div>

    <!-- Lista de reservas filtradas -->
    <div class="lista-reservas">
      <div v-for="r in reservasFiltradas" :key="r.id" class="reserva-card">
        <h3>{{ r.recintoNombre }}</h3>

        <div class="fila">
          <span class="etq">📍 Dirección</span>
          <span class="val">{{ r.direccion || "No registrada" }}</span>
        </div>

        <div class="fila">
          <span class="etq">👤 Usuario</span>
          <span class="val">{{ r.usuarioNombre }}</span>
        </div>

        <div class="fila">
          <span class="etq">🏷️ Tipo de cancha</span>
          <span class="val">{{ r.tipoCancha }}</span>
        </div>

        <div class="fila">
          <span class="etq">🎯 Cancha</span>
          <span class="val">{{ r.canchaNombre }}</span>
        </div>

        <div class="fila">
          <span class="etq">📅 Fecha</span>
          <span class="val">{{ r.fechaBonita }}</span>
        </div>

        <div class="fila">
          <span class="etq">🕓 Horario</span>
          <span class="val">{{ r.horaInicio }} − {{ r.horaFin }}</span>
        </div>

        <div class="fila">
          <span class="etq">💰 Monto</span>
          <span class="val">{{ r.montoTexto }}</span>
        </div>

        <div class="recordatorio">
          🔔 Recuerda llegar <strong>5 minutos antes</strong> de tu horario.
        </div>

        <!-- 🔁 Botón cambio de hora -->
        <button class="btn-cambio" @click="abrirModal(r)">
          🔁 Solicitar cambio de hora
        </button>

        <!-- 🧾 Comprobante -->
        <button class="btn-comprobante" @click="descargarComprobante(r)">
          🧾 Comprobante de pago
        </button>

        <!-- 📍 Cómo llegar -->
        <button class="btn-ubicacion" @click="irUbicacion(r)">
          📍 Cómo llegar
        </button>

      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalAbierto" class="modal-fondo" @click.self="cerrarModal">
      <div class="modal-contenido">
        <h3>🔁 Solicitar cambio de hora</h3>

        <p>
          <strong>Cancha:</strong> {{ reservaSeleccionada?.canchaNombre }}<br />
          <strong>Fecha actual:</strong> {{ reservaSeleccionada?.fechaBonita }}<br />
          <strong>Horario actual:</strong>
          {{ reservaSeleccionada?.horaInicio }} - {{ reservaSeleccionada?.horaFin }}
        </p>

        <label>Nueva fecha:</label>
        <input type="date" v-model="form.nuevaFecha" class="campo" />

        <label>Nueva hora inicio:</label>
        <input type="time" v-model="form.nuevaHoraInicio" class="campo" />

        <label>Nueva hora fin:</label>
        <input type="time" v-model="form.nuevaHoraFin" class="campo" />

        <div class="acciones">
          <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
          <button class="btn-enviar" @click="enviarSolicitud">
            Enviar solicitud
          </button>
        </div>

        <p v-if="mensaje" :class="{ exito: exito, error: !exito }">
          {{ mensaje }}
        </p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../axios.js";
import { jsPDF } from "jspdf";

/* =======================================================
   ESTADOS
======================================================= */
const reservasRaw = ref([]);
const busqueda = ref("");

const modalAbierto = ref(false);
const reservaSeleccionada = ref(null);
const mensaje = ref("");
const exito = ref(false);

/* FORMULARIO SOLICITUD */
const form = ref({
  nuevaFecha: "",
  nuevaHoraInicio: "",
  nuevaHoraFin: "",
});

/* =======================================================
   FORMATOS
======================================================= */
const toFechaBonita = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const formatearPesos = (monto) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(monto || 0);

/* =======================================================
   NORMALIZAR RESERVAS
======================================================= */
const reservasNorm = computed(() =>
  reservasRaw.value.map((r) => {
    const nombre = r.Usuario?.nombre ?? "";
    const apellido = r.Usuario?.apellido ?? "";
    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return {
      id: r.id,
      usuarioNombre: nombreCompleto || "Usuario",
      tipoCancha: r.Cancha?.tipo || "—",
      canchaNombre: r.Cancha?.nombre || "—",
      canchaId: r.canchaId,
      recintoNombre: r.recinto?.nombre || "Recinto desconocido",
      fecha: r.fecha,
      fechaBonita: toFechaBonita(r.fecha),
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      precio: r.precio || 0,
      montoTexto: formatearPesos(r.precio),
      latitud: r.recinto?.latitud,
      longitud: r.recinto?.longitud,
      direccion: r.recinto?.direccion || r.recinto?.ubicacion || "No registrada",
    };
  })
);

/* =======================================================
   FILTRO
======================================================= */
const reservasFiltradas = computed(() => {
  if (!busqueda.value.trim()) return reservasNorm.value;
  const q = busqueda.value.toLowerCase();

  return reservasNorm.value.filter((r) =>
    r.usuarioNombre.toLowerCase().includes(q) ||
    r.canchaNombre.toLowerCase().includes(q) ||
    r.tipoCancha.toLowerCase().includes(q) ||
    r.recintoNombre.toLowerCase().includes(q) ||
    r.fechaBonita.includes(q) ||
    r.horaInicio.includes(q) ||
    r.horaFin.includes(q) ||
    (r.direccion || "").toLowerCase().includes(q)
  );
});

/* =======================================================
   CARGAR RESERVAS
======================================================= */
async function cargarReservas() {
  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `http://localhost:4000/api/reservas/usuario/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    reservasRaw.value = res.data || [];
  } catch (err) {
    console.error("Error:", err);
  }
}

/* =======================================================
   MODAL
======================================================= */
function abrirModal(reserva) {
  reservaSeleccionada.value = reserva;
  form.value = {
    nuevaFecha: reserva.fecha,
    nuevaHoraInicio: reserva.horaInicio,
    nuevaHoraFin: reserva.horaFin,
  };
  mensaje.value = "";
  exito.value = false;
  modalAbierto.value = true;
}

function cerrarModal() {
  modalAbierto.value = false;
}

/* =======================================================
   ENVIAR SOLICITUD DE CAMBIO — FIX RUTA CORRECTA
======================================================= */
async function enviarSolicitud() {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:4000/api/solicitudes/",   // ← ESTA ES LA RUTA REAL
      {
        reservaId: reservaSeleccionada.value.id,
        canchaId: reservaSeleccionada.value.canchaId,
        nuevaFecha: form.value.nuevaFecha,
        nuevaHoraInicio: form.value.nuevaHoraInicio,
        nuevaHoraFin: form.value.nuevaHoraFin,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    exito.value = true;
    mensaje.value = "Solicitud enviada correctamente ✔";
    setTimeout(() => cerrarModal(), 1500);
  } catch (err) {
    exito.value = false;
    mensaje.value = err?.response?.data?.error || "Error al enviar solicitud";
    console.error(err);
  }
}

/* =======================================================
   DESCARGAR COMPROBANTE — NO TÉCNICO
======================================================= */
function descargarComprobante(r) {
  const doc = new jsPDF();
  const ahora = new Date();

  const fechaEmision = ahora.toLocaleDateString("es-CL");
  const horaEmision = ahora.toLocaleTimeString("es-CL");

  const codigoReserva = `RES-${String(r.id).padStart(6, "0")}`;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ReserGO", 20, 20);

  doc.setFontSize(10);
  doc.text(`Emitido el: ${fechaEmision} ${horaEmision}`, 195, 20, {
    align: "right",
  });

  doc.setFontSize(14);
  doc.text("Comprobante de pago electrónico", 20, 35);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Estimado(a) ${r.usuarioNombre},`, 20, 50);
  doc.text("Confirmamos la realización del pago de tu reserva:", 20, 57);

  let y = 75;
  const salto = 8;
  const fila = (label, value) => {
    doc.setFont("Helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("Helvetica", "normal");
    doc.text(String(value || "—"), 80, y);
    y += salto;
  };

  const direccionFinal = r.direccion || r.ubicacion || "No registrada";

  fila("Código de reserva:", codigoReserva);
  fila("Recinto:", r.recintoNombre);
  fila("Dirección:", direccionFinal);
  fila("Cancha:", r.canchaNombre);
  fila("Tipo de cancha:", r.tipoCancha);
  fila("Fecha:", r.fechaBonita);
  fila("Horario:", `${r.horaInicio} – ${r.horaFin}`);
  fila("Monto pagado:", r.montoTexto);
  fila("Medio de pago:", "Webpay (Transbank)");
  fila("Estado del pago:", "Transacción realizada con éxito");

  doc.save(`comprobante_reserva_${r.id}.pdf`);
}

/* =======================================================
   GOOGLE MAPS
======================================================= */
function irUbicacion(r) {
  if (!r.latitud || !r.longitud) {
    alert("Este recinto no tiene coordenadas registradas.");
    return;
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${r.latitud},${r.longitud}`;
  window.open(url, "_blank");
}

/* =======================================================
   MOUNT
======================================================= */
onMounted(cargarReservas);
</script>
<style scoped>
.btn-ubicacion {
  margin-top: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  background: #ffffff;
  color: #2b5eff;
  border: 1px solid #2b5eff;
  transition: 0.2s;
}

.btn-ubicacion:hover {
  background: #eef3ff;
}

/* RESTO DE TUS ESTILOS ORIGINALES (NO TOCADOS) */
.mis-reservas {
  text-align: center;
  margin-top: 60px;
  color: #222;
}

h2 {
  color: #2b5eff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 25px;
}

.buscador {
  width: 60%;
  margin: 0 auto 25px;
  padding: 12px;
  background: #ffffff;
  border-radius: 12px;
  font-size: 1rem;
  border: 1px solid #d3d9e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  outline: none;
  transition: 0.2s;
  color: #000 !important;
}

.buscador:focus {
  border-color: #2b5eff;
  box-shadow: 0 0 6px rgba(43, 94, 255, 0.4);
}

.lista-reservas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.reserva-card {
  background: #ffffff;
  padding: 22px 26px;
  width: 380px;
  border-radius: 15px;
  border: 1px solid #e5e9f0;
  box-shadow: 0 8px 18px rgba(0,0,0,0.06);
  text-align: left;
  transition: 0.2s;
}

.reserva-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.reserva-card h3 {
  color: #1f4fd1;
  margin-bottom: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: capitalize;
}

.fila {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px dashed #e6eaf0;
}

.etq {
  color: #334;
  font-weight: 600;
}

.val {
  color: #111;
  font-weight: 500;
}

.recordatorio {
  margin-top: 14px;
  background: #fff8e6;
  border: 1px solid #ffe1a3;
  color: #7a5200;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.95rem;
}

.btn-cambio,
.btn-comprobante {
  margin-top: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  border: none;
  transition: 0.2s;
}

.btn-cambio {
  background: #2b5eff;
  color: #fff;
}

.btn-comprobante {
  background: #ffffff;
  color: #2b5eff;
  border: 1px solid #2b5eff;
}

/* Modal */
.modal-fondo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-contenido {
  background: #fff;
  padding: 25px 30px;
  border-radius: 14px;
  width: 360px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  text-align: left;
  animation: fadeIn 0.25s ease;
}

.campo {
  width: 100%;
  margin: 5px 0 12px;
  padding: 8px;
  border: 1px solid #ccd2da;
  border-radius: 6px;
  background: #fff;
  color: #111;
}

.acciones {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.btn-cancelar {
  background: #ccc;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
}

.btn-enviar {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
}
</style>
