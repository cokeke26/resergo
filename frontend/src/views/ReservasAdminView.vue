<template>
  <div class="reservas-admin">
    
    <h2 class="titulo">📋 Reservas de tus Recintos</h2>

    <!-- 🔎 BUSCADOR SUPER PRO -->
    <div class="buscador-container">
      <input 
        v-model="busqueda"
        type="text"
        class="buscador"
        placeholder="🔎 Buscar por cliente, cancha, tipo, fecha, correo, recinto..."
      />
    </div>

    <!-- SIN RESULTADOS -->
    <div v-if="reservasFiltradas.length === 0" class="no-reservas">
      No hay reservas que coincidan con la búsqueda.
    </div>

    <!-- LISTA DE RESERVAS -->
    <div v-else class="lista">
      <div v-for="r in reservasFiltradas" :key="r.id" class="reserva-card">

        <h3>🏟️ {{ r.recinto?.nombre || r.Recinto?.nombre || "Recinto" }}</h3>

        <p><strong>📍 Ubicación:</strong> {{ r.recinto?.ubicacion || r.Recinto?.ubicacion || "—" }}</p>
        <p><strong>📝 Descripción:</strong> {{ r.recinto?.descripcion || r.Recinto?.descripcion || "Sin descripción" }}</p>

        <hr class="divider" />

        <p><strong>👤 Usuario:</strong> {{ r.Usuario?.nombre }} {{ r.Usuario?.apellido }}</p>
        <p><strong>📧 Correo:</strong> {{ r.Usuario?.email }}</p>

        <hr class="divider" />

        <p><strong>⚽ Tipo de cancha:</strong> {{ r.Cancha?.tipo }}</p>
        <p><strong>🏅 Cancha:</strong> {{ r.Cancha?.nombre }}</p>

        <hr class="divider" />

        <p><strong>📅 Fecha:</strong> {{ r.fecha }}</p>
        <p><strong>⏰ Horario:</strong> {{ r.horaInicio }} - {{ r.horaFin }}</p>

        <button class="btn-eliminar" @click="eliminarReserva(r.id)">
          ❌ Eliminar reserva
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../axios.js";

const reservas = ref([]);
const busqueda = ref("");

// Cargar reservas admin
onMounted(async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:4000/api/reservas/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });

    reservas.value = res.data || [];
  } catch (err) {
    console.error("❌ Error al cargar reservas del admin:", err);
  }
});

// 🔍 FILTRO EN TIEMPO REAL (VERSIÓN SEGURA)
const reservasFiltradas = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return reservas.value;

  return reservas.value.filter(r => {
    const usuarioNombre = `${r.Usuario?.nombre ?? ""} ${r.Usuario?.apellido ?? ""}`.toLowerCase();
    const usuarioEmail  = r.Usuario?.email?.toLowerCase() ?? "";
    const canchaNombre  = r.Cancha?.nombre?.toLowerCase() ?? "";
    const canchaTipo    = r.Cancha?.tipo?.toLowerCase() ?? "";
    const recintoNombre = (r.recinto?.nombre ?? r.Recinto?.nombre ?? "").toLowerCase();
    const fechaStr      = String(r.fecha ?? "").toLowerCase();

    return (
      usuarioNombre.includes(q) ||
      usuarioEmail.includes(q)  ||
      canchaNombre.includes(q)  ||
      canchaTipo.includes(q)    ||
      recintoNombre.includes(q) ||
      fechaStr.includes(q)
    );
  });
});

// Eliminar reserva
async function eliminarReserva(id) {
  if (!confirm("¿Seguro que deseas eliminar esta reserva?")) return;

  try {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:4000/api/reservas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    reservas.value = reservas.value.filter(r => r.id !== id);
    alert("✅ Reserva eliminada correctamente.");
  } catch (err) {
    console.error("❌ Error al eliminar reserva:", err);
    alert("No se pudo eliminar la reserva.");
  }
}
</script>

<style scoped>
.reservas-admin {
  max-width: 1200px;
  margin: 40px auto;
  padding: 10px;
}

/* TÍTULO */
.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 10px;
}

/* BUSCADOR PRO */
.buscador-container {
  text-align: center;
  margin-bottom: 25px;
}

.buscador {
  width: 70%;
  padding: 12px 18px;
  font-size: 1rem;
  border-radius: 10px;
  border: 2px solid #d1d5db;
  background: white;
  color: #000 !important;
  transition: 0.2s ease;
}

.buscador:focus {
  border-color: #2563eb;
  box-shadow: 0 0 6px #2563eb80;
  outline: none;
}

.buscador::placeholder {
  color: #888 !important;
}

/* SIN RESERVAS */
.no-reservas {
  text-align: center;
  padding: 18px;
  background: #eef4ff;
  border-radius: 10px;
  font-size: 1.1rem;
}

/* GRID DE TARJETAS */
.lista {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
}

/* TARJETA */
.reserva-card {
  background: white;
  padding: 22px;
  border-radius: 16px;
  width: 380px;
  box-shadow: 0 5px 14px rgba(0,0,0,0.08);
  border-left: 6px solid #1d4ed8;
  transition: 0.25s ease;
  animation: fadeIn 0.25s ease;
}

.reserva-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
}

.reserva-card h3 {
  font-size: 1.35rem;
  color: #1d4ed8;
  margin-bottom: 12px;
}

/* Divisiones */
.divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 14px 0;
}

.btn-eliminar {
  margin-top: 14px;
  padding: 10px 18px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-eliminar:hover {
  background: #b91c1c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
