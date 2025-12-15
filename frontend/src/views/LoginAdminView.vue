<template>
  <div class="login-page">
    <div class="login-container">
      
      <h2 class="title">
        <div class="title-bar"></div>
        <span>Iniciar Sesión</span><br />
        <small>Administrador</small>
      </h2>

      <form @submit.prevent="login">
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          required
        />
        <button type="submit" :disabled="loading">
          {{ loading ? "Ingresando..." : "Ingresar" }}
        </button>
      </form>

      <p class="volver">
        ¿No tienes cuenta?
        <router-link to="/register-admin">
          Regístrate como administrador
        </router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "../axios.js";
import { useRouter } from "vue-router";
import { setUser } from "../stores/useAuth.js"; // ✅ Importar función reactiva

const email = ref("");
const password = ref("");
const loading = ref(false);
const router = useRouter();

async function login() {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await axios.post("http://localhost:4000/api/auth/login", {
      email: email.value,
      password: password.value,
    });

    const user = res.data.user;

    // ✅ Solo acceso a administradores
    if (user.rol !== "admin") {
      alert("Este acceso es solo para administradores.");
      loading.value = false;
      return;
    }

    // ✅ Crear objeto de sesión
    const userData = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      token: res.data.token,
    };

    // ✅ Guardar sesión globalmente (reactivo)
    setUser(userData);

    // ✅ Redirigir al panel de admin
    router.push("/panel-admin");
  } catch (err) {
    console.error("Error en login:", err);
    alert("Error al iniciar sesión. Verifica tus credenciales.");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  background-color: #ffffff; /* blanco puro */
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-container {
  background: #ffffff;
  padding: 50px 60px;
  border-radius: 20px;
  border: 1px solid #ececec;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 380px;
  text-align: center;
}

/* --- TÍTULO --- */
.title {
  text-align: left;
  color: #28a745;
  font-weight: 700;
  margin-bottom: 25px;
}

.title-bar {
  width: 40px;
  height: 6px;
  background: #28a745;
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

/* --- FORM SPACING (PROFESIONAL) --- */
form {
  display: flex;
  flex-direction: column;
  gap: 18px; /* ← ESPACIADO PERFECTO */
}

/* --- INPUTS --- */
input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  background: #f7f7f8;
  font-size: 1rem;
  color: #212529 !important; /* ← evita texto blanco */
  transition: all 0.2s ease;
}

input:focus {
  border-color: #28a745;
  background: #ffffff;
  box-shadow: 0 0 7px rgba(40, 167, 69, 0.2);
}

/* --- BOTÓN --- */
button {
  width: 100%;
  padding: 12px;
  margin-top: 10px; /* ← balance perfecto con el gap */
  border-radius: 12px;
  border: none;
  background: #28a745;
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

button:hover {
  background: #218838;
  transform: translateY(-2px);
}

button[disabled] {
  opacity: 0.6;
}

/* --- LINK --- */
.volver {
  margin-top: 22px;
  font-size: 0.95rem;
  color: #555;
}

.volver a {
  color: #28a745;
  font-weight: 600;
  text-decoration: none;
}

.volver a:hover {
  text-decoration: underline;
}
</style>
