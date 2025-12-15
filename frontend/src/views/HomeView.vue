<template>
  <div class="home-page">
    <!-- HERO SECTION -->
    <section class="hero text-center text-white d-flex align-items-center justify-content-center">
      <!-- 🎥 Video de fondo -->
      <video autoplay muted loop playsinline class="hero-video">
        <source src="/videos/reservas.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>

      <!-- 🔲 Capa oscura -->
      <div class="overlay"></div>

      <!-- 🔹 Contenido centrado -->
      <div class="container position-relative z-1">
        <h1 class="fw-bold display-4">Reserva tu cancha fácil y rápido con ReserGO</h1>
        <p class="lead mb-4">
          Encuentra recintos deportivos disponibles cerca de ti y reserva en segundos.
        </p>

        <!-- 🔥 BOTÓN SOLO SI NO HAY SESIÓN -->
        <router-link
          v-if="!isLogged"
          to="/login-usuario"
          class="btn btn-primary btn-lg px-4"
        >
          Comenzar ahora
        </router-link>
      </div>
    </section>

    <!-- SECCIÓN QUIÉNES SOMOS -->
    <section id="quienes-somos" class="py-5 bg-light text-center">
      <div class="container">
        <h2 class="fw-bold mb-4 text-primary">Quiénes Somos</h2>
        <p class="lead text-muted">
          En ReserGO conectamos a deportistas con recintos deportivos de manera rápida y sencilla.
          Nuestra misión es facilitar la gestión de reservas, promoviendo la actividad física y la organización deportiva.
        </p>
      </div>
    </section>

    <!-- SECCIÓN CONTACTO -->
    <section id="contacto" class="py-5 text-center">
      <div class="container">
        <h2 class="fw-bold mb-4 text-primary">Contacto</h2>
        <p class="mb-3">📧 contacto@resergo.cl</p>
        <p>📍 Concepción, Chile</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isLogged = ref(false);

onMounted(() => {
  isLogged.value = !!localStorage.getItem("token");
});
</script>

<style scoped>
/* 🧱 Hero principal */
.hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 🎥 Video de fondo */
.hero-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* 🔲 Capa oscura para mejor contraste */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* 📌 Contenido centrado */
.hero .container {
  position: relative;
  z-index: 2;
}

/* 🎨 Botón */
.btn-primary {
  background-color: #0d6efd;
  border: none;
}
</style>
