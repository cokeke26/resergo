<script setup>
import { ref, onMounted } from "vue";
import axios from "../axios.js";

const recintos = ref([]);
const error = ref("");

async function cargarRecintos() {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:4000/api/admin/recintos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    recintos.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "❌ No se pudieron cargar los recintos asignados al administrador.";
  }
}

function irAGestionarCanchas(recintoId) {
  localStorage.setItem("recintoSeleccionado", recintoId);
  window.location.href = "/panel-admin/canchas";
}

onMounted(() => {
  cargarRecintos();
});
</script>

<template>
  <div class="recintos">

    <h1>🏟️ Gestión de Recintos</h1>
    <p class="subtitulo">
      Aquí puedes ver los recintos que administras y las canchas asociadas a cada uno.
    </p>

    <div v-if="error" class="error">{{ error }}</div>

    <!-- Si no hay recintos -->
    <div v-if="recintos.length === 0" class="no-data">
      No tienes recintos asignados por el momento.
    </div>

    <!-- Lista -->
    <div class="lista" v-else>

      <div class="card" v-for="r in recintos" :key="r.id">

        <h2>{{ r.nombre }}</h2>
        <p class="ubicacion">📍 {{ r.ubicacion }}</p>

        <p class="dueno">
          👤 Dueño: {{ r.dueno?.nombre }} {{ r.dueno?.apellido }}
        </p>

        <h3 class="titulo-canchas">Canchas del recinto:</h3>

        <ul v-if="r.canchas?.length">
          <li v-for="c in r.canchas" :key="c.id" class="cancha-item">
            ✔️ <strong>{{ c.nombre }}</strong> — {{ c.tipo }}
          </li>
        </ul>

        <p v-else class="no-canchas">No hay canchas registradas para este recinto.</p>

        <div class="acciones">

          <button class="btn" @click="irAGestionarCanchas(r.id)">
            🏟️ Gestionar Canchas
          </button>

          <button class="btn-sec">
            ✏️ Editar Recinto (opcional futuro)
          </button>

        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* ==========================
   CONTENEDOR PRINCIPAL
   ========================== */
.recintos {
  text-align: center;
  padding: 50px 20px;
  background: #ffffff;     /* FONDO BLANCO */
  min-height: 100vh;
}

/* ==========================
   TITULOS
   ========================== */
h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 5px;
}

.subtitulo {
  color: #555;
  margin-bottom: 35px;
  font-size: 1.1rem;
}

/* ==========================
   TARJETAS
   ========================== */
.lista {
  max-width: 850px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
  text-align: left;
  border-left: 6px solid #1d4ed8;
}

.card h2 {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1d4ed8;
}

.ubicacion {
  margin-bottom: 8px;
  color: #444;
}

.dueno {
  margin-bottom: 14px;
  color: #444;
}

/* ==========================
   LISTA DE CANCHAS
   ========================== */
.titulo-canchas {
  font-weight: 700;
  color: #222;
  margin-top: 15px;
  margin-bottom: 10px;
}

.cancha-item {
  margin-left: 10px;
  padding: 4px 0;
  font-size: 1rem;
  color: #222;
}

.no-canchas {
  color: #777;
  margin-left: 10px;
}

/* ==========================
   BOTONES
   ========================== */
.acciones {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  background: #2563eb;
  color: white;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn:hover {
  background: #1e3a8a;
  transform: scale(1.02);
}

.btn-sec {
  flex: 1;
  background: #e5e7eb;
  color: #333;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

/* ==========================
   MENSAJES
   ========================== */
.error {
  color: #dc2626;
  font-weight: bold;
}

.no-data {
  font-size: 1.1rem;
  color: #333;
  margin-top: 20px;
}
</style>
