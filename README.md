===========================================
           RESERGO - SISTEMA WEB
      Gestión de Reservas Deportivas
===========================================

Este documento contiene las instrucciones necesarias
para instalar, configurar y ejecutar la aplicación
ReserGO (frontend + backend + base de datos).

-------------------------------------------
1. DESCRIPCIÓN DEL PROYECTO
-------------------------------------------
ReserGO es una plataforma web para gestionar reservas
de recintos deportivos (canchas de fútbol, pádel, tenis, etc.).
Permite administrar horarios, evitar reservas duplicadas
y realizar pagos en línea mediante Transbank Webpay.

La aplicación incluye funcionalidades para usuarios
(clientes) y administradores/dueños de recintos.

-------------------------------------------
2. TECNOLOGÍAS UTILIZADAS
-------------------------------------------
Frontend:
- Vue 3
- Vite
- Axios

Backend:
- Node.js + Express
- Prisma ORM
- JSON Web Tokens (JWT)

Base de Datos:
- PostgreSQL

Pasarela de Pago:
- Transbank Webpay REST

-------------------------------------------
3. REQUISITOS PREVIOS
-------------------------------------------
Para ejecutar este proyecto necesitas:

- Node.js v16 o superior
- NPM v8 o superior
- PostgreSQL (local o en la nube)
- Archivo ".env" configurado en backend
- Archivo ".env" configurado en frontend (si aplica)

-------------------------------------------
4. INSTALACIÓN DEL BACKEND
-------------------------------------------
1. Abrir la carpeta "backend/" en terminal.
2. Instalar dependencias:
   npm install

3. Crear archivo .env con lo siguiente:

   DATABASE_URL="postgresql://usuario:password@host:puerto/base"
   JWT_SECRET="CualquierClaveSegura"
   PORT=4000

   // Variables Transbank:
   TBK_COMMERCE_CODE=
   TBK_API_KEY_ID=
   TBK_API_KEY_SECRET=
   TBK_ENV=production

4. Ejecutar migraciones o aplicar tu script.sql si es necesario.

5. Iniciar el servidor backend:
   npm run dev

El backend quedará disponible en:
http://localhost:4000

-------------------------------------------
5. INSTALACIÓN DEL FRONTEND
-------------------------------------------
1. Abrir la carpeta "frontend/" en terminal.
2. Instalar dependencias:
   npm install

3. Crear archivo ".env" con la URL del backend:

   VITE_API_URL="http://localhost:4000/api"

4. Ejecutar la aplicación web:
   npm run dev

El frontend quedará disponible en:
http://localhost:5173 (o similar)

-------------------------------------------
6. FUNCIONALIDADES PRINCIPALES
-------------------------------------------
Usuario/Cliente:
- Registro e inicio de sesión
- Buscar recintos y canchas
- Consultar disponibilidad semanal
- Crear reservas en línea
- Evitar reservas duplicadas (anti-solapamiento)
- Ver "Mis Reservas"
- Cancelar/modificar reservas
- Pagar mediante Webpay
- Recibir comprobante y confirmación

Administrador/Dueño:
- CRUD de recintos y canchas
- Configurar disponibilidad horaria
- Gestión de reservas (crear/editar/cancelar)
- Precios por franja horaria
- Políticas de cancelación/reembolsos
- Registro de pagos manuales
- Reportes e historial

-------------------------------------------
7. ESTRUCTURA DEL PROYECTO
-------------------------------------------
ReserGO/
   backend/
      prisma/
      src/
      script.sql
      package.json

   frontend/
      src/
      public/
      package.json

-------------------------------------------
8. USUARIOS DE PRUEBA
-------------------------------------------
Administrador:
email: admin@resergo.cl
password: 123456

Cliente:
email: cliente@resergo.cl
password: 123456

-------------------------------------------
9. EJECUCIÓN COMPLETA (PASO A PASO)
-------------------------------------------
1. Iniciar PostgreSQL
2. Iniciar backend:
   npm run dev

3. Iniciar frontend:
   npm run dev

4. Abrir navegador y acceder a:
   http://localhost:5173

-------------------------------------------
10. CONTACTO
-------------------------------------------
Cualquier duda o problema del sistema puede ser
informado a los desarrolladores:

- José Caro
- Jorge Escobar

===========================================
             FIN DEL README
===========================================
