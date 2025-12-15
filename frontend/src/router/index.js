import { createRouter, createWebHistory } from "vue-router";

// ============================
//         VISTAS
// ============================
import HomeView from "../views/HomeView.vue";
import LoginUsuarioView from "../views/LoginUsuarioView.vue";
import LoginAdminView from "../views/LoginAdminView.vue";
import LoginDuenoView from "../views/LoginDuenoView.vue";
import RegisterUsuarioView from "../views/RegisterUsuarioView.vue";
import RegisterAdminView from "../views/RegisterAdminView.vue";

import PanelAdminView from "../views/PanelAdmin.vue";
import ReservasAdminView from "../views/ReservasAdminView.vue";
import GestionarCanchasAdminView from "../views/GestionarCanchasAdminView.vue";

import RecintosView from "../views/Recintos.vue";
import PanelDuenoView from "../views/PanelDuenoView.vue";
import ProfileView from "../views/ProfileView.vue";
import ReservasView from "../views/Reservas.vue";
import CrearReservaView from "../views/CrearReserva.vue";
import MisReservasView from "../views/MisReservas.vue";

import SolicitudesAdminView from "../views/SolicitudesAdmin.vue";

const routes = [
  // ============================
  //       🏠 PÚBLICO
  // ============================
  { path: "/", component: HomeView },

  {
    path: "/quienes-somos",
    name: "QuienesSomos",
    component: () => import("../views/QuienesSomosView.vue"),
  },
  {
    path: "/contacto",
    name: "Contacto",
    component: () => import("../views/ContactoView.vue"),
  },

  // ============================
  //    🔐 LOGIN
  // ============================
  { path: "/login-usuario", component: LoginUsuarioView, meta: { guest: true } },
  { path: "/login-admin", component: LoginAdminView, meta: { guest: true } },
  { path: "/login-dueno", component: LoginDuenoView, meta: { guest: true } },

  // ============================
  //    📝 REGISTRO
  // ============================
  { path: "/register-usuario", component: RegisterUsuarioView, meta: { guest: true } },
  { path: "/register-admin", component: RegisterAdminView, meta: { guest: true } },
  {
    path: "/register-dueno",
    component: () => import("../views/RegisterDuenoView.vue"),
    meta: { guest: true },
  },

  // ============================
  //  👤 CLIENTE / USUARIO
  // ============================
  {
    path: "/profile",
    component: ProfileView,
    meta: { auth: true, roles: ["cliente", "usuario"] },
  },
  {
    path: "/reservas",
    component: ReservasView,
    meta: { auth: true, roles: ["cliente", "usuario"] },
  },
  {
    path: "/mis-reservas",
    component: MisReservasView,
    meta: { auth: true, roles: ["cliente", "usuario"] },
  },
  {
    path: "/recintos",
    component: RecintosView,
    meta: { auth: true, roles: ["cliente", "usuario"] },
  },
  {
    path: "/crear-reserva",
    component: CrearReservaView,
    meta: { auth: true, roles: ["cliente", "usuario"] },
  },

  // ============================
  //       🛠 ADMIN
  // ============================
  {
    path: "/panel-admin",
    component: PanelAdminView,
    meta: { auth: true, roles: ["admin"] },
  },
  {
    path: "/admin/reservas",
    component: ReservasAdminView,
    meta: { auth: true, roles: ["admin"] },
  },
  {
    path: "/panel-admin/canchas",
    component: GestionarCanchasAdminView,
    meta: { auth: true, roles: ["admin"] },
  },
  {
    path: "/panel-admin/recintos",
    component: RecintosView,
    meta: { auth: true, roles: ["admin"] },
  },
  {
    path: "/admin/solicitudes",
    component: SolicitudesAdminView,
    meta: { auth: true, roles: ["admin"] },
  },
  {
    path: "/panel-admin/canchas/:id/disponibilidad",
    component: () => import("../views/GestionarDisponibilidadCancha.vue"),
    meta: { auth: true, roles: ["admin"] },
  },

  // ============================
  //        🧑‍🏫 DUEÑO
  // ============================
  {
    path: "/panel-dueno",
    component: PanelDuenoView,
    meta: { auth: true, roles: ["dueño"] },
  },
  {
    path: "/dueno/crear-recinto",
    component: () => import("../views/CrearRecintoDuenoView.vue"),
    meta: { auth: true, roles: ["dueño"] },
  },
  {
    path: "/panel-dueno/reservas",
    component: () => import("../views/ReservasDuenoView.vue"),
    meta: { auth: true, roles: ["dueño"] },
  },

  // ============================
  //       💳 WEBPAY
  // ============================
  {
    path: "/webpay/retorno",
    name: "WebpayRetorno",
    component: () => import("../views/WebpayRetorno.vue"),
  },
  {
    path: "/resultado",
    name: "ResultadoPago",
    component: () => import("../views/ResultadoPago.vue"),
  },

  // ============================
  //         ❌ 404
  // ============================
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
