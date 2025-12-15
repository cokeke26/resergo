<template>
  <div class="noti-wrap" ref="wrapper">
    <!-- 🔔 Campana -->
    <button class="icono" @click.stop="toggle">
      🔔
      <span v-if="sinLeer > 0" class="badge">{{ sinLeer }}</span>
    </button>

    <!-- 📩 Panel -->
    <div v-if="open" class="lista" @click.stop>
      <div class="lista-header">
        <strong>Notificaciones</strong>
      </div>

      <p v-if="notificaciones.length === 0" class="vacio">
        No tienes notificaciones.
      </p>

      <ul v-else>
        <li
          v-for="n in notificaciones"
          :key="n.id"
          :class="['item', { leida: n.leida }]"
        >
          <div class="titulo">{{ n.titulo }}</div>
          <div class="mensaje">{{ n.mensaje }}</div>
          <div class="fecha">{{ formatFecha(n.fecha) }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

// ================================
// 🔥 FALTABA ESTO
// ================================
const open = ref(false);

function cerrar() {
  open.value = false;
}
defineExpose({ cerrar });

const notificaciones = ref([]);
const sinLeer = ref(0);
const wrapper = ref(null);

// ===============================
// 🔄 Cargar notificaciones
// ===============================
async function cargar() {
  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;

    const res = await axios.get(
      `http://localhost:4000/api/notificaciones/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    notificaciones.value = res.data || [];
    sinLeer.value = notificaciones.value.filter((n) => !n.leida).length;
  } catch (err) {
    console.error("Error cargando notificaciones:", err);
  }
}

// ================================
// 🟢 Marcar como leídas al abrir
// ================================
async function marcarTodasComoLeidas() {
  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:4000/api/notificaciones/marcar-todas/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    notificaciones.value = notificaciones.value.map((n) => ({
      ...n,
      leida: true,
    }));

    sinLeer.value = 0;
  } catch (err) {
    console.error("Error marcando como leídas:", err);
  }
}

// ================================
// 🟡 Abrir/cerrar campana
// ================================
async function toggle() {
  open.value = !open.value;
  if (open.value && sinLeer.value > 0) {
    await marcarTodasComoLeidas();
  }
}

// ================================
// ❌ Cerrar al hacer click fuera
// ================================
function cerrarSiClickFuera(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => {
  cargar();
  setInterval(cargar, 20000);
  document.addEventListener("click", cerrarSiClickFuera);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", cerrarSiClickFuera);
});

// ================================
// 🕒 Formato fecha
// ================================
function formatFecha(f) {
  return new Date(f).toLocaleString("es-CL");
}
</script>

<style scoped>
.noti-wrap {
  position: relative;
  display: inline-block;
}

.icono {
  position: relative;
  font-size: 1.4rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  border-radius: 50%;
  padding: 2px 6px;
  font-weight: bold;
}

.lista {
  position: absolute;
  right: 0;
  top: 36px;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  z-index: 200;
  padding: 10px;
  max-height: 350px;
  overflow-y: auto;
}

.lista-header {
  text-align: center;
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.item {
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.item.leida {
  opacity: 0.6;
}

.item:hover {
  background: #f9fafb;
}

.titulo {
  font-weight: 700;
}

.fecha {
  font-size: 0.8rem;
  color: gray;
}

.vacio {
  text-align: center;
  color: gray;
  padding: 20px 0;
}
</style>
