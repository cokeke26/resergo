<template>
  <div class="container">
    <div class="card">

      <h1 class="titulo">
        🗓️ Disponibilidad — Cancha {{ canchaId }}
      </h1>

      <!-- Selector de mes y año -->
      <div class="filtros">
        <div class="campo">
          <label>Mes</label>
          <select v-model="mesSeleccionado" @change="cargarDisponibilidad">
            <option v-for="(m, i) in meses" :key="i" :value="i">
              {{ m }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Año</label>
          <select v-model="anioSeleccionado" @change="cargarDisponibilidad">
            <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
      </div>

      <!-- Lista de días -->
      <div class="dias">
        <div
          v-for="dia in diasDelMes"
          :key="dia.fecha"
          class="dia-card"
          :class="{ bloqueado: dia.bloqueado }"
          @click="abrirModal(dia)"
        >
          <div class="dia-num">{{ dia.numero }}</div>

          <div class="estado">
            <span v-if="dia.bloqueado" class="badge badge-red">❌ Bloqueado</span>
            <span v-else class="badge badge-green">✅ Disponible</span>
          </div>
        </div>
      </div>

      <button class="btn-guardar" @click="guardar">
        💾 Guardar Cambios del Mes
      </button>

      <p class="msg exito" v-if="mensaje">{{ mensaje }}</p>
      <p class="msg error" v-if="error">{{ error }}</p>

    </div>

    <!-- 🔥 MODAL -->
    <div v-if="modalAbierto" class="modal-fondo" @click.self="cerrarModal">
      <div class="modal-box">
        <h3>⚙ Bloqueo — {{ diaSeleccionado?.fecha }}</h3>

        <label class="opcion">
          <input type="radio" value="dia" v-model="tipoBloqueo">
          Bloquear día completo
        </label>

        <label class="opcion">
          <input type="radio" value="horas" v-model="tipoBloqueo">
          Bloquear por horas
        </label>

        <!-- HORAS -->
        <div v-if="tipoBloqueo === 'horas'" class="horas-box">
          <label>Hora inicio:</label>
          <input type="time" class="hora-pick" v-model="horaInicio" step="3600">

          <label>Hora fin:</label>
          <input type="time" class="hora-pick" v-model="horaFin" step="3600">
        </div>

        <div class="acciones">
          <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
          <button class="btn-guardar2" @click="aplicarBloqueo">Aplicar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "../axios.js";

const route = useRoute();
const canchaId = route.params.id;
const token = localStorage.getItem("token");

const meses = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const anioActual = new Date().getFullYear();
const anios = [anioActual, anioActual + 1];

const mesSeleccionado = ref(new Date().getMonth());
const anioSeleccionado = ref(anioActual);

const diasDelMes = ref([]);
const mensaje = ref("");
const error = ref("");

// Modal
const modalAbierto = ref(false);
const diaSeleccionado = ref(null);
const tipoBloqueo = ref("dia");
const horaInicio = ref("");
const horaFin = ref("");

/* ============================================================
   🔹 Generar días del mes
============================================================ */
function generarDiasMes() {
  const diasEnMes = new Date(
    anioSeleccionado.value,
    mesSeleccionado.value + 1,
    0
  ).getDate();

  diasDelMes.value = Array.from({ length: diasEnMes }, (_, i) => ({
    numero: i + 1,
    fecha: `${anioSeleccionado.value}-${String(mesSeleccionado.value + 1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`,
    bloqueado: false,
    tipoBloqueo: "dia",
    horaInicio: null,
    horaFin: null
  }));
}

/* ============================================================
   🔹 Cargar slots desde backend e interpretar el día
============================================================ */
async function cargarDisponibilidad() {
  generarDiasMes();

  try {
    const mesStr = `${anioSeleccionado.value}-${String(mesSeleccionado.value+1).padStart(2,"0")}`;

    const res = await axios.get(
      `http://localhost:4000/api/canchas/${canchaId}/disponibilidad?mes=${mesStr}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const slots = res.data;

    for (const dia of diasDelMes.value) {
      const slotsDia = slots.filter(s => s.fecha === dia.fecha);
      if (slotsDia.length === 0) continue;

      const todosBloqueados = slotsDia.every(s => s.estado === "bloqueado");
      const algunoBloqueado = slotsDia.some(s => s.estado === "bloqueado");

      if (todosBloqueados) {
        dia.bloqueado = true;
        dia.tipoBloqueo = "dia";
        dia.horaInicio = null;
        dia.horaFin = null;
      } 
      else if (algunoBloqueado) {
        const bloqueados = slotsDia.filter(s => s.estado === "bloqueado");

        dia.bloqueado = true;
        dia.tipoBloqueo = "horas";

        dia.horaInicio = bloqueados[0].bloqueadoDesde || bloqueados[0].horaInicio;
        dia.horaFin = bloqueados[bloqueados.length - 1].bloqueadoHasta || 
                      bloqueados[bloqueados.length - 1].horaFin;
      } 
      else {
        dia.bloqueado = false;
        dia.tipoBloqueo = "dia";
        dia.horaInicio = null;
        dia.horaFin = null;
      }
    }

  } catch (err) {
    console.error("Error cargando disponibilidad", err);
  }
}

/* ============================================================
   🔹 Modal
============================================================ */
function abrirModal(dia) {
  diaSeleccionado.value = dia;

  tipoBloqueo.value = dia.bloqueado ? dia.tipoBloqueo : "dia";
  horaInicio.value = dia.horaInicio || "";
  horaFin.value = dia.horaFin || "";

  modalAbierto.value = true;
}

function cerrarModal() {
  modalAbierto.value = false;
  horaInicio.value = "";
  horaFin.value = "";
}

/* ============================================================
   🔹 Aplicar bloqueo a nivel frontend (no guarda aún)
============================================================ */
function aplicarBloqueo() {
  if (!diaSeleccionado.value) return;

  diaSeleccionado.value.bloqueado = true;
  diaSeleccionado.value.tipoBloqueo = tipoBloqueo.value;

  if (tipoBloqueo.value === "horas") {
    diaSeleccionado.value.horaInicio = horaInicio.value;
    diaSeleccionado.value.horaFin = horaFin.value;
  } else {
    diaSeleccionado.value.horaInicio = null;
    diaSeleccionado.value.horaFin = null;
  }

  cerrarModal();
}

/* ============================================================
   🔹 Guardar en backend (día a día)
============================================================ */
async function guardar() {
  try {
    for (const d of diasDelMes.value) {
      await axios.post(
        `http://localhost:4000/api/canchas/${canchaId}/disponibilidad/dia`,
        {
          fecha: d.fecha,
          estado: d.bloqueado ? "bloqueado" : "disponible",
          tipoBloqueo: d.tipoBloqueo,
          horaInicio: d.horaInicio,
          horaFin: d.horaFin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    mensaje.value = "✅ Disponibilidad guardada correctamente.";
    error.value = "";

  } catch (err) {
    console.error("Error al guardar", err);
    error.value = "❌ Error al guardar disponibilidad.";
  }
}

onMounted(() => {
  cargarDisponibilidad();
});
</script>

<style scoped>
/* ===== CONTENEDOR GENERAL ===== */
.container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.card {
  background: #fff;
  padding: 35px;
  width: 95%;
  max-width: 1200px;
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.10);
  animation: fadeIn 0.3s ease-out;
}

/* ===== TÍTULO ===== */
.titulo {
  font-size: 2.3rem;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 800;
  color: #1e3a8a;
}

/* ===== SELECTORES ===== */
.filtros {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 35px;
}

/* ===== GRID ===== */
.dias {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 18px;
}

/* ===== CARTA DIA ===== */
.dia-card {
  background: #f3f6fc;
  padding: 20px;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}

.dia-card:hover {
  transform: translateY(-2px);
}

.dia-card.bloqueado {
  background: #ffe6e6;
  border: 2px solid #dc2626;
}

/* ===== BADGES ===== */
.badge {
  display: inline-block;
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-green {
  background: #d1fae5;
  color: #047857;
}

.badge-red {
  background: #fee2e2;
  color: #b91c1c;
}

/* ===== BOTÓN GUARDAR ===== */
.btn-guardar {
  width: 100%;
  padding: 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 10px;
}

.btn-guardar:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

/* ===== MENSAJES ===== */
.msg {
  text-align: center;
  margin-top: 18px;
  font-size: 1.1rem;
  font-weight: 600;
}

.exito {
  color: #059669;
}

.error {
  color: #dc2626;
}

/* ===== MODAL ===== */
.modal-fondo {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* por encima del navbar bootstrap */
}

.modal-box {
  background: white;
  padding: 25px;
  border-radius: 14px;
  width: 380px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  position: relative;
  z-index: 10000;
  display: block; /* fuerza sobre .modal de bootstrap */
}

.horas-box {
  margin-top: 10px;
  background: #eef3ff;
  padding: 10px;
  border-radius: 8px;
}

.opcion {
  display: block;
  margin: 6px 0;
}

.acciones {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-cancelar {
  background: #aaa;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-guardar2 {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-guardar2:hover {
  background: #1d4ed8;
}

/* ANIMACIÓN */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* ===== INPUTS DE HORARIO (MODAL) ===== */
.horas-box input[type="time"] {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccd2da;

  background: #ffffff !important;   /* fondo blanco */
  color: #000 !important;           /* texto negro */
  font-size: 1rem;

  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: 0.25s ease;
}

/* placeholder de reloj */
.horas-box input[type="time"]::placeholder {
  color: #888 !important;
}

/* efecto focus */
.horas-box input[type="time"]:focus {
  border-color: #2563eb;       /* azul admin */
  box-shadow: 0 0 6px rgba(37,99,235,0.35);
  outline: none;
}
</style>
