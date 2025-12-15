<template>
  <div class="crear-container">

    <div class="card">
      <h2 class="title">🏟️ Crear nuevo recinto</h2>

      <form @submit.prevent="crearRecinto" class="form">

        <!-- Nombre -->
        <label>Nombre del recinto</label>
        <input v-model="nombre" type="text" placeholder="Ej: Complejo Deportivo Central" required />

        <!-- ⭐ UBICACIÓN MEJORADA SIN ROMPER ESTILO -->
        <label>Ubicación (buscar ciudad o dirección)</label>

        <!-- Buscador -->
        <div class="buscador-box">
          <input 
            v-model="busqueda"
            type="text"
            placeholder="Ej: Concepción, Chillán, Av. Las Palmas 123"
          />
          <button type="button" class="btn-buscar" @click="buscarUbicacion">🔍</button>
        </div>

        <!-- Mapa -->
        <div id="map" class="map"></div>

        <!-- Coordenadas -->
        <p v-if="lat && lng" class="coords">
          📍 Lat: {{ lat.toFixed(6) }} — Lng: {{ lng.toFixed(6) }}
        </p>

        <!-- Dirección en texto -->
        <p v-if="direccion" class="direccion">
          📌 {{ direccion }}
        </p>

        <!-- Tipos de cancha (NO TOQUÉ NADA AQUÍ) -->
        <div class="canchas">
          <div class="encabezado">
            <h3>⚽ Tipos de cancha</h3>
            <button type="button" class="btn-agregar" @click="agregarFila">➕ Agregar</button>
          </div>

          <div v-for="(c, i) in canchas" :key="i" class="fila">
            <select v-model="c.tipo" required>
              <option disabled value="">-- Tipo de cancha --</option>
              <option>Fútbol</option>
              <option>Futbolito</option>
              <option>Pádel</option>
              <option>Básquetbol</option>
            </select>

            <input 
              v-model.number="c.cantidad" 
              type="number" 
              min="1" 
              placeholder="Cantidad" 
              required 
            />

            <button type="button" class="btn-eliminar" @click="eliminarFila(i)">❌</button>
          </div>

          <p class="tip">Se crearán canchas como “Fútbol 1”, “Fútbol 2”, etc.</p>
        </div>

        <!-- Administrador -->
        <label>Seleccionar administrador</label>
        <select v-model="adminId" required>
          <option value="">-- Selecciona un administrador --</option>
          <option v-for="admin in admins" :key="admin.id" :value="admin.id">
            {{ admin.nombre }} {{ admin.apellido }} ({{ admin.email }})
          </option>
        </select>

        <button type="submit" class="btn-submit">Crear recinto</button>

      </form>

      <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

  </div>
</template>

<script setup>
import axios from "../axios.js";
import { ref, onMounted } from "vue";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Data
const nombre = ref("");
const adminId = ref("");
const admins = ref([]);
const mensaje = ref("");
const error = ref("");

const busqueda = ref("");   
const lat = ref(null);
const lng = ref(null);
const direccion = ref(""); 

let map;
let marker;

// Canchas
const canchas = ref([{ tipo: "", cantidad: 1 }]);

function agregarFila() {
  canchas.value.push({ tipo: "", cantidad: 1 });
}
function eliminarFila(i) {
  canchas.value.splice(i, 1);
  if (canchas.value.length === 0) canchas.value.push({ tipo: "", cantidad: 1 });
}

