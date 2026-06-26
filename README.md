# 🍔 DiDi Food (versión simple)

Proyecto de Base de Datos NO relacional con **MongoDB**.
Tiene dos lados:
- **Usuario** (`/usuario`): se registra, inicia sesión, ve restaurantes, pide
  comida (se le descuenta SU saldo), recarga saldo y revisa su historial.
- **Admin** (`/admin`): inicia sesión como admin, ve los pedidos EN TIEMPO REAL
  y cambia su estado.

Hay **registro y login** sencillos: la sesión se guarda en el `localStorage`
del navegador (sin JWT ni librerías). Las contraseñas se comparan en texto
plano porque es una práctica escolar.

## 🧩 Tecnologías
- **Backend:** Node.js + Express + MongoDB + Socket.io
- **Frontend:** React (con Vite)
- **Base de datos:** MongoDB (3 colecciones: usuarios, restaurantes, pedidos)

---

## 📂 Cómo está organizado
```
didi-food/
├── backend/        <- el servidor (Node + Mongo + Socket.io)
│   ├── db.js       <- conexión a MongoDB
│   ├── seed.js     <- datos de ejemplo
│   └── server.js   <- todas las rutas
└── frontend/       <- la página web (React)
    └── src/
        ├── pages/  <- Usuario, Restaurante y Admin
        ├── api.js  <- dirección del backend
        └── socket.js
```

---

## ▶️ Cómo correrlo (paso a paso)

### Paso 1 — Tener MongoDB listo
Tienes 2 opciones:
- **A)** Instalar MongoDB en tu compu (queda en `localhost`). No cambias nada.
- **B)** Usar MongoDB Atlas (en internet). En ese caso abre `backend/db.js`
  y pega tu cadena de conexión donde dice la nota.

### Paso 2 — Prender el BACKEND
Abre una terminal y escribe:
```
cd backend
npm install
npm run seed     <- esto carga los datos de ejemplo (solo la 1ra vez)
npm start        <- esto prende el servidor
```
Debe decir: `Servidor encendido en http://localhost:3000 🚀`
👉 Deja esta terminal abierta.

### Paso 3 — Prender el FRONTEND
Abre OTRA terminal y escribe:
```
cd frontend
npm install
npm run dev
```
Te dará una dirección como `http://localhost:5173`.

### Paso 4 — Entrar (registro y login)
La página abre en el **login** (`http://localhost:5173/login`).

**Para entrar como USUARIO:**
- Opción A) Crea tu cuenta en **"Regístrate aquí"**: pones nombre, correo y
  contraseña. Empiezas con **$500** de saldo y entras directo.
- Opción B) Usa el usuario de ejemplo del seed:
  - correo: `zylly@didi.com`
  - contraseña: `1234`

**Para entrar como ADMIN** (mismo formulario de login):
- correo: `admin@didi.com`
- contraseña: `admin123`

Como su usuario tiene `esAdmin: true`, al iniciar sesión te manda solito a
`/admin`. Los usuarios normales van a `/usuario`.

> Si entras a `/usuario` o `/admin` SIN haber iniciado sesión, te regresa al
> login. Usa el botón **"Cerrar sesión"** para salir.

### Cosas que puede hacer el usuario
- **Recargar saldo:** botón "➕ Recargar $100" (se refleja al instante, también
  en la barra de arriba).
- **Ver su historial:** botón "📜 Mis pedidos" (`/usuario/historial`). Ahí ve
  SUS pedidos (del más nuevo al más viejo) y su estado se actualiza en tiempo
  real cuando el admin lo cambia.

### 🧭 Navegación (cómo te mueves sin atorarte)
Todas las pantallas del usuario tienen una **barra de navegación arriba** que
siempre muestra:
- Tu **nombre** y tu **saldo**.
- Botones **🍔 Restaurantes** y **📜 Mis pedidos** para ir de una pantalla a otra.
- **🚪 Cerrar sesión** (borra la sesión y te regresa al login).

Dentro del menú de un restaurante hay un botón **← Regresar** para volver a la
pantalla anterior.

