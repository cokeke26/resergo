<template>
  <div class="login-page">
    <div class="login-container">

      <h2 class="title">
        <div class="title-bar"></div>
        <span>Iniciar Sesión</span><br />
        <small>Dueño</small>
      </h2>

      <form @submit.prevent="loginDueno">
        <input v-model="email" type="email" placeholder="Correo electrónico" required />
        <input v-model="password" type="password" placeholder="Contraseña" required />
        
        <button type="submit">
          Entrar
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="registro">
        <p>¿No tienes cuenta?</p>
        <button @click="$router.push('/register-dueno')">Registrarme</button>
      </div>

    </div>
  </div>
</template>


<script setup>
import axios from "axios"; // ✅ usa el axios normal
import { ref } from "vue";
import { useRouter } from "vue-router";
import { setUser } from "../stores/useAuth.js"; // ✅ importante

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function loginDueno() {
  try {
    const res = await axios.post("http://localhost:4000/api/auth/login", {
      email: email.value,
      password: password.value,
    });

    const user = res.data.user;

    // ✅ Normaliza el rol (convierte “dueño” → “dueno”)
    const normalizedRole = user.rol
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    // 🚫 Si no es dueño, bloquea acceso
    if (normalizedRole !== "dueno") {
      error.value = "Este acceso es solo para dueños.";
      return;
    }

    // ✅ Guardar usuario en el store (centralizado)
    setUser({
      id: user.id,
      nombre: user.nombre,
      rol: normalizedRole,
      token: res.data.token,
    });

    // ✅ Guardar token (opcional, si lo usas aparte)
    localStorage.setItem("token", res.data.token);

    // 🔁 Notificar cambio global
    window.dispatchEvent(new Event("auth-change"));

    // ✅ Redirigir al panel
    router.push("/panel-dueno");
  } catch (e) {
    console.error("Error al iniciar sesión:", e);
    error.value = "Credenciales inválidas o error del servidor.";
  }
}
</script>

<style scoped>
/* === FONDO === */
.login-page {
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* === CARD === */
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

/* === FORM SPACING (MEJORADO) === */
form {
  display: flex;
  flex-direction: column;
  gap: 18px; /* ← ESPACIADO PROFESIONAL */
}

/* === INPUTS === */
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

/* === BOTÓN === */
button {
  width: 100%;
  padding: 12px;
  margin-top: 10px; /* ← Ajuste para balance con el gap */
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

/* === ERROR === */
.error {
  color: red;
  margin-top: 10px;
}

/* === REGISTRO LINK === */
.registro {
  margin-top: 22px;
  font-size: 0.95rem;
  color: #555;
}

.registro button {
  background: transparent;
  border: none;
  color: #007aff;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  margin-top: 4px;
}

.registro button:hover {
  text-decoration: underline;
}
</style>
