<template>
  <div class="admin-panel flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">

    <div class="bg-white rounded-2xl shadow-lg p-10 w-full max-w-4xl text-center">

      <h1 class="text-4xl font-extrabold text-blue-700 mb-4">
        👋 Bienvenido Administrador
      </h1>

      <p class="text-gray-700 text-lg mb-10">
        Selecciona una opción para gestionar el sistema ReserGO.
      </p>

      <div class="flex flex-wrap justify-center gap-4">

        <!-- ✅ Ver Reservas -->
        <button
          class="option-btn bg-blue-600 hover:bg-blue-700"
          @click="$router.push('/admin/reservas')"
        >
          📋 Ver Reservas
        </button>

        <!-- ✅ Gestionar Canchas -->
        <button
          class="option-btn bg-green-600 hover:bg-green-700"
          @click="$router.push('/panel-admin/canchas')"
        >
          🏟️ Gestionar Canchas
        </button>

        <!-- ✅ Gestionar Recintos -->
        <button
          class="option-btn bg-purple-600 hover:bg-purple-700"
          @click="$router.push('/panel-admin/gestionar-recintos')"
        >
          🏢 Gestionar Recintos
        </button>

        <!-- ✅ Cerrar sesión -->
        <button
          class="option-btn bg-red-600 hover:bg-red-700"
          @click="logout"
        >
          🚪 Cerrar Sesión
        </button>

      </div>

    </div>

  </div>
</template>

<script setup>
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRol");
  window.location.href = "/login-admin";
}
</script>

<style scoped>
.admin-panel {
  font-family: "Inter", sans-serif;
}

.option-btn {
  padding: 14px 26px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  min-width: 220px;
  transition: 0.2s;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}
</style>
