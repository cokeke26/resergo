<template>
  <div class="admin-panel flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-6">
    <div class="panel-card">
      
      <h1 class="panel-title">
        👋 Bienvenido Administrador
      </h1>

      <p class="panel-desc">
        Selecciona una opción para gestionar el sistema ReserGO.
      </p>

      <div class="options-grid">
        
        <!-- 📋 Ver Reservas -->
        <button
          class="option-item blue"
          @click="$router.push('/admin/reservas')"
        >
          📋 <span>Ver Reservas</span>
        </button>

        <!-- 🏟️ Gestionar Canchas -->
        <button
          class="option-item green"
          @click="$router.push('/panel-admin/canchas')"
        >
          🏟️ <span>Gestionar Canchas</span>
        </button>

        <!-- 🏢 Gestionar Recintos -->
        <button
          class="option-item purple"
          @click="$router.push('/panel-admin/recintos')"
        >
          🏢 <span>Gestionar Recintos</span>
        </button>

        <!-- 📬 Ver Solicitudes -->
        <button
          class="option-item yellow"
          @click="$router.push('/admin/solicitudes')"
        >
          📬 <span>Ver Solicitudes</span>
        </button>

        <!-- 🚪 Cerrar sesión -->
        <button
          class="option-item red"
          @click="logout"
        >
          🚪 <span>Cerrar Sesión</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { setUser } from '../stores/useAuth.js'

const router = useRouter()

function logout() {
  setUser(null)
  router.push('/login-admin')
}
</script>

<style scoped>
/* ---- ESTILO GLOBAL ---- */
.admin-panel {
  font-family: "Inter", sans-serif;
}

/* ---- CONTENEDOR PRINCIPAL ---- */
.panel-card {
  background: white;
  padding: 3rem 3.5rem;
  border-radius: 22px;
  max-width: 900px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12);
  animation: fadeIn 0.4s ease-out;
}

/* ---- TÍTULO ---- */
.panel-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f3a60;
  margin-bottom: 0.5rem;
}

/* ---- DESCRIPCIÓN ---- */
.panel-desc {
  color: #555;
  font-size: 1.15rem;
  margin-bottom: 2.5rem;
}

/* ---- GRID DE BOTONES ---- */
.options-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
}

/* ---- BOTONES ---- */
.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  font-size: 1.05rem;
  min-width: 240px;
  justify-content: center;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.2px;
}

.option-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

/* ---- COLORES ---- */
.blue   { background: #2563eb; } 
.blue:hover { background: #1d4ed8; }

.green  { background: #16a34a; }
.green:hover { background: #15803d; }

.purple { background: #7c3aed; }
.purple:hover { background: #6d28d9; }

.yellow { background: #eab308; color: #333; font-weight: 700; }
.yellow:hover { background: #ca8a04; }

.red    { background: #dc2626; }
.red:hover { background: #b91c1c; }

/* ---- ANIMACIONES ---- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