// Reverse geocode
async function reverseGeocode(latitud, longitud) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}`;
  const res = await fetch(url);
  const data = await res.json();
  direccion.value = data.display_name; 
}

// Buscar ciudad o dirección
async function buscarUbicacion() {
  if (!busqueda.value.trim()) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda.value)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.length) {
    alert("No se encontró la ubicación.");
    return;
  }

  const punto = data[0];

  lat.value = parseFloat(punto.lat);
  lng.value = parseFloat(punto.lon);

  map.setView([lat.value, lng.value], 15);

  if (marker) marker.setLatLng([lat.value, lng.value]);
  else marker = L.marker([lat.value, lng.value]).addTo(map);

  reverseGeocode(lat.value, lng.value);
}

// Inicializar mapa
onMounted(async () => {
  const res = await axios.get("http://localhost:4000/api/users/admins");
  admins.value = res.data;

  map = L.map("map").setView([-36.8201, -73.0444], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  map.on("click", e => {
    lat.value = e.latlng.lat;
    lng.value = e.latlng.lng;

    if (marker) marker.setLatLng(e.latlng);
    else marker = L.marker(e.latlng).addTo(map);

    reverseGeocode(lat.value, lng.value);
  });
});

// ⭐ CREAR RECINTO (CORREGIDO)
// ⭐ CREAR RECINTO (100% corregido)
// ⭐ CREAR RECINTO (VERSIÓN FINAL + CORRECTA)
async function crearRecinto() {
  try {
    const token = localStorage.getItem("token");
    const duenoId = localStorage.getItem("userId");  // ✔ dueño logueado

    if (!lat.value || !lng.value) {
      alert("Selecciona una ubicación en el mapa.");
      return;
    }

    await axios.post(
      "http://localhost:4000/api/dueno/recintos",
      {
        nombre: nombre.value,

        // ✔ Dirección como ubicación principal
        ubicacion: direccion.value,

        // ✔ Prisma ya tiene campo 'direccion'
        direccion: direccion.value,

        // ✔ Coordenadas reales
        latitud: lat.value,
        longitud: lng.value,

        // ✔ Importante mandar descripción aunque sea vacía
        descripcion: "",

        // ✔ IDs reales
        duenoId: Number(duenoId),
        adminId: Number(adminId.value),

        // ✔ Mínimo requerido por backend
        disponibilidad: [],

        // ✔ Lista de canchas
        canchas: canchas.value,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    mensaje.value = "Recinto creado correctamente.";
  } catch (e) {
    console.error(e);
    error.value = e.response?.data?.error || "Error al crear el recinto.";
  }
}


</script>


<style scoped>
.buscador-box {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn-buscar {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
}

.btn-buscar:hover {
  background: #1d4ed8;
}

.map {
  height: 300px;
  border-radius: 12px;
  margin-top: 10px;
  margin-bottom: 20px;
  border: 2px solid #d1d5db;
}

.direccion {
  font-size: 0.95rem;
  text-align: center;
  margin-top: -10px;
  color: #1e3a8a;
  font-weight: 600;
}
.crear-container {
  display: flex;
  justify-content: center;
  padding: 40px;
  background: #ffffff;
  min-height: 100vh;
}

/* Card principal */
.card {
  width: 600px;
  background: white;
  padding: 35px;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  animation: fadeUp 0.3s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e3a8a;
}

/* Formulario */
label {
  font-weight: 600;
  margin-top: 12px;
  display: block;
}

input,
select {
  width: 100%;
  padding: 12px 14px;
  margin-top: 6px;

  background: #ffffff;     /* Fondo blanco */
  color: #111827;          /* Texto negro */
  font-size: 1rem;

  border: 1px solid #d1d5db;
  border-radius: 10px;

  transition: 0.2s ease;
}

/* Cuando escribes → borde azul profesional */
input:focus,
select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 4px #2563eb66;
}

/* Placeholder gris suave */
input::placeholder {
  color: #9ca3af;
}


::placeholder {
  color: #9ca3af;
}

/* Sección canchas */
.canchas {
  background: #f9fafb;
  padding: 15px;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #e5e7eb;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fila {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

.fila input[type="number"] {
  width: 110px;
}

.btn-agregar {
  background: #16a34a;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-agregar:hover {
  background: #15803d;
}

.btn-eliminar {
  background: #dc2626;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-eliminar:hover {
  background: #b91c1c;
}

.tip {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #6b7280;
}

/* Botón final */
.btn-submit {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-submit:hover {
  transform: scale(1.02);
  background: #1d4ed8;
}

/* Mensajes */
.mensaje {
  color: #059669;
  font-weight: 600;
  margin-top: 12px;
}

.error {
  color: #dc2626;
  font-weight: 600;
  margin-top: 12px;
}
</style>