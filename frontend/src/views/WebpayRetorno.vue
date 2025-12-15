<template>
  <div class="procesando">
    Procesando pago...
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const token = new URLSearchParams(window.location.search).get("token_ws");
  if (!token) return (window.location.href = "/resultado?estado=error");

  // 🔥 IMPORTANTE: NO USAR axios
  window.location.href = `http://localhost:4000/api/pagos/confirmar?token_ws=${token}`;
});
</script>

<style>
.procesando {
  margin-top: 200px;
  text-align: center;
  font-size: 22px;
  color: #444;
}
</style>
