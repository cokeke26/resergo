<template>
  <div class="gestion-canchas">

    <h2>⚽ Gestión de Canchas</h2>

    <!-- Seleccionar recinto -->
    <label class="label">Seleccionar un recinto</label>
    <select v-model="recintoId" @change="cargarCanchas">
      <option value="">-- Selecciona un recinto --</option>
      <option v-for="r in recintos" :key="r.id" :value="r.id">
        {{ r.nombre }} — {{ r.ubicacion }}
      </option>
    </select>

    <!-- Si hay recinto seleccionado -->
    <div v-if="recintoId" class="bloque-canchas">

      <h3>Listado de Canchas del Recinto</h3>

      <!-- Tabla de canchas -->
      <table class="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in canchas" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.nombre }}</td>
            <td>{{ c.tipo }}</td>

            <td class="acciones">

              <!-- ✏️ Editar -->
              <button class="btn-edit" @click="editar(c)">✏️ Editar</button>

              <!-- 🗑️ Eliminar -->
              <button class="btn-del" @click="eliminar(c.id)">🗑️ Eliminar</button>

              <!-- 🗓️ Configurar -->
              <button
                class="btn-horarios"
                @click="$router.push(`/panel-admin/canchas/${c.id}/disponibilidad`)"
              >
                🗓️ Configurar horarios
              </button>

              <!-- ✅ NUEVO: Botón Generar Disponibilidad -->
              <button
                class="btn-generar"
                @click="generarDisponibilidad(c.id)"
              >
                ⚡ Generar Disponibilidad
              </button>

            </td>
          </tr>

          <tr v-if="canchas.length === 0">
            <td colspan="4">No hay canchas registradas.</td>
          </tr>
        </tbody>
      </table>

      <!-- Crear nueva cancha -->
      <div class="crear-cancha">
        <h4>➕ Crear nueva cancha</h4>

        <label>Nombre de la cancha</label>
        <input v-model="nuevaNombre" type="text" placeholder="Ej: Cancha 1" />

        <label>Tipo de cancha</label>
        <select v-model="nuevaTipo">
          <option value="">-- Tipo de cancha --</option>
          <option value="Fútbol">Fútbol</option>
          <option value="Futbolito">Futbolito</option>
          <option value="Pádel">Pádel</option>
          <option value="Básquetbol">Básquetbol</option>
        </select>

        <button class="btn-crear" @click="crearCancha">Crear cancha</button>
      </div>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    <p v-if="error" class="error">{{ error }}</p>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../axios.js";

const recintos = ref([]);
const recintoId = ref("");
const canchas = ref([]);

const nuevaNombre = ref("");
const nuevaTipo = ref("");

const mensaje = ref("");
const error = ref("");

const token = localStorage.getItem("token");

/* ✅ Cargar recintos */
onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:4000/api/admin/recintos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    recintos.value = res.data;
  } catch (e) {
    console.error(e);
  }
});

