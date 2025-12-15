<template>
  <div class="panel-container">

    <!-- Tarjeta principal -->
    <div class="panel-card">

      <div class="header">
        <h2>🏠 Panel de Dueño</h2>
        <button class="btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </div>

      <!-- Acciones principales -->
      <div class="acciones">
        <button @click="cargarRecintos" class="btn azul">
          📋 Ver mis recintos
        </button>

        <button @click="crearRecinto" class="btn verde">
          ➕ Crear nuevo recinto
        </button>

        <button class="btn morado" @click="irAReservasDueno">
          📅 Ver reservas de mis recintos
        </button>
      </div>

      <!-- Lista de recintos -->
      <div v-if="recintos.length" class="lista">
        <h3>🏟️ Mis recintos</h3>

        <ul class="recinto-lista">
          <li v-for="r in recintos" :key="r.id" class="recinto-item">
            <div class="icon">🏟️</div>
            <div>
              <strong>{{ r.nombre }}</strong>
              <p class="sub">Admin: {{ r.admin?.nombre || "Sin asignar" }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p v-else class="no-recintos">Aún no tienes recintos creados.</p>

    </div>

  </div>
</template>

<script setup>
import axios from "../axios.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { logout } from "../stores/useAuth.js";

const router = useRouter();
const recintos = ref([]);

async function cargarRecintos() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login-dueno");

    const res = await axios.get("http://localhost:4000/api/dueno/recintos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    recintos.value = res.data;
  } catch (err) {
    console.error("Error al cargar recintos:", err);
    if (err.response?.status === 401) {
      logout();
      router.push("/login-dueno");
    }
  }
}

function crearRecinto() {
  router.push("/dueno/crear-recinto");
}

function irAReservasDueno() {
  router.push("/panel-dueno/reservas");
}

function cerrarSesion() {
  logout();
  router.push("/login-dueno");
}

onMounted(() => {
  cargarRecintos();
});
</script>

<style scoped>
/* ========================
   CONTENEDOR GENERAL
   ======================== */
.panel-container {
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

/* ========================
   TARJETA PRINCIPAL
   ======================== */
.panel-card {
  width: 500px;
  background: #ffffff;
  padding: 35px;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========================
   HEADER
   ======================== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e3a8a;
}

.btn-logout {
  background: #dc2626;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-logout:hover {
  background: #b91c1c;
}

/* ========================
   ACCIONES (BOTONES)
   ======================== */
.acciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  transition: 0.2s ease;
}

.btn:hover {
  transform: scale(1.03);
}

.azul { background: #2563eb; }
.azul:hover { background: #1d4ed8; }

.verde { background: #16a34a; }
.verde:hover { background: #15803d; }

.morado { background: #7c3aed; }
.morado:hover { background: #5b21b6; }

/* ========================
   LISTA DE RECINTOS
   ======================== */
.lista h3 {
  color: #1f2937;
  font-size: 1.3rem;
  margin-bottom: 12px;
  font-weight: 700;
}

.recinto-lista {
  list-style: none;
  padding: 0;
}

.recinto-item {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f9fafb;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.recinto-item .icon {
  font-size: 1.5rem;
}

.recinto-item .sub {
  font-size: 0.85rem;
  color: #6b7280;
}

.no-recintos {
  color: #666;
  margin-top: 10px;
  font-style: italic;
}
</style>
