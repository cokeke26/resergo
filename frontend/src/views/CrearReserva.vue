<template>
  <div class="crear-reserva">
    <h1>📅 Calendario de Reservas</h1>
    <p class="descripcion">
      Selecciona un recinto, tipo de cancha y una cancha para ver disponibilidad.
    </p>

    <!-- Recinto -->
    <div class="campo">
      <label>Recinto:</label>
      <select v-model="reserva.recintoId" @change="cargarTipos" required>
        <option value="">Selecciona un recinto</option>
        <option v-for="r in recintos" :key="r.id" :value="r.id">
          {{ r.nombre }}
        </option>
      </select>
    </div>

    <!-- Tipo de cancha -->
    <div class="campo" v-if="tipos.length">
      <label>Tipo de cancha:</label>
      <select v-model="reserva.tipoCancha" @change="filtrarCanchas" required>
        <option value="">Selecciona un tipo</option>
        <option v-for="t in tipos" :key="t">{{ t }}</option>
      </select>
    </div>

    <!-- Cancha -->
    <div class="campo" v-if="canchasFiltradas.length">
      <label>Cancha:</label>
      <select v-model="reserva.canchaId" @change="cargarCalendario" required>
        <option value="">Selecciona una cancha</option>
        <option v-for="c in canchasFiltradas" :key="c.id" :value="c.id">
          {{ c.nombre }} — {{ c.tipo }}
        </option>
      </select>
    </div>

    <!-- Navegación semanal -->
    <div v-if="calendarioActual.length" class="nav-semanal">
      <button @click="semanaAnterior">⬅ Semana anterior</button>
      <span>Semana {{ semanaActual + 1 }}</span>
      <button @click="semanaSiguiente">➡ Semana siguiente</button>
    </div>

    <!-- Disponibilidad -->
    <div v-if="calendarioActual.length" class="tarjetas-container">
      <h2 class="titulo-bonito">📆 Disponibilidad Semanal</h2>

      <div class="grid-dias">
        <div
          v-for="dia in calendarioActual"
          :key="dia.fecha"
          class="tarjeta-dia"
        >
          <h3 class="titulo-dia">{{ formatear(dia.fecha) }}</h3>

          <div class="lista-horas">
            <div
              v-for="hora in horasBase"
              :key="dia.fecha + hora"
              class="hora-item"
              :class="{
                disponible: dia.bloques[hora]?.estado === 'disponible',
                ocupado: dia.bloques[hora]?.estado === 'ocupado',
                seleccionado: isSelected(dia.fecha, hora),
              }"
              @click="
                () => {
                  const estado =
                    dia.bloques[hora]?.estado?.toLowerCase?.() || '';
                  if (estado === 'disponible')
                    seleccionar(dia.fecha, dia.bloques[hora]);
                }
              "
            >
              <span class="texto-hora">{{ hora }}</span>
              <span
                v-if="dia.bloques[hora]?.estado === 'disponible'"
                class="estado-icono"
                >✅</span
              >
              <span
                v-else-if="dia.bloques[hora]?.estado === 'ocupado'"
                class="estado-icono"
                >❌</span
              >
              <span v-else class="estado-icono">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <teleport to="body">
      <div v-if="mostrarModal" class="resergo-overlay" @click.self="cerrarModal">
        <div class="resergo-modal" role="dialog" aria-modal="true">
          <h2 class="text-xl font-bold mb-3">✅ Confirmar Reserva</h2>

          <template v-if="datosModal">
            <p><strong>Cancha:</strong> {{ canchaSeleccionada?.nombre }}</p>
            <p><strong>Tipo:</strong> {{ canchaSeleccionada?.tipo }}</p>
            <p><strong>Fecha:</strong> {{ formatear(datosModal.fecha) }}</p>
            <p><strong>Hora:</strong> {{ datosModal.horaInicio }} - {{ datosModal.horaFin }}</p>

            <hr />

            <p><strong>Precio normal:</strong> ${{ precioBase.toLocaleString() }}</p>

            <p v-if="descuentoActivo"><strong>Descuento 20%:</strong> -${{ descuento.toLocaleString() }}</p>

            <p><strong>Total a pagar:</strong> ${{ precioFinal.toLocaleString() }}</p>

            <hr />

            <p><strong>Nombre:</strong> {{ datosModal.nombre }}</p>
            <p><strong>Correo:</strong> {{ datosModal.email }}</p>

            <button class="btn-pagar" @click="simularPago">💳 Ir a pagar</button>
          </template>

          <template v-else>
            <p class="text-gray-500 text-center">Cargando datos de reserva...</p>
          </template>

          <button class="btn-cerrar" @click="cerrarModal">Cerrar</button>
        </div>
      </div>
    </teleport>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "../axios.js";

