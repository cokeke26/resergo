<template>
  <div class="form-container">
    <h2>Iniciar Sesión (Administrador)</h2>
    <form @submit.prevent="loginAdmin">
      <input v-model="email" type="email" placeholder="Correo" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <button type="submit">Ingresar</button>
    </form>

    <p class="link">
      ¿Eres usuario normal?
      <router-link to="/login">Inicia sesión aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/axios.js";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const password = ref("");

async function loginAdmin() {
  try {
    const res = await axios.post("http://localhost:4000/api/auth/login", {
      email: email.value,
      password: password.value,
    });

    if (res.data.user.rol !== "admin") {
      alert("❌ No tienes permisos de administrador.");
      return;
    }

    // ✅ Guardar token y datos
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.user.id);
    localStorage.setItem("userRol", res.data.user.rol);
    localStorage.setItem("userName", res.data.user.nombre);

    window.dispatchEvent(new Event("auth:login"));
    router.push("/panel-admin");
  } catch (err) {
    alert(err.response?.data?.error || "Error al iniciar sesión");
  }
}
</script>

<style scoped>
.form-container {
  max-width: 420px;
  margin: 100px auto;
  padding: 35px 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  text-align: center;
}

h2 {
  margin-bottom: 25px;
  color: #222;
  font-size: 1.8rem;
  font-weight: 700;
}

form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}

input {
  width: 100%;
  max-width: 300px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

button {
  background-color: #28a745;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  width: 100%;
  max-width: 200px;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
}

button:hover {
  background-color: #1e7e34;
  transform: translateY(-1px);
}

.link {
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  color: #555;
}
.link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}
.link a:hover {
  text-decoration: underline;
}
</style>