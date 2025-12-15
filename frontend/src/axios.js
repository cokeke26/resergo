// src/axios.js
import axios from "axios";
import { setUser } from "./stores/useAuth.js";

// ✅ Configuración base
axios.defaults.baseURL = "http://localhost:4000/api";
axios.defaults.headers["Content-Type"] = "application/json";

// ✅ Interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.token) {
      config.headers.Authorization = `Bearer ${storedUser.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor para manejar respuestas 401 (token inválido o expirado)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("🔒 Sesión expirada o token inválido");
      setUser(null); // limpia sesión global
      window.location.href = "/login-usuario"; // redirige al login
    }
    return Promise.reject(error);
  }
);

export default axios;
