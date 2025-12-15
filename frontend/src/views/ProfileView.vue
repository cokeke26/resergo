<template>
  <div class="profile-container">
    <h2>Perfil del Usuario</h2>

    <form @submit.prevent="updateProfile" v-if="user">
      <label>Nombre</label>
      <input v-model="editableUser.nombre" type="text" :disabled="!editando" />

      <label>Apellido</label>
      <input v-model="editableUser.apellido" type="text" :disabled="!editando" />

      <label>Correo</label>
      <input v-model="editableUser.email" type="email" disabled />

      <label>Teléfono</label>
      <input v-model="editableUser.telefono" type="text" :disabled="!editando" />

      <label v-if="editando">Nueva contraseña</label>
      <input
        v-if="editando"
        v-model="newPassword"
        type="password"
        placeholder="Opcional"
      />

      <div class="buttons">
        <button v-if="!editando" type="button" @click="editando = true">
          Editar perfil
        </button>

        <button v-else type="submit" class="save">
          Guardar cambios
        </button>

        <button type="button" class="logout" @click="logout">
          Cerrar sesión
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from "../axios.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { user, setUser } from "../stores/useAuth.js"; // ✅ conexión con el store global

const router = useRouter();
const editando = ref(false);
const newPassword = ref("");
const editableUser = ref({ ...user.value }); // copia editable

// ✅ Obtener perfil del usuario actual
onMounted(async () => {
  if (!user.value?.token) {
    return router.push("/login-usuario");
  }

  try {
    const res = await axios.get("http://localhost:4000/api/auth/me", {
      headers: { Authorization: `Bearer ${user.value.token}` },
    });

    editableUser.value = res.data.user;
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    setUser(null);
    router.push("/login-usuario");
  }
});

// ✅ Guardar cambios del perfil
async function updateProfile() {
  try {
    await axios.put(
      "http://localhost:4000/api/users/me",
      {
        nombre: editableUser.value.nombre,
        apellido: editableUser.value.apellido,
        telefono: editableUser.value.telefono,
        password: newPassword.value || undefined,
      },
      { headers: { Authorization: `Bearer ${user.value.token}` } }
    );

    alert("✅ Perfil actualizado correctamente");
    newPassword.value = "";
    editando.value = false;

    // ✅ Actualiza el estado global del usuario
    setUser({
      ...user.value,
      nombre: editableUser.value.nombre,
      apellido: editableUser.value.apellido,
      telefono: editableUser.value.telefono,
    });
  } catch (err) {
    alert(err.response?.data?.error || "Error al actualizar perfil");
  }
}

// ✅ Cerrar sesión (reactivo)
function logout() {
  setUser(null); // limpia localStorage y estado global
  router.push("/login-usuario");
}
</script>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 25px;
  color: #222;
  font-size: 1.6rem;
  font-weight: 700;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

label {
  text-align: left;
  font-weight: 600;
  color: #444;
  width: 100%;
  max-width: 280px;
  font-size: 0.9rem;
}

input {
  width: 100%;
  max-width: 280px;
  padding: 9px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
}

button {
  width: 100%;
  max-width: 280px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background-color: #007bff;
  transition: background 0.3s, transform 0.1s;
  margin-top: 8px;
}

button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.logout {
  background-color: #6c757d;
  margin-top: 10px;
}

.logout:hover {
  background-color: #5a6268;
}
</style>

