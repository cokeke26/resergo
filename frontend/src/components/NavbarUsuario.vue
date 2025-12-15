<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm fixed-top py-3">
    <div class="container-fluid px-4 d-flex justify-content-between align-items-center">

      <!-- 🔵 Logo -->
      <a class="navbar-brand fw-bold text-primary" href="/">ReserGO</a>

      <div class="d-flex align-items-center gap-3" ref="navbarArea">

        <!-- 🔔 Campanita -->
        <Notificaciones ref="notiRef" />

        <!-- 📌 Navegación -->
        <router-link class="nav-link d-inline px-2" to="/">Inicio</router-link>
        <router-link class="nav-link d-inline px-2" to="/crear-reserva">Reservar</router-link>
        <router-link class="nav-link d-inline px-2" to="/mis-reservas">Mis Reservas</router-link>
        <router-link class="nav-link d-inline px-2" to="/profile">Perfil</router-link>

        <!-- 🔴 Logout -->
        <a href="#" class="nav-link d-inline text-danger px-2" @click="logout">Salir</a>

      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Notificaciones from "../components/Notificaciones.vue";

const notiRef = ref(null);

function handleClickOutside(e) {
  const notiBox = notiRef.value?.$el;
  if (!notiBox) return;

  if (notiBox.contains(e.target)) return; // si clic está dentro → NO cerrar

  notiRef.value?.cerrar?.();
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRol");
  localStorage.removeItem("usuario");
  localStorage.removeItem("user");

  window.location.reload();
  window.location.href = "/login-usuario";
};
</script>

<style scoped>
.nav-link {
  font-weight: 500;
  cursor: pointer;
}
</style>
