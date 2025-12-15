// src/stores/useAuth.js
import { ref } from "vue";

// Normaliza rol (cliente, admin, dueno…)
function normalizeRole(role) {
  if (!role) return null;
  return role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// 🔹 Cargar usuario inicial
const storedUser = JSON.parse(localStorage.getItem("user") || "null");

if (storedUser?.rol) {
  storedUser.rol = normalizeRole(storedUser.rol);
}

export const user = ref(storedUser);

// 🔹 Guardar usuario + sesion COMPLETA
export function setUser(newUser) {
  if (newUser) {
    // Normalizar rol
    if (newUser.rol) {
      newUser.rol = normalizeRole(newUser.rol);
    }

    // Guardar objeto completo
    localStorage.setItem("user", JSON.stringify(newUser));

    // 🟢 Guardar claves individuales (compatibilidad con TODO tu sistema)
    if (newUser.token) localStorage.setItem("token", newUser.token);
    if (newUser.id) localStorage.setItem("userId", newUser.id);
    if (newUser.rol) localStorage.setItem("userRol", newUser.rol);
  } else {
    // Logout
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRol");
  }

  user.value = newUser;
}

// 🔹 Logout centralizado
export function logout() {
  setUser(null);
}