/* Estados */
const recintos = ref([]);
const canchas = ref([]);
const tipos = ref([]);
const canchasFiltradas = ref([]);
const canchaSeleccionada = ref({ nombre: "", tipo: "" });

const calendario = ref([]);
const semanaActual = ref(0);
const mensaje = ref("");
const mostrarModal = ref(false);
const datosModal = ref(null);

/* Precios */
const precios = {
  "Fútbol": 30000,
  "Futbol": 30000,
  "Pádel": 18000,
  "Padel": 18000,
  "Básquetbol": 18000,
  "Basquetbol": 18000,
  "Futbolito": 24000,
};

/* Horarios base */
const horasBase = [
  "08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00",
  "20:00","21:00","22:00"
];

const mesActual = new Date().toISOString().slice(0, 7);
const user = JSON.parse(localStorage.getItem("user") || "null");

const reserva = ref({
  recintoId: "",
  tipoCancha: "",
  canchaId: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  usuarioId: user?.id || null,
  slotId: null,
});

/* Mostrar calendario */
const calendarioActual = computed(() => {
  const start = semanaActual.value * 7;
  return calendario.value.slice(start, start + 7);
});

/* Formatear fecha */
const formatear = (f) => {
  if (!f) return "";
  const [y, m, d] = f.split("-");
  return `${d}/${m}`;
};

/* Cargar recintos */
async function cargarRecintos() {
  const res = await axios.get("/recintos");
  recintos.value = res.data;
}

/* Cargar tipos de cancha */
async function cargarTipos() {
  reserva.value.tipoCancha = "";
  reserva.value.canchaId = "";
  canchasFiltradas.value = [];

  const res = await axios.get(`/canchas/${reserva.value.recintoId}`);
  canchas.value = res.data;
  tipos.value = [...new Set(res.data.map((c) => c.tipo))];
}

/* Filtrar canchas */
function filtrarCanchas() {
  reserva.value.canchaId = "";
  canchasFiltradas.value = canchas.value.filter(
    (c) => c.tipo === reserva.value.tipoCancha
  );
}

/* Cargar calendario */
async function cargarCalendario() {
  if (!reserva.value.canchaId) return;

  const cancha = canchasFiltradas.value.find(
    (c) => c.id == reserva.value.canchaId
  );
  canchaSeleccionada.value = cancha || { nombre: "", tipo: "" };

  const res = await axios.get(
    `/canchas/${reserva.value.canchaId}/disponibilidad?mes=${mesActual}`
  );

  const mapa = {};
  res.data.forEach((slot) => {
    if (!mapa[slot.fecha]) {
      mapa[slot.fecha] = { fecha: slot.fecha, bloques: {} };
    }
    mapa[slot.fecha].bloques[slot.horaInicio] = {
      inicio: slot.horaInicio,
      fin: slot.horaFin,
      id: slot.id,
      estado: slot.estado?.toLowerCase?.() || "disponible",
    };
  });

  calendario.value = Object.values(mapa).sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );
  semanaActual.value = 0;
}

/* Navegación semanas */
function semanaAnterior() {
  if (semanaActual.value > 0) semanaActual.value--;
}

function semanaSiguiente() {
  if ((semanaActual.value + 1) * 7 < calendario.value.length)
    semanaActual.value++;
}

/* SELECCIÓN */
function seleccionar(fecha, bloque) {
  reserva.value.fecha = fecha;
  reserva.value.horaInicio = bloque.inicio;
  reserva.value.horaFin = bloque.fin;
  reserva.value.slotId = bloque.id;

  datosModal.value = {
    fecha,
    horaInicio: bloque.inicio,
    horaFin: bloque.fin,
    nombre: user?.nombre || "Sin nombre",
    email: user?.email || "Sin email",
  };

  mostrarModal.value = true;
}

/* FUNCIÓN QUE ESTABA FALTANDO */
function isSelected(fecha, hora) {
  return reserva.value.fecha === fecha && reserva.value.horaInicio === hora;
}

/* MODAL */
function cerrarModal() {
  mostrarModal.value = false;
}

