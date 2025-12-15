<template>
  <nav class="navbar navbar-light bg-white fixed-top shadow-sm py-3">
    <div class="container-fluid px-4 d-flex justify-content-between align-items-center">

      <!-- Logo -->
      <a class="navbar-brand fw-bold admin-logo" href="/panel-admin">
        ReserGO Admin
      </a>

      <div class="d-flex align-items-center gap-3" ref="navbarArea">

        <!-- 🔔 Campanita -->
        <Notificaciones ref="notiRef" />

        <!-- Links -->
        <router-link class="nav-link d-inline text-dark px-2 link-admin" to="/panel-admin">Panel</router-link>
        <router-link class="nav-link d-inline text-dark px-2 link-admin" to="/admin/reservas">Reservas</router-link>
        <router-link class="nav-link d-inline text-dark px-2 link-admin" to="/admin/solicitudes">Solicitudes</router-link>
        <router-link class="nav-link d-inline text-dark px-2 link-admin" to="/panel-admin/canchas">Canchas</router-link>

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
  window.location.href = "/login-admin";
};
</script>

<style scoped>
/* LOGO VERDE */
.admin-logo {
  color: #1C9A43 !important;
  font-size: 1.35rem;
}

/* Links negros con hover verde */
.link-admin {
  color: #222 !important;
  font-weight: 500;
}

.link-admin:hover {
  color: #1C9A43 !important;
}

/* Mantiene estilo general */
.nav-link {
  cursor: pointer;
  font-weight: 500;
}
</style>
