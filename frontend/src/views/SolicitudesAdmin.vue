<template>
  <div class="solicitudes-admin">
    <h2>📬 Solicitudes de Cambio de Hora</h2>

    <div v-if="solicitudes.length === 0" class="no-solicitudes">
      No hay solicitudes pendientes por ahora.
    </div>

    <div v-else class="lista">
      <div v-for="s in solicitudes" :key="s.id" class="card-solicitud">
        <h3>{{ s.usuario.nombre }}</h3>
        <p><strong>Cancha:</strong> {{ s.cancha.nombre }}</p>
        <p><strong>Fecha actual:</strong> {{ s.reserva.fecha }}</p>
        <p><strong>Nueva fecha:</strong> {{ s.nuevaFecha }}</p>
        <p><strong>Horario nuevo:</strong> {{ s.nuevaHoraInicio }} - {{ s.nuevaHoraFin }}</p>
        <p>
          <strong>Estado:</strong>
          <span :class="['estado', s.estado]">{{ s.estado }}</span>
        </p>

        <div class="acciones" v-if="s.estado === 'pendiente'">
          <button @click="responder(s.id, 'aceptar')" class="btn aceptar">✅ Aceptar</button>
          <button @click="responder(s.id, 'rechazar')" class="btn rechazar">❌ Rechazar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../axios.js";

const solicitudes = ref([]);

async function cargarSolicitudes() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:4000/api/solicitudes/pendientes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    solicitudes.value = res.data || [];
  } catch (err) {
    console.error("Error al cargar solicitudes:", err);
  }
}

async function responder(id, accion) {
  try {
    const token = localStorage.getItem("token");
    if (!id || !accion) return console.warn("Datos faltantes");

    const res = await axios.put(
      `http://localhost:4000/api/solicitudes/${id}/responder`,
      { accion },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    solicitudes.value = solicitudes.value.filter((s) => s.id !== id);
    alert(res.data.msg || `Solicitud ${accion} correctamente`);
  } catch (err) {
    console.error("Error al responder solicitud:", err.response?.data || err);
    alert("❌ Error al procesar la solicitud.");
  }
}

onMounted(cargarSolicitudes);
</script>

<style scoped>
.solicitudes-admin {
  max-width: 700px;
  margin: 40px auto;
  text-align: center;
}

.no-solicitudes {
  background: #eef2ff;
  padding: 15px;
  border-radius: 10px;
  color: #333;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-solicitud {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: left;
}

h3 {
  color: #2b5eff;
  margin-bottom: 10px;
}

.estado {
  text-transform: capitalize;
  font-weight: 600;
}
.estado.pendiente {
  color: orange;
}
.estado.aceptada {
  color: green;
}
.estado.rechazada {
  color: red;
}

.acciones {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn.aceptar {
  background: #2ecc71;
  color: white;
}
.btn.rechazar {
  background: #e74c3c;
  color: white;
}
</style>
