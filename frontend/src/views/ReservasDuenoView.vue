<template>
  <div class="reservas-dueno">

    <h1 class="titulo">📅 Reservas por Recinto</h1>
    <p class="subtitulo">
      Selecciona un recinto para ver las reservas asociadas.
    </p>

    <!-- 🔥 LAYOUT DE 2 COLUMNAS -->
    <div class="layout">

      <!-- ╔══════════════════╗ -->
      <!--   LISTA DE RECINTOS -->
      <!-- ╚══════════════════╝ -->
      <div class="col recintos-container">
        <div
          class="recinto-card"
          v-for="r in recintos"
          :key="r.id"
          @click="toggleRecinto(r.id)"
          :class="{ activo: recintoSeleccionado === r.id }"
        >
          <h3>{{ r.nombre }}</h3>
          <p class="ubicacion">📍 {{ r.ubicacion }}</p>
          <p class="admin">👤 Admin: {{ r.admin?.nombre }}</p>

          <button class="btn-ver">
            {{ recintoSeleccionado === r.id ? "Ocultar" : "Ver reservas" }}
          </button>
        </div>
      </div>

      <!-- ╔══════════════════╗ -->
      <!--     RESERVAS + BUSCADOR -->
      <!-- ╚══════════════════╝ -->
      <div class="col reservas-col">

        <!-- Solo mostramos si hay un recinto seleccionado -->
        <div v-if="recintoSeleccionado">

          <!-- 🔍 BUSCADOR -->
          <input
            type="text"
            v-model="busqueda"
            class="buscador"
            placeholder="🔍 Buscar por cliente, cancha, tipo o fecha..."
          />

          <h2 class="titulo-secundario">📌 Reservas de "{{ nombreRecinto }}"</h2>

          <!-- LISTA FILTRADA -->
          <div
            class="reserva-card"
            v-for="res in reservasFiltradas"
            :key="res.id"
          >
            <h3>{{ res.recinto.nombre }}</h3>
            <p><strong>Cancha:</strong> {{ res.Cancha.nombre }} ({{ res.Cancha.tipo }})</p>
            <p><strong>Fecha:</strong> {{ res.fecha }}</p>
            <p><strong>Horario:</strong> {{ res.horaInicio }} - {{ res.horaFin }}</p>
            <p><strong>Cliente:</strong> {{ res.Usuario.nombre }} — {{ res.Usuario.email }}</p>
          </div>

          <!-- SIN RESULTADOS -->
          <div
            v-if="reservasFiltradas.length === 0"
            class="no-reservas"
          >
            No se encontraron reservas con ese filtro.
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import axios from "../axios.js";
import { ref, onMounted, computed } from "vue";

const recintos = ref([]);
const reservas = ref([]);
const recintoSeleccionado = ref(null);
const nombreRecinto = ref("");
const busqueda = ref("");

// Cargar recintos del dueño
async function cargarRecintos() {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:4000/api/dueno/recintos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    recintos.value = res.data;
  } catch (err) {
    console.error("❌ Error al cargar recintos", err);
  }
}

// Al hacer click en un recinto
async function toggleRecinto(id) {
  if (recintoSeleccionado.value === id) {
    recintoSeleccionado.value = null;
    reservas.value = [];
    return;
  }

  recintoSeleccionado.value = id;

  const recinto = recintos.value.find(r => r.id === id);
  nombreRecinto.value = recinto?.nombre || "";

  await cargarReservasRecinto(id);
}

// Cargar reservas del recinto seleccionado
async function cargarReservasRecinto(recintoId) {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `http://localhost:4000/api/dueno/reservas/${recintoId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    reservas.value = res.data;
  } catch (err) {
    console.error("❌ Error al cargar reservas", err);
  }
}

// 🔎 FILTRO DE BÚSQUEDA EN VIVO
const reservasFiltradas = computed(() => {
  if (!busqueda.value.trim()) return reservas.value;

  const q = busqueda.value.toLowerCase();

  return reservas.value.filter(r =>
    r.Usuario.nombre.toLowerCase().includes(q) ||
    r.Usuario.email.toLowerCase().includes(q) ||
    r.Cancha.nombre.toLowerCase().includes(q) ||
    r.Cancha.tipo.toLowerCase().includes(q) ||
    r.fecha.includes(q)
  );
});

onMounted(() => {
  cargarRecintos();
});
</script>

<style scoped>
/* --- TITULOS --- */
.titulo {
  text-align: center;
  margin-top: 20px;
  font-size: 2rem;
  font-weight: 800;
}

.subtitulo {
  text-align: center;
  margin-bottom: 25px;
  color: #555;
}

/* --- LAYOUT 2 COLUMNAS --- */
.layout {
  display: flex;
  gap: 25px;
  max-width: 1200px;
  margin: auto;
}

.col {
  flex: 1;
}

/* --- TARJETAS DE RECINTOS --- */
.recinto-card {
  background: white;
  padding: 18px;
  margin-bottom: 14px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: 0.2s;
  border-left: 5px solid transparent;
}

.recinto-card:hover {
  transform: scale(1.02);
}

.recinto-card.activo {
  border-left: 5px solid #2563eb;
  background: #f0f5ff;
}

.btn-ver {
  margin-top: 10px;
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}

.btn-ver:hover {
  background: #1e3a8a;
}

/* --- COLUMNA DERECHA: RESERVAS --- */
.reservas-col {
  padding-top: 5px;
}

/* --- BUSCADOR --- */
.buscador {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d3d9e0;
  background: #ffffff !important;   /* fondo blanco */
  color: #000 !important;           /* texto negro */
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: 0.25s ease;
}

.buscador::placeholder {
  color: #888 !important;   /* placeholder gris */
}

.buscador:focus {
  border-color: #32b2e4;    /* celeste dueño */
  box-shadow: 0 0 6px rgba(50,178,228,0.45);
  outline: none;
}

/* --- TARJETA RESERVA --- */
.reserva-card {
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-in-out;
}

/* --- ANIMACIÓN --- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.no-reservas {
  text-align: center;
  color: #777;
  font-style: italic;
}
</style>