/* ✅ Cargar canchas */
async function cargarCanchas() {
  if (!recintoId.value) return;

  try {
    const res = await axios.get(
      `http://localhost:4000/api/canchas/${recintoId.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    canchas.value = res.data;
  } catch (e) {
    console.error("❌ Error al cargar canchas:", e);
  }
}

/* ✅ Crear cancha */
async function crearCancha() {
  if (!nuevaNombre.value || !nuevaTipo.value) {
    error.value = "Debes completar todos los campos.";
    return;
  }

  try {
    await axios.post(
      `http://localhost:4000/api/canchas/${recintoId.value}`,
      {
        nombre: nuevaNombre.value,
        tipo: nuevaTipo.value,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    mensaje.value = "✅ Cancha creada correctamente.";
    error.value = "";
    nuevaNombre.value = "";
    nuevaTipo.value = "";

    cargarCanchas();
  } catch (e) {
    error.value = "Error al crear la cancha.";
  }
}

/* ✅ Eliminar cancha */
async function eliminar(id) {
  if (!confirm("¿Seguro que deseas eliminar esta cancha?")) return;

  try {
    await axios.delete(`http://localhost:4000/api/canchas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    cargarCanchas();
  } catch (e) {
    error.value = "Error al eliminar.";
  }
}

/* ✅ Editar cancha */
async function editar(c) {
  const nuevoNombre = prompt("Nuevo nombre:", c.nombre);
  const nuevoTipo = prompt("Nuevo tipo:", c.tipo);

  if (!nuevoNombre || !nuevoTipo) return;

  try {
    await axios.put(
      `http://localhost:4000/api/canchas/${c.id}`,
      {
        nombre: nuevoNombre,
        tipo: nuevoTipo,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    cargarCanchas();
  } catch (e) {
    error.value = "Error al editar.";
  }
}

/* ✅ NUEVO: Generar Disponibilidad */
async function generarDisponibilidad(canchaId) {
  if (!confirm("¿Generar disponibilidad mensual para esta cancha?")) return;

  try {
    await axios.post(
      `http://localhost:4000/api/canchas/${canchaId}/disponibilidad/generar`,
      { meses: 1, horaInicio: "08:00", horaFin: "22:00" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    mensaje.value = "✅ Disponibilidad generada exitosamente.";
  } catch (e) {
    console.error(e);
    error.value = "❌ Error al generar disponibilidad.";
  }
}
</script>

<style scoped>
/* ---- CONTENEDOR GENERAL ---- */
.gestion-canchas {
  max-width: 1100px;
  margin: 40px auto;
  padding: 25px;
  font-family: "Inter", sans-serif;
  animation: fadeIn 0.3s ease-out;
  color: #222 !important;
}

/* ---- TÍTULO PRINCIPAL ---- */
h2 {
  text-align: center;
  font-size: 2.3rem;
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 18px;
}

/* ---- LABEL ---- */
.label {
  text-align: center;
  display: block;
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: 6px;
  color: #333;
}

/* ---- SELECT PRINCIPAL ---- */
select {
  margin: 0 auto 25px auto;
  display: block;
  width: 350px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 15px;
  background: #f9fafb !important;
  color: #111 !important;
  transition: 0.2s ease;
}

select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 6px #2563eb50;
  outline: none;
}

/* ---- BLOQUE CANCHAS ---- */
.bloque-canchas {
  background: white;
  padding: 30px 40px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  margin-top: 25px;
  color: #222 !important;
}

.bloque-canchas h3 {
  text-align: center;
  font-size: 1.7rem;
  margin-bottom: 20px;
  color: #1e3a8a;
  font-weight: 700;
}

/* ---- TABLA ---- */
.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white !important;
  color: #111 !important;
}

.tabla thead {
  background: #f3f6ff !important;
}

.tabla th {
  padding: 12px;
  font-weight: 700;
  font-size: 15px;
  color: #1e3a8a !important;
  border-bottom: 2px solid #dce3f7;
  background: #f3f6ff !important;
}

.tabla td {
  padding: 12px;
  color: #222 !important;
  background: #ffffff !important;
  border-bottom: 1px solid #e5e7eb;
}

.tabla tbody tr:hover {
  background-color: #f8faff;
}

.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ---- BOTONES ---- */
button {
  cursor: pointer;
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 12px;
  transition: 0.2s ease;
  border: none;
}

/* Editar */
.btn-edit {
  background: #fbbf24;
  color: #111 !important;
}
.btn-edit:hover {
  background: #f59e0b;
}

/* Eliminar */
.btn-del {
  background: #ef4444;
  color: white !important;
}
.btn-del:hover {
  background: #dc2626;
}

/* Configurar horarios */
.btn-horarios {
  background: #2563eb;
  color: white !important;
}
.btn-horarios:hover {
  background: #1d4ed8;
}

/* Generar disponibilidad */
.btn-generar {
  background: #22c55e;
  color: white !important;
}
.btn-generar:hover {
  background: #16a34a;
}

/* ---- CREAR CANCHA ---- */
.crear-cancha {
  margin-top: 40px;
  padding: 25px;
  background: #f9fafb;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.crear-cancha h4 {
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 15px;
}

.crear-cancha label {
  display: block;
  margin-top: 12px;
  margin-bottom: 4px;
  font-weight: 600;
  color: #444;
}

.crear-cancha input,
.crear-cancha select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  font-size: 14px;
  background: #ffffff !important;
  color: #111 !important;
}

.crear-cancha input:focus,
.crear-cancha select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 6px #2563eb55;
}

/* Botón crear */
.btn-crear {
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  transition: 0.2s ease;
}
.btn-crear:hover {
  background: #1d4ed8;
}

/* ---- MENSAJES ---- */
.error {
  color: #dc2626;
  margin-top: 10px;
  font-weight: bold;
}
.mensaje {
  color: #16a34a;
  margin-top: 10px;
  font-weight: bold;
}

/* ---- ANIMACIONES ---- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

</style>