/* CÁLCULO DE PRECIOS */
const precioBase = computed(() => precios[canchaSeleccionada.value.tipo] || 0);

const descuentoActivo = computed(() => {
  const h = Number(reserva.value.horaInicio.split(":")[0]);
  return h >= 8 && h < 18;
});

const descuento = computed(() =>
  descuentoActivo.value ? Math.round(precioBase.value * 0.2) : 0
);

const precioFinal = computed(() => precioBase.value - descuento.value);

/* Pago */
async function simularPago() {
  mostrarModal.value = false;

  try {
    const body = {
      recintoId: Number(reserva.value.recintoId),
      usuarioId: Number(reserva.value.usuarioId),
      canchaId: Number(reserva.value.canchaId),
      slotId: Number(reserva.value.slotId),
      precio: Number(precioFinal.value),
      fecha: reserva.value.fecha,
      horaInicio: reserva.value.horaInicio,
      horaFin: reserva.value.horaFin
    };

    // 1) Crear transacción Webpay (usando /api)
    const { data } = await axios.post("/pagos/crear", body);

    // 2) Redirigir a Webpay con token
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.url;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "token_ws";
    input.value = data.token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();

  } catch (err) {
    console.error(err);
    mensaje.value = "❌ Error al iniciar pago";
  }
}



/* Lifecycle */
onMounted(() => {
  cargarRecintos();
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", cerrarModal);
});
</script>
<style>
/* ------ ESTILO GLOBAL DEL COMPONENTE ------ */
.crear-reserva {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.crear-reserva h1 {
  font-size: 32px;
  font-weight: 800;
  color: #333;
  margin-bottom: 5px;
}

.descripcion {
  color: #666;
  font-size: 15px;
  margin-bottom: 25px;
}

/* ------ CAMPOS ------ */
.campo {
  margin: 15px auto;
  display: flex;
  flex-direction: column;
  max-width: 320px;
  text-align: left;
}

.campo label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #444;
}

.campo select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #bbb;
  background: #ffffff;
  font-size: 15px;
  color: #333;
  transition: 0.2s;
}

.campo select:hover {
  border-color: #6c63ff;
}

.campo select:focus {
  border-color: #6c63ff;
  box-shadow: 0 0 6px #6c63ff55;
  outline: none;
}

/* ------ NAVEGACIÓN SEMANAL ------ */
.nav-semanal {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 25px 0;
}

.nav-semanal button {
  background: #6c63ff;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.nav-semanal button:hover {
  background: #5848d3;
}

.nav-semanal span {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* ------ GRID DE DÍAS ------ */
.tarjetas-container {
  margin-top: 20px;
}

.titulo-bonito {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.grid-dias {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 18px;
}

/* ------ TARJETAS DE DÍAS ------ */
.tarjeta-dia {
  background: #ffffff;
  border-radius: 18px;
  padding: 15px;
  border: 1px solid #e2e2e2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: 0.25s ease;
}

.tarjeta-dia:hover {
  transform: translateY(-4px);
  box-shadow: 0px 10px 20px rgba(0,0,0,0.08);
}

.titulo-dia {
  font-size: 17px;
  font-weight: bold;
  color: #444;
  margin-bottom: 10px;
}

/* ------ HORAS ------ */
.lista-horas {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hora-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.15s;
}

/* DISPONIBLE */
.disponible {
  background: #eaffe6;
  border: 1px solid #99db94;
}

.disponible:hover {
  background: #dafad4;
}

/* OCUPADO */
.ocupado {
  background: #ffe5e5;
  border: 1px solid #ff9d9d;
  opacity: 0.6;
  cursor: not-allowed;
}

/* SELECCIONADO */
.seleccionado {
  background: #d8e6ff;
  border: 1px solid #4c84ff;
  box-shadow: 0 0 6px #4c84ff66;
}

/* ICONOS */
.estado-icono {
  font-size: 16px;
}

.texto-hora {
  font-weight: 600;
}

/* ------ MODAL ------ */
.resergo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
}

.resergo-modal {
  background: white;
  padding: 32px;
  border-radius: 14px;
  width: 420px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.35);
  animation: modalIn 0.25s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.btn-pagar {
  background: #4c84ff;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}

.btn-pagar:hover {
  background: #3367dd;
}

.btn-cerrar {
  background: #ccc;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  margin-top: 10px;
  cursor: pointer;
}

.btn-cerrar:hover {
  background: #b2b2b2;
}

/* ANIMACIÓN GENERAL */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
