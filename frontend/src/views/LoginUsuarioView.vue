<template>
  <div class="login-page">
    <div class="login-container">
      <h2>
  <div class="title-bar"></div>
  <span>Iniciar Sesión</span><br />
  <small>Usuario</small>
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
        <router-link to="/register-usuario">
          Regístrate como usuario
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "../axios.js";
import { useRouter } from "vue-router";
import { setUser } from "../stores/useAuth.js"; // ✅ importamos la función global reactiva

const email = ref("");
const password = ref("");
const router = useRouter();
const loading = ref(false);

async function login() {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await axios.post("http://localhost:4000/api/auth/login", {
      email: email.value,
      password: password.value,
    });

    const user = res.data.user;

    // 🚫 Bloquear acceso de admin o dueño
    if (user.rol === "admin" || user.rol === "dueño" || user.rol === "dueno") {
      alert("⚠️ Este acceso es solo para usuarios/clientes.");
      loading.value = false;
      return;
    }

    // ✅ Permitir acceso solo a clientes/usuarios
    if (user.rol === "cliente" || user.rol === "usuario") {
      // Guardar datos mínimos
      const userData = {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: res.data.token,
      };

      // ✅ Guardar sesión globalmente
      setUser(userData);

      // Redirigir a página de reservas
      router.push("/reservas");
      return;
    }

    alert("No tienes permisos para acceder a esta sección.");
  } catch (err) {
    console.error("Error en login:", err);
    alert("❌ Error al iniciar sesión. Verifica tus credenciales.");
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

/* --- Título --- */
h2 {
  text-align: left;
  color: #007aff;
  font-weight: 700;
}

.title-bar {
  width: 40px;
  height: 6px;
  background: #007aff;
  border-radius: 4px;
  margin-bottom: 10px;
}

h2 span {
  font-size: 1.7rem;
}

h2 small {
  font-size: 1.1rem;
  opacity: 0.6;
}

/* --- FORM SPACING (MEJORADO) --- */
form {
  display: flex;
  flex-direction: column;
  gap: 18px; /* ← ESPACIADO PROFESIONAL */
}

/* --- Inputs --- */
input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  background: #f7f7f8;
  font-size: 1rem;
  color: #212529 !important;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #007aff;
  background: #ffffff;
  box-shadow: 0 0 7px rgba(0, 122, 255, 0.2);
}

/* --- Botón --- */
button {
  width: 100%;
  padding: 12px;
  margin-top: 10px; /* <-- más equilibrado con el gap */
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

button[disabled] {
  opacity: 0.6;
}

/* --- Link inferior --- */
.volver {
  margin-top: 22px;
  font-size: 0.95rem;
  color: #555;
}

.volver a {
  color: #007aff;
  font-weight: 600;
  text-decoration: none;
}

.volver a:hover {
  text-decoration: underline;
}
</style>
