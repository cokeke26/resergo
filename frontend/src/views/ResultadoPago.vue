<template>
  <div class="resultado-container">
    <h1 v-if="estado === 'ok'" class="exito">✅ Pago exitoso</h1>
    <h1 v-else class="error">❌ Pago rechazado</h1>

    <p>Redirigiendo a tus reservas...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const estado = ref(route.query.estado || "error");

onMounted(() => {
  // Espera 1.5 segundos y redirige automáticamente
  setTimeout(() => {
    router.push("/mis-reservas");
  }, 1500);
});
</script>

<style scoped>
.resultado-container {
  text-align: center;
  padding-top: 120px;
  font-size: 22px;
}

.exito {
  color: #00c851;
}

.error {
  color: #ff4444;
}

p {
  margin-top: 10px;
  font-size: 16px;
  color: #666;
}
</style>
