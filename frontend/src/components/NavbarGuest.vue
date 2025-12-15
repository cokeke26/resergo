<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm fixed-top py-3">
    <div class="container-fluid px-4">
      <a class="navbar-brand fw-bold text-primary" href="/">ReserGO</a>

      <div>
        <!-- 🔹 Mostrar secciones generales solo si no estamos en login/registro -->
        <template v-if="!isAuthPage">
          <router-link class="nav-link d-inline px-2" to="/">Inicio</router-link>

          <!-- Botón Reservar que depende de login -->
          <a
            href="#"
            class="nav-link d-inline px-2"
            @click.prevent="handleReservar"
          >
            Reservar
          </a>

          <router-link class="nav-link d-inline px-2" to="/quienes-somos">
            Quiénes Somos
          </router-link>
          <router-link class="nav-link d-inline px-2" to="/contacto">
            Contacto
          </router-link>
        </template>

        <!-- 🔹 Botones de autenticación dinámicos -->
        <router-link
          v-if="!user"
          class="nav-link d-inline px-2 text-primary"
          :to="loginRoute"
        >
          Iniciar sesión
        </router-link>

        <router-link
          v-if="!user"
          class="nav-link d-inline px-2 text-success"
          :to="registerRoute"
        >
          Registrarse
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { user } from "../stores/useAuth.js";

const route = useRoute();
const router = useRouter();

// Detectar si estamos en login o registro
const isAuthPage = computed(() =>
  route.path.startsWith("/login") || route.path.startsWith("/register")
);

// 🔸 Detectar tipo de rol (admin, dueño, usuario)
const roleType = computed(() => {
  if (route.path.includes("admin")) return "admin";
  if (route.path.includes("dueno") || route.path.includes("dueño")) return "dueno";
  return "usuario"; // por defecto
});

// 🔹 Rutas dinámicas según el contexto
const loginRoute = computed(() => `/login-${roleType.value}`);
const registerRoute = computed(() => `/register-${roleType.value}`);

// 🔹 Lógica del botón “Reservar”
const handleReservar = () => {
  if (user.value) {
    router.push("/reservas");
  } else {
    router.push("/login-usuario");
  }
};
</script>

<style scoped>
.nav-link {
  font-weight: 500;
  cursor: pointer;
}
</style>


