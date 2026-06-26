# 🚀 Cómo subir Yummy a internet (deploy)

Esta guía explica cómo poner el proyecto en línea de forma sencilla:

- **Base de datos** → MongoDB Atlas (gratis)
- **Backend** (carpeta `backend/`) → Render
- **Frontend** (carpeta `frontend/`) → Vercel

La idea: subes TODO el proyecto a GitHub una sola vez, y luego conectas Render y
Vercel a ese mismo repositorio, pero cada uno apuntando a SU carpeta.

---

## 🧩 Variables de entorno (resumen)

Gracias a los `|| valor por defecto`, en tu compu NO necesitas configurar nada;
todo sigue funcionando en localhost. Estas variables solo se ponen en internet:

| Dónde se pone | Variable | Para qué sirve | Ejemplo |
|---|---|---|---|
| Render (backend) | `MONGO_URL` | Cadena de conexión de MongoDB Atlas | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net` |
| Render (backend) | `FRONTEND_URL` | El origen permitido (tu frontend en Vercel) | `https://didi-food.vercel.app` |
| Vercel (frontend) | `VITE_BACKEND_URL` | La URL de tu backend en Render | `https://didi-food-backend.onrender.com` |

> `PORT` NO la pones tú: Render la asigna sola y el código ya la lee con
> `process.env.PORT`.

---

## 1) MongoDB Atlas (la base de datos en internet)

1. Entra a https://www.mongodb.com/atlas y crea una cuenta.
2. Crea un **Cluster gratis** (M0).
3. En **Database Access** crea un usuario con su contraseña (anótalos).
4. En **Network Access** agrega la IP `0.0.0.0/0` (permite el acceso desde
   cualquier lado; es lo más fácil para una práctica escolar).
5. En **Connect → Drivers**, copia la **cadena de conexión**. Se ve así:
   ```
   mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Cambia `USUARIO` y `CONTRASEÑA` por los que creaste. Esta cadena será tu
   `MONGO_URL`.

---

## 2) Subir el proyecto a GitHub

Desde la carpeta raíz del proyecto (`didi-food/`):

```bash
git init
git add .
git commit -m "DiDi Food listo para deploy"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/didi-food.git
git push -u origin main
```

> Asegúrate de que exista un `.gitignore` que ignore `node_modules` en `backend/`
> y `frontend/` (ya vienen incluidos). NO subas `node_modules`.

---

## 3) Backend en Render

1. Entra a https://render.com e inicia sesión con GitHub.
2. **New → Web Service** y elige tu repositorio `didi-food`.
3. Configúralo así:
   - **Root Directory:** `backend`  ← MUY IMPORTANTE (la carpeta del backend)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. En **Environment → Environment Variables**, agrega:
   - `MONGO_URL` = tu cadena de conexión de Atlas (del paso 1).
   - `FRONTEND_URL` = la URL de tu frontend en Vercel.
     > Truco: aún no la tienes. Pon `*` por ahora y, cuando tengas la URL de
     > Vercel (paso 4), regresas y la cambias por la URL real (más seguro).
5. Da en **Create Web Service**. Cuando termine, te dará una URL como:
   ```
   https://didi-food-backend.onrender.com
   ```
   Esa URL será tu `VITE_BACKEND_URL` para Vercel.

### Cargar los datos de ejemplo (seed) en Atlas
Una sola vez, para llenar la base con restaurantes y usuarios de ejemplo:
- **Opción fácil:** en Render, abre la pestaña **Shell** de tu servicio y corre:
  ```bash
  npm run seed
  ```
- **Opción desde tu compu:** pon temporalmente la `MONGO_URL` de Atlas y corre
  `npm run seed` en `backend/`.

---

## 4) Frontend en Vercel

1. Entra a https://vercel.com e inicia sesión con GitHub.
2. **Add New → Project** y elige tu repositorio `didi-food`.
3. Configúralo así:
   - **Root Directory:** `frontend`  ← MUY IMPORTANTE (la carpeta del frontend)
   - **Framework Preset:** `Vite` (Vercel suele detectarlo solo)
   - **Build Command:** `npm run build` (automático)
   - **Output Directory:** `dist` (automático)
4. En **Environment Variables**, agrega:
   - `VITE_BACKEND_URL` = la URL de tu backend en Render (del paso 3),
     por ejemplo `https://didi-food-backend.onrender.com`
5. Da en **Deploy**. Al terminar te dará una URL como:
   ```
   https://didi-food.vercel.app
   ```

---

## 5) Conectar los dos lados (paso final)

1. Copia la URL de Vercel (`https://didi-food.vercel.app`).
2. Regresa a **Render → tu servicio → Environment** y pon esa URL en
   `FRONTEND_URL`. Guarda (Render reinicia solo).
3. ¡Listo! Abre tu URL de Vercel y prueba el registro, login y los pedidos.

> Si cambias una variable en Vercel DESPUÉS del deploy, hay que volver a
> desplegar (Deployments → Redeploy) para que el frontend la tome.

---

## 🆘 Problemas comunes

- **El frontend no se conecta / error de CORS:** revisa que `FRONTEND_URL` en
  Render sea EXACTAMENTE tu URL de Vercel (con `https://` y sin `/` al final).
- **No aparecen restaurantes:** te faltó correr el `seed` contra Atlas (paso 3).
- **El backend "tarda" la primera vez:** en el plan gratis de Render el servidor
  se "duerme" si nadie lo usa; la primera petición lo despierta (tarda unos
  segundos). Es normal.
- **Cambié `VITE_BACKEND_URL` y no toma efecto:** vuelve a desplegar en Vercel
  (las variables `VITE_` se "incrustan" al construir el frontend).
