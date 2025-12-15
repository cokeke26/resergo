<template>
  <div class="admin-solicitudes">
    <h2>🔁 Solicitudes de Cambio de Hora</h2>

    <div v-if="solicitudes.length === 0" class="no-solicitudes">
      <p>No hay solicitudes pendientes por ahora.</p>
    </div>

    <div v-else class="lista-solicitudes">
      <div v-for="s in solicitudes" :key="s.id" class="solicitud-card">
        <h3>🏟️ {{ s.cancha?.nombre || "Cancha desconocida" }}</h3>

        <div class="fila">
          <span class="etq">👤 Cliente</span>
          <span class="val">{{ s.usuario?.nombre || "Usuario" }}</span>
        </div>

        <div class="fila">
          <span class="etq">📅 Fecha actual</span>
          <span class="val">{{ s.reserva?.fecha || "—" }}</span>
        </div>

        <div class="fila">
          <span class="etq">🕓 Horario actual</span>
          <span class="val">
            {{ s.reserva?.horaInicio }} - {{ s.reserva?.horaFin }}
          </span>
        </div>

        <div class="fila">
          <span class="etq">📅 Nueva fecha</span>
          <span class="val">{{ s.nuevaFecha || "—" }}</span>
        </div>

        <div class="fila">
          <span class="etq">🕓 Nuevo horario</span>
          <span class="val">
            {{ s.nuevaHoraInicio || "—" }} - {{ s.nuevaHoraFin || "—" }}
          </span>
        </div>

        <div class="acciones">
          <button class="btn-aceptar" @click="responder(s.id, 'aceptada')">
            ✅ Aceptar
          </button>
          <button class="btn-rechazar" @click="responder(s.id, 'rechazada')">
            ❌ Rechazar
          </button>
        </div>
      </div>
    </div>

    <p v-if="mensaje" :class="{ exito: exito, error: !exito }">
      {{ mensaje }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/axios.js";

const solicitudes = ref([]);
const mensaje = ref("");
const exito = ref(false);

// 🧩 Cargar solicitudes pendientes
async function cargarSolicitudes() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:4000/api/solicitudes/pendientes", {
      headers: { Authorization: `Bearer ${token}` },
    });

    solicitudes.value = res.data || [];
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
  }
}

// ⚙️ Aceptar o rechazar
async function responder(id, accion) {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:4000/api/solicitudes/${id}/responder`,
      { estado: accion },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    mensaje.value =
      accion === "aceptada"
        ? "✅ Solicitud aceptada correctamente"
        : "❌ Solicitud rechazada correctamente";
    exito.value = true;

    // Recargar lista después de respuesta
    await cargarSolicitudes();
  } catch (error) {
    console.error("Error al responder solicitud:", error);
    mensaje.value = "❌ Error al actualizar solicitud";
    exito.value = false;
  }
}

onMounted(cargarSolicitudes);
</script>

<style scoped>
.admin-solicitudes {
  text-align: center;
  margin-top: 60px;
  color: #222;
}

h2 {
  color: #2b5eff;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 25px;
}

.no-solicitudes {
  background: #f1f5ff;
  padding: 18px;
  border-radius: 10px;
  color: #333;
  width: 60%;
  margin: 20px auto;
  font-size: 1.1rem;
}

.lista-solicitudes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  margin-top: 25px;
}

.solicitud-card {
  background: #ffffff;
  border: 1px solid #cfd8dc;
  border-radius: 14px;
  padding: 20px 25px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  text-align: left;
}

.solicitud-card h3 {
  color: #007bff;
  margin-bottom: 12px;
  font-size: 1.25rem;
}

.fila {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed #e6eaee;
}

.fila:last-of-type {
  border-bottom: none;
}

.etq {
  color: #556;
  font-weight: 600;
}

.val {
  color: #111;
}

.acciones {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.btn-aceptar,
.btn-rechazar {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  transition: background 0.2s ease;
}

.btn-aceptar {
  background: #28a745;
}
.btn-aceptar:hover {
  background: #1f8a3b;
}

.btn-rechazar {
  background: #dc3545;
}
.btn-rechazar:hover {
  background: #b52a37;
}

.exito {
  color: green;
  margin-top: 10px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
