<template>
  <div class="reservas-page">
    <div class="reservas-container">
      <h2 class="titulo">🏟️ Módulo de Reservas</h2>

      <p class="subtitulo">
        Aquí podrás gestionar tus <strong>recintos</strong> y crear nuevas <strong>reservas</strong>.
      </p>

      <div class="botones">
        <!-- 🔹 Botón para ver reservas -->
        <button @click="irAReservas" class="btn btn-gris">
          📋 Ver Mis Reservas
        </button>

        <!-- 🔹 Botón para crear reserva -->
        <button @click="irAHacerReserva" class="btn btn-azul">
          ➕ Hacer una Reserva
        </button>

        <!-- 🔹 Solo visible para admin -->
        <button v-if="rol === 'admin'" @click="irARecintos" class="btn btn-verde">
          🏟️ Gestionar Recintos
        </button>

        <!-- 🔹 Botón cerrar sesión -->
        <button @click="cerrarSesion" class="btn btn-rojo">
          🔒 Cerrar sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const rol = ref("");

// ✅ Detectar el rol del usuario al cargar la vista
onMounted(() => {
  rol.value = localStorage.getItem("userRole") || "";
});

// 🔹 Navegación
function irAReservas() {
  router.push("/mis-reservas");
}
function irAHacerReserva() {
  router.push("/crear-reserva");
}
function irARecintos() {
  router.push("/recintos");
}
function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  router.push("/");
}
</script>

<style scoped>
/* Fondo y centrado */
.reservas-page {
  background-color: #ffffff; /* ← antes #f8f9fa */
  min-height: 100vh;
  width: 100%;              /* asegura que cubra todo el ancho */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #212529;
}

/* Tarjeta principal */
.reservas-container {
  background: #ffffff;
  padding: 50px 60px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 90%;
  max-width: 700px;
}

/* Título principal */
.titulo {
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: 700;
  color: #0d6efd;
}

/* Subtítulo */
.subtitulo {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 35px;
}

/* Contenedor de botones */
.botones {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

/* Botones base */
.btn {
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.btn:hover {
  transform: translateY(-2px);
}

/* Colores de botones */
.btn-azul {
  background-color: #007bff;
}
.btn-azul:hover {
  background-color: #0056b3;
}

.btn-gris {
  background-color: #6c757d;
}
.btn-gris:hover {
  background-color: #5a6268;
}

.btn-verde {
  background-color: #198754;
}
.btn-verde:hover {
  background-color: #157347;
}

.btn-rojo {
  background-color: #dc3545;
}
.btn-rojo:hover {
  background-color: #bb2d3b;
}

/* Responsivo */
@media (max-width: 500px) {
  .reservas-container {
    padding: 35px 25px;
  }
  .btn {
    width: 100%;
  }
}
</style>
