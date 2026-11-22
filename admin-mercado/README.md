# Mercado Municipal — Panel Administrativo y de Locatarios

Sistema de gestión para un mercado municipal, con dos paneles independientes: uno para **administradores** (gestión completa del mercado) y otro para **locatarios** (autogestión de su puesto, pagos e incidencias).

## Stack

- **Frontend:** React + React Router, Vite
- **Backend:** Node.js + Express
- **Base de datos:** MySQL (procedimientos almacenados para toda la lógica de negocio)
- **Autenticación:** JWT (login), sesión guardada en `localStorage`

Seguridad: el login y el registro son las únicas rutas públicas del backend. Las demás piden el token en el encabezado Authorization y revisan el rol: las de /api/locatario solo aceptan locatarios y toman el id del token, y las de gestión solo aceptan administradores. El frontend agrega el token a cada petición desde src/authFetch.js y regresa al login si el token vence (dura 2 horas).

---

## Base de datos

Ejecuta backend/dbMercado.sql en MySQL 8. Crea la base db_merc con 6 tablas y 38 procedimientos almacenados, y carga 5 usuarios de prueba. El administrador de prueba es carlos@mercado.com con contraseña admin123.

## Variables de entorno

El backend lee su configuración de backend/.env, que no se sube al repositorio. Copia la plantilla y llénala:

```bash
cd backend
cp .env.example .env
```

JWT_SECRET es obligatoria y el servidor no arranca sin ella. Las variables de Twilio solo se necesitan para los recordatorios de pago.

---

## Backend

### Instalación

```bash
cd backend
npm install
npm run dev
```

Por defecto corre en el puerto 3000. El frontend toma la dirección del backend de la variable VITE_API_URL.

### Endpoints principales

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| Login | POST | `/api/login` | Autenticación, regresa JWT + datos del usuario |
| Pagos (admin) | GET | `/api/pagos/puestos?mes=&anio=` | Estado de pago por mes |
| | GET | `/api/pagos/puestos?todos=1` | Historial completo |
| | POST | `/api/pagos` | Registrar pago de un puesto |
| | POST | `/api/pagos/generar-mes` | Generar cargos del mes para todos los locatarios asignados |
| | POST | `/api/pagos/actualizar-vencidos` | Marcar como vencidos los pagos ya pasados de fecha |
| Incidencias (admin) | GET | `/api/incidencias` | Listar todas |
| | GET | `/api/incidencias/abiertas` | Solo abiertas (para notificaciones) |
| | POST | `/api/incidencias` | Abrir una nueva |
| | POST | `/api/incidencias/responder` | Responder (pasa a "En proceso") |
| | POST | `/api/incidencias/cerrar` | Cerrar (pasa a "Resuelta") |
| Avisos (admin) | GET | `/api/avisos` | Listar vigentes |
| | POST | `/api/avisos` | Publicar nuevo |
| | PUT | `/api/avisos/:id_aviso` | Editar |
| | DELETE | `/api/avisos/:id_aviso` | Archivar (borrado suave) |
| | POST | `/api/avisos/archivar-vencidos` | Archivar automáticamente los vencidos |
| Administradores | GET | `/api/administradores` | Listar todos |
| | POST | `/api/administradores` | Registrar nuevo |
| | PUT | `/api/administradores/:id_usuario/estado` | Activar/desactivar |
| Locatario | GET | `/api/locatario/mi-info?id_locatario=` | Info del locatario logueado |
| | PUT | `/api/locatario/mi-perfil` | Editar giro comercial y contacto |
| | GET | `/api/locatario/mis-pagos?id_locatario=` | Su historial de pagos |
| | POST | `/api/locatario/pagar` | Pagar un mes eligiendo tipo de pago |
| | GET | `/api/locatario/mis-incidencias?id_locatario=` | Sus incidencias |
| | POST | `/api/locatario/incidencias` | Reportar una nueva |

---

## Frontend

### Instalación

```bash
cd frontend
npm install
npm run dev
```

### Rutas

**Públicas:**
- `/login`
- `/registro`

**Panel de administrador** (navbar de admin):
- `/dashboard`
- `/locatarios`
- `/puestos`
- `/pagos`
- `/incidencias`
- `/administradores`

**Panel de locatario** (navbar propio, sin el de admin):
- `/locatario/inicio`
- `/locatario/pagos`
- `/locatario/incidencias`

El login redirige según el `rol` que regresa el backend: `administrador` → `/dashboard`, cualquier otro rol → `/locatario/inicio`.

---

## Funcionalidades por pantalla

### Admin — Pagos
- Ver estado de pago por mes o el historial completo ("Todos los meses").
- Generar los cargos pendientes del mes para todos los locatarios asignados.
- Registrar el pago de un locatario (elige fecha, el mes queda fijo según la fila).
- Descargar un comprobante en PDF (usa el diálogo de impresión del navegador, sin dependencias extra).

### Admin — Incidencias y Avisos
- Ver, responder y cerrar incidencias de cualquier locatario.
- Registrar una incidencia a nombre de un locatario.
- Publicar avisos, editarlos inline ("Administrar Avisos") y archivarlos.
- Archivado automático de avisos vencidos al cargar la pantalla.

### Admin — Administradores
- Ver todos los administradores del sistema (activos e inactivos).
- Agregar nuevos.
- Activar/desactivar (no permite desactivar al único admin activo).

### Locatario — Inicio
- Ve su puesto, giro comercial, estado de pago del mes y datos de contacto.
- Puede editar su giro comercial, teléfono y correo.
- Ve los 3 avisos más recientes.

### Locatario — Mis pagos
- Ve su historial completo de pagos.
- Puede pagar los meses pendientes/vencidos, eligiendo tipo de pago (efectivo, transferencia, tarjeta).

### Locatario — Mis incidencias
- Ve únicamente las incidencias que él mismo reportó (no las de otros locatarios).
- Puede reportar una nueva y ver la respuesta del administrador cuando exista.

---

## Pendientes / mejoras futuras

- **Protección de rutas por rol en el frontend** (`ProtectedRoute`). El backend ya rechaza al rol equivocado, pero la pantalla todavía se dibuja vacía si un locatario escribe `/pagos` en la URL.
- **Contraseñas cifradas.** Se guardan en texto plano; bcrypt ya está en las dependencias pero no se usa.
- **PDF real desde el backend** (actualmente el comprobante se genera con el diálogo de impresión del navegador, no como archivo descargable generado en servidor).
- **Notificaciones en tiempo real** conectadas de verdad a la campanita del Navbar del admin (endpoint `/api/incidencias/abiertas` ya existe, falta conectarlo ahí).