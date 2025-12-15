<template>
  <div class="ver-reservas-admin">
    <h1>📋 Reservas Registradas</h1>
    <p class="descripcion">Aquí puedes ver, editar o eliminar las reservas creadas por los usuarios.</p>

    <div v-if="cargando" class="loading">Cargando reservas...</div>

    <table v-else class="tabla-reservas">
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Email</th>
          <th>Recinto</th>
          <th>Cancha</th>
          <th>Fecha</th>
          <th>Hora Inicio</th>
          <th>Hora Fin</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reservas" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.Usuario?.nombre }}</td>
          <td>{{ r.Usuario?.email }}</td>
          <td>{{ r.recinto?.nombre }}</td>
          <td>{{ r.Cancha?.nombre }} ({{ r.Cancha?.tipo }})</td>
          <td>{{ formatearFecha(r.fecha) }}</td>
          <td>{{ r.horaInicio }}</td>
          <td>{{ r.horaFin }}</td>
          <td>
            <button class="btn-editar" @click="editarReserva(r)">✏️ Editar</button>
            <button class="btn-eliminar" @click="eliminarReserva(r)">🗑️ Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!reservas.length && !cargando" class="sin-reservas">
      No hay reservas registradas.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/axios.js";

const reservas = ref([]);
const cargando = ref(true);

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-");
  return `${d}-${m}-${y}`;
};

// =======================================================
// 🔹 Cargar reservas del admin
// =======================================================
async function cargarReservasAdmin() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:4000/api/reservas/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    reservas.value = res.data;
  } catch (error) {
    console.error("❌ Error al obtener reservas del administrador:", error);
    alert("No se pudieron cargar las reservas.");
  } finally {
    cargando.value = false;
  }
}

// =======================================================
// ✏️ Editar reserva (solo admin)
// =======================================================
async function editarReserva(reserva) {
  const nuevaHoraInicio = prompt("Nueva hora de inicio (HH:mm)", reserva.horaInicio);
  const nuevaHoraFin = prompt("Nueva hora de fin (HH:mm)", reserva.horaFin);
  if (!nuevaHoraInicio || !nuevaHoraFin) return;

  const motivo = prompt("Motivo de la edición (opcional)", "Modificación de horario");
  const usuarioId = localStorage.getItem("userId") || 1;

  try {
    const token = localStorage.getItem("token");

    const body = {
      fecha: reserva.fecha,
      horaInicio: nuevaHoraInicio,
      horaFin: nuevaHoraFin,
      recintoId: reserva.recinto?.id || reserva.recintoId,
      canchaId: reserva.Cancha?.id || reserva.canchaId,
      usuarioId,
      motivo,
    };

    const res = await axios.put(
      `http://localhost:4000/api/reservas/admin/${reserva.id}`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(res.data.msg || "Reserva actualizada correctamente");
    await cargarReservasAdmin();
  } catch (error) {
    console.error("❌ Error al editar reserva:", error);
    alert(error.response?.data?.error || "Error al editar la reserva");
  }
}

// =======================================================
// 🗑️ Eliminar reserva (mejorado con validación y confirmación)
// =======================================================
async function eliminarReserva(reserva) {
  try {
    const confirmar = confirm(`¿Seguro que quieres eliminar la reserva #${reserva.id}?`);
    if (!confirmar) return;

    const motivo = prompt(
      "Motivo de la eliminación (opcional)",
      "Eliminación de reserva por administrador"
    );
    const usuarioId = localStorage.getItem("userId") || 1;
    const token = localStorage.getItem("token");

    // 🔹 Intento normal
    const res = await axios.delete(`http://localhost:4000/api/reservas/${reserva.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { usuarioId, motivo },
    });

    alert(res.data.msg || "✅ Reserva eliminada correctamente");
    await cargarReservasAdmin();
  } catch (err) {
    // 🔹 Si el backend devuelve advertencia o conflicto con disponibilidad
    if (err.response?.status === 400 && err.response.data?.reservasAfectadas) {
      const continuar = confirm(
        `⚠️ Esta reserva está dentro de una disponibilidad activa.\n\n¿Deseas cancelarla automáticamente junto con las reservas afectadas?`
      );

      if (continuar) {
        const token = localStorage.getItem("token");
        const forceRes = await axios.delete(
          `http://localhost:4000/api/reservas/${reserva.id}?force=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert(
          `✅ ${forceRes.data.msg}\nReservas canceladas: ${forceRes.data.reservasCanceladas || 1}`
        );
        await cargarReservasAdmin();
      } else {
        alert("Operación cancelada. No se eliminó la reserva.");
      }
    } else {
      console.error("❌ Error al eliminar reserva:", err);
      alert(err.response?.data?.error || "Error al eliminar la reserva");
    }
  }
}

onMounted(cargarReservasAdmin);
</script>

<style scoped>
.ver-reservas-admin {
  padding: 60px 30px;
  background: #f8fafc;
  min-height: 100vh;
  text-align: center;
}

/* 🔹 Título y descripción */
h1 {
  color: #007bff;
  margin-bottom: 10px;
}
.descripcion {
  color: #555;
  margin-bottom: 25px;
}
.loading {
  color: #555;
  font-style: italic;
}

/* 🔹 Tabla principal */
.tabla-reservas {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  border-collapse: collapse;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
}

th {
  background-color: #007bff;
  color: white;
  text-transform: uppercase;
}

tr:hover {
  background-color: #f1f1f1;
}

/* 🔹 Contenedor de botones */
td > button {
  margin: 4px;
  display: inline-block;
}

/* 🔸 Botón editar */
.btn-editar {
  background: #ffc107;
  color: black;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 500;
}
.btn-editar:hover {
  background: #e0a800;
}

/* 🔸 Botón eliminar */
.btn-eliminar {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 500;
}
.btn-eliminar:hover {
  background: #c82333;
}

/* 🔹 Texto cuando no hay reservas */
.sin-reservas {
  margin-top: 30px;
  color: #777;
}

/* 🔹 Responsive */
@media (max-width: 768px) {
  th, td {
    font-size: 14px;
    padding: 8px;
  }

  .tabla-reservas {
    width: 95%;
  }

  td > button {
    display: block;
    width: 100%;
    margin: 5px 0;
  }

  .btn-editar,
  .btn-eliminar {
    font-size: 14px;
    padding: 8px 0;
  }
}
</style>
