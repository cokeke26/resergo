<template>
  <div class="register-page">
    <div class="register-container">

      <h2 class="title">
        <div class="title-bar"></div>
        <span>Registro</span><br />
        <small>de Usuario</small>
      </h2>

      <form @submit.prevent="register">
        <input v-model="nombre" type="text" placeholder="Nombre" required />
        <input v-model="apellido" type="text" placeholder="Apellido" required />
        <input v-model="email" type="email" placeholder="Correo electrónico" required />
        <input v-model="password" type="password" placeholder="Contraseña" required />
        <input v-model="telefono" type="text" placeholder="Teléfono" />

        <button type="submit">Registrarme como Usuario</button>
      </form>

      <p class="link">
        ¿Ya tienes cuenta?
        <router-link to="/login-usuario">Iniciar sesión</router-link>
      </p>

    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import axios from "../axios.js";
import { useRouter } from "vue-router";

const nombre = ref("");
const apellido = ref("");
const email = ref("");
const password = ref("");
const telefono = ref("");
const router = useRouter();

async function register() {
  try {
    await axios.post("http://localhost:4000/api/auth/register-usuario", {
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      telefono: telefono.value,
      rol: "usuario",
    });

    alert("✅ Usuario registrado correctamente");
    router.push("/login-usuario");
  } catch (err) {
    alert(err.response?.data?.error || "Error al registrar usuario");
    console.error(err);
  }
}
</script>

<style scoped>
/* === FONDO === */
.register-page {
  background-color: #ffffff; /* blanco puro */
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* === CARD === */
.register-container {
  background: #ffffff;
  padding: 50px 60px;
  border-radius: 20px;
  border: 1px solid #ececec;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

/* === TITULO === */
.title {
  text-align: left;
  color: #007aff;
  font-weight: 700;
  margin-bottom: 25px;
}

.title-bar {
  width: 40px;
  height: 6px;
  background: #007aff;
  border-radius: 4px;
  margin-bottom: 10px;
}

.title span {
  font-size: 1.7rem;
}

.title small {
  font-size: 1.1rem;
  opacity: 0.6;
}

/* === FORM === */
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* === INPUTS === */
input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  background: #f7f7f8;
  font-size: 1rem;
  color: #212529 !important;  /* ← ARREGLA EL TEXTO BLANCO */
  transition: all 0.2s ease;
}

input:focus {
  border-color: #007aff;
  background: white;
  box-shadow: 0 0 7px rgba(0, 122, 255, 0.2);
  outline: none;
}

/* === BOTÓN === */
button {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  border-radius: 12px;
  border: none;
  background: #007aff;
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

button:hover {
  background: #0062cc;
  transform: translateY(-2px);
}

/* === LINK === */
.link {
  margin-top: 20px;
  font-size: 0.95rem;
  color: #555;
}

.link a {
  color: #007aff;
  font-weight: 600;
  text-decoration: none;
}

.link a:hover {
  text-decoration: underline;
}
</style>
