# 🍔 Yummy (versión simple)

Proyecto de Base de Datos NO relacional con **MongoDB**.
**Yummy** es una app de pedidos de comida con dos lados:
- **Usuario** (`/usuario`): se registra, inicia sesión, **busca restaurantes y
  filtra por categoría**, marca **favoritos** ❤️, pide comida (se le descuenta SU
  saldo), recarga saldo, revisa su historial, **califica con estrellas** ⭐ los
  pedidos entregados y puede **repetir un pedido** 🔁.
- **Admin** (`/admin`): inicia sesión como admin, ve los pedidos EN TIEMPO REAL
  y cambia su estado.

Hay **registro y login** sencillos: la sesión se guarda en el `localStorage`
del navegador (sin JWT ni librerías). Las contraseñas se comparan en texto
plano porque es una práctica escolar.

## 🧩 Tecnologías
- **Backend:** Node.js + Express + MongoDB (driver nativo) + Socket.io
- **Frontend:** React (con Vite) + CSS normal (sin librerías de UI)
- **Base de datos:** MongoDB (6 colecciones: usuarios, restaurantes, productos,
  pedidos, ventas, suscripciones)

> La base de datos sigue llamándose internamente `didifood` (no se ve en la app);
> la marca visible es **Yummy**.

---

## 📂 Cómo está organizado
```
didi-food/
├── backend/        <- el servidor (Node + Mongo + Socket.io)
│   ├── db.js       <- conexión a MongoDB
│   ├── seed.js     <- datos de ejemplo (con categorías)
│   └── server.js   <- todas las rutas
└── frontend/       <- la página web (React)
    └── src/
        ├── pages/       <- Login, Registro, Usuario, Restaurante, Historial, Admin
        ├── components/  <- BarraNavegacion, SeguimientoPedido, Estrellas
        ├── api.js       <- dirección del backend
        └── socket.js
```

---

## ▶️ Cómo correrlo (paso a paso)

### Paso 1 — Tener MongoDB listo
Tienes 2 opciones:
- **A)** Instalar MongoDB en tu compu (queda en `localhost`). No cambias nada.
- **B)** Usar MongoDB Atlas (en internet) con la variable de entorno `MONGO_URL`.

### Paso 2 — Prender el BACKEND
Abre una terminal y escribe:
```
cd backend
npm install
npm run seed     <- esto carga los datos de ejemplo (solo la 1ra vez)
npm start        <- esto prende el servidor
```
Debe decir: `Servidor encendido en el puerto 3000 🚀`
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

---

## ✨ Funciones del usuario

### 🔍 Buscador y categorías
En la pantalla del usuario hay un **buscador** que filtra los restaurantes por
nombre **mientras escribes**, y unos **chips de categoría** (Mexicana, Pizza,
Sushi, Hamburguesas, Postres…) para filtrar con un clic. El filtrado se hace en
el frontend sobre la lista ya cargada (simple y rápido).

### ❤️ Favoritos
Cada restaurante tiene un **corazón** para marcarlo como favorito. Los favoritos
se guardan en el documento del usuario (campo `favoritos`, un arreglo de ids).
Con el chip **"❤️ Favoritos"** puedes ver solo tus favoritos.

### ⭐ Calificaciones
Cuando un pedido llega a **"entregado"**, en tu historial aparecen **estrellas
(1 a 5)** para calificarlo. Una vez calificado, las estrellas quedan fijas. La
calificación se guarda en el pedido (campo `calificacion`). En la tarjeta de
cada restaurante se muestra el **promedio** de estrellas de sus pedidos
entregados (si ya tiene calificaciones).

### 🔁 Repetir pedido
En el historial, cada pedido tiene un botón **"Repetir pedido"** que vuelve a
crear el mismo pedido (mismos productos y total) si te alcanza el saldo. Reusa
la misma lógica de crear pedido.

### 📦 El menú ES el catálogo de productos (con stock real)
El **menú de cada restaurante es directamente su catálogo de `productos`**: ya no
hay un menú embebido dentro del restaurante. Cada producto vive en la colección
`productos` con un campo **`restauranteId`** que dice a qué restaurante pertenece.
Cuando el usuario abre un restaurante, `GET /restaurantes/:id` busca los productos
con ese `restauranteId` y los devuelve como el `menu` (con nombre, precio, stock y
categoría).

Así, en el menú **siempre** se ve el **stock real** de cada producto (ej.
**"Quedan 8 disponibles"**), porque el producto del menú y el del catálogo son el
mismo. Si un producto está **agotado** (stock 0 o menos), se marca como **"Agotado"**
y su botón **"Agregar" se deshabilita**. Al confirmar el pedido, el descuento de
stock usa directamente el `_id` (productoId) de cada producto del carrito. El stock
se lee cada vez que se abre el menú (no requiere tiempo real).