**Flujo completo (sin callejones sin salida):**
```
login  →  lista de restaurantes  →  menú del restaurante  →  confirmar pedido
       →  (te lleva solo a) "Mis pedidos"  →  y desde la barra vuelves a
          "Restaurantes" para pedir otra vez.
```

### Panel del admin
- Encabezado con el **nombre del admin** y su botón **🚪 Cerrar sesión**.
- Lista de pedidos **en tiempo real** (aparecen solos cuando alguien pide).
- Botones en cada pedido para cambiar su estado: **preparando**, **en camino**,
  **entregado**. El usuario ve ese cambio al instante en su historial.

### 🚥 Seguimiento del pedido por etapas
Cada pedido ahora muestra una **barra de progreso** con 4 etapas en orden:
**pendiente → preparando → en camino → entregado**. Cada etapa es un círculo con
su nombre; los círculos por los que ya pasó el pedido se ven en **naranja** (con
✓) y los que faltan en **gris**, y una línea naranja se va llenando según avanza.

- En **"Mis pedidos"** (usuario) la barra muestra en qué etapa va su comida.
- En el **panel del admin** la barra aparece arriba de los botones.
- Como ya usamos **Socket.io**, cuando el admin avanza el estado, la barra del
  usuario avanza **al instante**, sin recargar.

> Las 4 etapas están definidas en UN SOLO lugar: `frontend/src/etapas.js`. Si
> quieres cambiarlas o agregar una, solo editas ese archivo.

> 🎨 La barra usa 3 colores: **verde** las etapas ya completadas (con ✓),
> **naranja** la etapa actual (resaltada) y **gris** las que faltan.

### 📦 ¿Qué pasa cuando un pedido se marca "entregado"?
- En el **panel del admin** el pedido **desaparece** de la lista (el admin solo
  ve los pedidos en proceso: pendiente, preparando, en camino). Esto se hace
  **filtrando** lo que se muestra: el pedido **NO se borra** de la base de datos,
  sigue guardado.
- En el **historial del usuario** el pedido entregado **sí se sigue viendo**,
  pero marcado como completado: con un **fondo verde**, la barra de progreso
  llena y un mensaje **"✅ ¡Tu pedido llegó! 🎉"**.
- Todo en **tiempo real**: en cuanto el admin lo marca "entregado", se quita solo
  de su lista y al usuario le aparece como entregado al instante (Socket.io).

**Botón "⏭ Avanzar a la siguiente etapa" (admin):** además de los botones de
siempre, el admin tiene un botón que pasa el pedido a la etapa que sigue de forma
automática (de *pendiente* a *preparando*, de *preparando* a *en camino*, etc.).
Cuando el pedido llega a **entregado**, el botón se **deshabilita**.

---

## 📱 Abrir el USUARIO desde el celular

1. La compu y el celular deben estar en el **mismo wifi**.
2. En la compu busca tu IP local: abre una terminal y escribe `ipconfig`
   (en Windows). Busca algo como `192.168.1.70`.
3. Abre el archivo `frontend/src/api.js` y cambia la línea por tu IP:
   ```js
   export const URL_BACKEND = "http://192.168.1.70:3000";
   ```
4. En el celular, en el navegador, abre:
   `http://192.168.1.70:5173/usuario`
   (usa TU IP).

---

## ✨ ¿Cómo se ve la "magia" del tiempo real?
1. En la laptop deja abierto `/admin`.
2. En el celular haz un pedido.
3. ¡El pedido aparece SOLITO en la pantalla del admin! (gracias a Socket.io)
4. El admin cambia el estado (ej. "en camino") y el usuario lo vería al instante.

---

## 🗂️ Las 3 colecciones de MongoDB
- **usuarios:** `{ nombre, correo, contraseña, saldo, esAdmin }`
- **restaurantes:** `{ nombre, imagen, menu: [ { nombre, precio } ] }`
  (el menú va DENTRO del restaurante = embebido)
- **pedidos:** `{ usuarioId, usuario, restaurante, productos, total, estado, fecha }`
  (guardamos `usuarioId` para saber de QUIÉN es cada pedido)
