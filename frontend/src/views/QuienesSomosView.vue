<template>
  <div class="quienes-somos-page py-5">
    <div class="container text-center">
      <h1 class="fw-bold text-primary mb-4">Quiénes Somos</h1>

      <p class="lead text-muted mb-4">
        ReserGO es una plataforma creada para facilitar la gestión de reservas deportivas,
        conectando a deportistas y administradores de recintos de manera eficiente.
      </p>

      <p class="text-muted mb-4" style="max-width: 800px; margin: 0 auto;">
        Nuestro proyecto nació a partir de la necesidad detectada en recintos deportivos que aún
        gestionan sus horarios mediante llamadas, WhatsApp o métodos manuales, provocando problemas
        de duplicidad, mala organización y pérdida de tiempo. ReserGO moderniza este proceso,
        ofreciendo una interfaz moderna, intuitiva y accesible para todos.
      </p>

      <div class="row mt-5 justify-content-center">
        <div class="col-md-4 mb-3">
          <div class="p-4 bg-white shadow-sm rounded h-100">
            <h5 class="fw-bold text-primary">Nuestra Misión</h5>
            <p class="text-muted mt-2">
              Optimizar la gestión deportiva mediante herramientas digitales simples,
              rápidas y efectivas para recintos y usuarios.
            </p>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="p-4 bg-white shadow-sm rounded h-100">
            <h5 class="fw-bold text-primary">Nuestro Objetivo</h5>
            <p class="text-muted mt-2">
              Entregar un sistema completo de reserva, administración, notificación
              y control de horarios que facilite la vida deportiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quienes-somos-page {
  background: #f8f9fa;
}
.bg-white {
  transition: transform 0.2s ease;
}
.bg-white:hover {
  transform: translateY(-5px);
}
</style>
