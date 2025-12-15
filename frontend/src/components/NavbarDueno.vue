<template>
  <nav class="navbar navbar-expand-lg dueno-navbar shadow-sm fixed-top py-3">
    <div class="container-fluid px-4 d-flex justify-content-between align-items-center">

      <!-- Logo -->
      <a class="navbar-brand fw-bold dueno-logo" href="/panel-dueno">
        ReserGO Dueño
      </a>

      <div class="d-flex align-items-center gap-3" ref="navbarArea">

        <!-- 🔔 Campanita -->
        <Notificaciones ref="notiRef" />

        <!-- Links -->
        <router-link class="nav-link d-inline dueno-link px-2" to="/panel-dueno">Panel</router-link>
        <router-link class="nav-link d-inline dueno-link px-2" to="/dueno/crear-recinto">Crear Recinto</router-link>

        <!-- Logout -->
        <a href="#" class="nav-link d-inline text-danger px-2" @click="logout">Salir</a>

      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Notificaciones from "../components/Notificaciones.vue";
import { setUser } from "../stores/useAuth.js";

const notiRef = ref(null);

function handleClickOutside(e) {
  const notiBox = notiRef.value?.$el;
  if (!notiBox) return;
  if (notiBox.contains(e.target)) return;
  notiRef.value?.cerrar?.();
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));

const logout = () => {
  setUser(null);
  window.location.reload();
  window.location.href = "/login-dueno";
};
</script>

<style scoped>
/* ==== NAVBAR BLANCO ==== */
.dueno-navbar {
  background-color: #ffffff !important; /* blanco */
}

/* ==== LOGO CELESTE ==== */
.dueno-logo {
  color: #1aa5d8 !important; /* celeste bonito */
  font-size: 1.35rem;
}

/* ==== LINKS NEGROS ==== */
.dueno-link {
  color: #000 !important;
  font-weight: 500;
}

.dueno-link:hover {
  color: #1aa5d8 !important; /* hover celeste */
}

.nav-link {
  cursor: pointer;
}
</style>
