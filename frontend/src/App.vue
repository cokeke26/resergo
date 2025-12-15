<template>
  <div id="app">
    <!-- ===========================
         NO MOSTRAR NAVBAR
         en páginas especiales Webpay:
         /webpay/retorno  y  /resultado
    ============================ -->
    <template v-if="!esWebpay">
      <!-- 🔹 Navbar para usuario normal -->
      <NavbarUsuario v-if="user?.rol === 'usuario' || user?.rol === 'cliente'" />

      <!-- 🔹 Navbar para administrador -->
      <NavbarAdmin v-else-if="user?.rol === 'admin'" />

      <!-- 🔹 Navbar para dueño -->
      <NavbarDueno
        v-else-if="user?.rol?.toLowerCase() === 'dueno' || user?.rol?.toLowerCase() === 'dueño'"
      />

      <!-- 🔹 Navbar visitante -->
      <NavbarGuest v-else />
    </template>

    <!-- Vista dinámica -->
    <router-view />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import { user } from "./stores/useAuth.js";
import NavbarUsuario from "./components/NavbarUsuario.vue";
import NavbarAdmin from "./components/NavbarAdmin.vue";
import NavbarDueno from "./components/NavbarDueno.vue";
import NavbarGuest from "./components/NavbarGuest.vue";

const route = useRoute();

/* ==========================================
   RUTAS QUE NO DEBEN MOSTRAR NAVBAR:
   - /webpay/retorno (callback de Transbank)
   - /resultado (voucher simple)
=========================================== */
const esWebpay = computed(() => {
  const r = route.path;
  return r.includes("/webpay/retorno") || r.includes("/resultado");
});
</script>

<style>
body {
  font-family: "Inter", sans-serif;
  background-color: #ffffff; /* Blanco puro */
  color: #212529;
}
</style>