### 💰 Saldo e historial
- **Recargar saldo:** botón "➕ Recargar $100" (se refleja al instante, también
  en la barra de arriba).
- **Ver su historial:** botón "📜 Mis pedidos". Ahí ve SUS pedidos (del más nuevo
  al más viejo) y su estado se actualiza en tiempo real cuando el admin lo cambia.

### 🧭 Navegación
Todas las pantallas del usuario tienen una **barra superior** elegante con el
logo **Yummy**, tu **nombre**, tu **saldo** y botones para moverte
(**Restaurantes**, **Mis pedidos**, **Cerrar sesión**).

---

## 💻 Panel del admin
- Encabezado con el logo **Yummy**, el **nombre del admin** y **Cerrar sesión**.
- Lista de pedidos **en tiempo real** (aparecen solos cuando alguien pide).
- Botones en cada pedido para cambiar su estado: **preparando**, **en camino**,
  **entregado**, más un botón **"⏭ Avanzar a la siguiente etapa"**. El usuario ve
  ese cambio al instante en su historial.

### 🚥 Seguimiento del pedido por etapas
Cada pedido muestra una **barra de progreso** con 4 etapas en orden:
**pendiente → preparando → en camino → entregado**. Las 4 etapas están definidas
en UN SOLO lugar: `frontend/src/etapas.js`.

Cuando un pedido se marca **"entregado"**: desaparece del panel del admin (solo
se filtra lo que se muestra, **no se borra** de la base) y en el historial del
usuario se ve con **fondo verde** y el mensaje **"✅ ¡Tu pedido llegó! 🎉"**.

### 📊 Reportes (calendario por rango, tabla y gráficas)
En la pestaña **Reportes** del panel de gerente se ven el **producto estrella** (el
más vendido), las **ventas por día** y las **ventas por semana**.

- **Calendario por rango:** un **calendario** (librería `react-day-picker`, en modo
  `range`) para **consultar varios días**. El gerente elige un día de inicio y un día
  de fin (o un solo día) y el frontend pide las ventas de ese rango a
  `GET /reportes/ventas-diarias?desde=AAAA-MM-DD&hasta=AAAA-MM-DD`. El backend filtra
  con `find()` usando `$gte`/`$lte` sobre el campo `fecha` (sin aggregate).
- **Tabla completa de ventas:** las ventas del rango se muestran en una tabla clara
  con columnas **Fecha y hora · Restaurante · Productos (nombre × cantidad) · Total ·
  Pedido (id)**. Si hay muchas ventas, la tabla tiene **scroll** interno sin romper el
  diseño.
- **Gráficas de barras:** las ventas por día y por semana se muestran como **gráficas
  de barras** (librería `recharts`) con el verde de acento de Yummy, manteniendo la
  **tabla de apoyo** con los números debajo de cada gráfica.

El calendario usa el verde de acento de Yummy para que combine con el resto del panel.

---

## 🎨 Diseño
La app usa un look **elegante y formal**: paleta sobria con un color de acento
definido en variables CSS (`:root` en `frontend/src/styles.css`), tipografía
**Inter / Poppins** (Google Fonts), tarjetas con sombra suave, botones con
estados claros y todo **responsive** (se ve bien en celular).

---

## 🗂️ Las colecciones de MongoDB
- **usuarios:** `{ nombre, correo, contraseña, saldo, esAdmin, favoritos, lat, lng }`
  (`favoritos` = arreglo de ids de restaurantes favoritos)
- **restaurantes:** `{ nombre, imagen, categoria, lat, lng }`
  (ya **NO** llevan menú embebido; su menú son sus `productos`)
- **productos:** `{ nombre, precio, stock, categoria, restauranteId }`
  (`restauranteId` = a qué restaurante pertenece; este es el menú con stock real)
- **pedidos:** `{ usuarioId, usuario, restaurante, productos: [ { nombre, precio, productoId } ], total, estado, fecha, calificacion }`
- **ventas:** `{ pedidoId, fecha, productos: [ { productoId, nombre, precio } ], total, restaurante }`
- **suscripciones:** objeto de suscripción push del navegador (para el gerente)

> 🔗 **Menú unificado:** el menú de cada restaurante son los `productos` con su
> `restauranteId`. `GET /restaurantes/:id` los devuelve como `menu`, y al pedir se
> descuenta el `stock` por el `productoId` de cada producto.

> 📌 Después de estos cambios corre **`npm run seed`** de nuevo (recuerda: eso
> **borra y rellena TODAS** las colecciones, incluyendo los restaurantes con sus
> productos ya unificados).
