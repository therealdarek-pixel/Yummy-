// ============================================================
//  SERVIDOR PRINCIPAL
//  Aquí están todas las rutas (lo que el frontend le pide al backend)
//  y también el "tiempo real" con Socket.io.
// ============================================================

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { ObjectId } = require("mongodb");
const { conectar } = require("./db");

// El origen permitido (el frontend) viene de una variable de entorno.
// - En tu compu usa "*" (cualquiera), para que funcione fácil en localhost.
// - En Render se pondrá FRONTEND_URL con la dirección de tu frontend en Vercel.
const FRONTEND = process.env.FRONTEND_URL || "*";

const app = express();
app.use(cors({ origin: FRONTEND })); // permite que el frontend hable con el backend
app.use(express.json());             // permite leer datos en formato JSON

// Creamos el servidor y le pegamos Socket.io (para avisar cosas al instante).
const servidor = http.createServer(app);
const io = new Server(servidor, { cors: { origin: FRONTEND } });

// Cuando alguien se conecta por tiempo real, solo lo avisamos en consola.
io.on("connection", () => {
  console.log("Alguien se conectó en tiempo real 🔌");
});

// ============================================================
//  RUTAS
// ============================================================

// ------------------------------------------------------------
//  REGISTRO Y LOGIN
// ------------------------------------------------------------

// Crea un usuario NUEVO. Empieza con saldo de $500 y NO es admin.
app.post("/registro", async (req, res) => {
  const bd = await conectar();
  const { nombre, correo, contraseña } = req.body;

  // 1. Revisamos que el correo no esté ya usado.
  const yaExiste = await bd.collection("usuarios").findOne({ correo: correo });
  if (yaExiste) {
    return res.status(400).json({ error: "Ese correo ya está registrado 😅" });
  }

  // 2. Guardamos el usuario nuevo.
  const nuevo = {
    nombre: nombre,
    correo: correo,
    contraseña: contraseña, // texto plano (solo para esta práctica escolar)
    saldo: 500,
    esAdmin: false,
  };
  const resultado = await bd.collection("usuarios").insertOne(nuevo);
  nuevo._id = resultado.insertedId;

  // 3. Le respondemos con su usuario ya creado.
  res.json(nuevo);
});

// Inicia sesión: compara correo y contraseña de forma directa.
app.post("/login", async (req, res) => {
  const bd = await conectar();
  const { correo, contraseña } = req.body;

  // Buscamos un usuario con ESE correo y ESA contraseña.
  const usuario = await bd
    .collection("usuarios")
    .findOne({ correo: correo, contraseña: contraseña });

  // Si no lo encontramos, los datos están mal.
  if (!usuario) {
    return res.status(400).json({ error: "Correo o contraseña incorrectos 🙈" });
  }

  res.json(usuario);
});

// Devuelve UN usuario por su id (para mostrar su saldo actualizado).
app.get("/usuarios/:id", async (req, res) => {
  const bd = await conectar();
  const usuario = await bd
    .collection("usuarios")
    .findOne({ _id: new ObjectId(req.params.id) });
  res.json(usuario);
});

// Recarga saldo al usuario (le suma una cantidad, por ejemplo $100).
app.post("/usuarios/:id/recargar", async (req, res) => {
  const bd = await conectar();
  const { cantidad } = req.body;

  // Le sumamos la cantidad a su saldo.
  await bd
    .collection("usuarios")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { saldo: cantidad } }
    );

  // Devolvemos el usuario ya con su saldo nuevo.
  const usuario = await bd
    .collection("usuarios")
    .findOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true, saldoNuevo: usuario.saldo });
});

// Devuelve TODOS los restaurantes.
app.get("/restaurantes", async (req, res) => {
  const bd = await conectar();
  const lista = await bd.collection("restaurantes").find().toArray();
  res.json(lista);
});

// Devuelve UN restaurante por su id (con su menú adentro).
app.get("/restaurantes/:id", async (req, res) => {
  const bd = await conectar();
  const uno = await bd
    .collection("restaurantes")
    .findOne({ _id: new ObjectId(req.params.id) });
  res.json(uno);
});

// Crea un PEDIDO nuevo.
app.post("/pedidos", async (req, res) => {
  const bd = await conectar();

  // Estos datos vienen del frontend (lo que el usuario pidió).
  const { usuarioId, restaurante, productos, total } = req.body;

  // 1. Buscamos al usuario.
  const usuario = await bd
    .collection("usuarios")
    .findOne({ _id: new ObjectId(usuarioId) });

  // 2. Revisamos que le alcance el saldo.
  if (usuario.saldo < total) {
    return res.status(400).json({ error: "Saldo insuficiente 😢" });
  }

  // 3. Le descontamos el dinero del monedero.
  await bd
    .collection("usuarios")
    .updateOne({ _id: new ObjectId(usuarioId) }, { $inc: { saldo: -total } });

  // 4. Guardamos el pedido en la base de datos.
  //    Guardamos también el id del usuario para saber DE QUIÉN es el pedido.
  const pedido = {
    usuarioId: usuarioId,
    usuario: usuario.nombre,
    restaurante: restaurante,
    productos: productos,
    total: total,
    estado: "pendiente",
    fecha: new Date(),
  };
  const resultado = await bd.collection("pedidos").insertOne(pedido);
  pedido._id = resultado.insertedId; // le pegamos el id que generó Mongo

  // 5. Avisamos al ADMIN, al instante, que llegó un pedido nuevo.
  io.emit("nuevo-pedido", pedido);

  // 6. Le respondemos al usuario con su saldo ya actualizado.
  res.json({ ok: true, saldoNuevo: usuario.saldo - total });
});

// Devuelve TODOS los pedidos (para el panel del admin).
app.get("/pedidos", async (req, res) => {
  const bd = await conectar();
  const lista = await bd
    .collection("pedidos")
    .find()
    .sort({ fecha: -1 }) // los más nuevos primero
    .toArray();
  res.json(lista);
});

// Devuelve solo los pedidos DE UN usuario (su historial).
app.get("/pedidos/usuario/:id", async (req, res) => {
  const bd = await conectar();
  const lista = await bd
    .collection("pedidos")
    .find({ usuarioId: req.params.id })
    .sort({ fecha: -1 }) // los más nuevos primero
    .toArray();
  res.json(lista);
});

// Cambia el ESTADO de un pedido (pendiente -> preparando -> etc).
app.put("/pedidos/:id", async (req, res) => {
  const bd = await conectar();
  const { estado } = req.body;

  await bd
    .collection("pedidos")
    .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { estado: estado } });

  // Avisamos a TODOS que el pedido cambió (para que el usuario lo vea).
  io.emit("pedido-actualizado", { id: req.params.id, estado: estado });

  res.json({ ok: true });
});

// ============================================================
//  PRENDEMOS EL SERVIDOR
// ============================================================
// El puerto viene de una variable de entorno.
// - En tu compu usa el 3000.
// - En Render NO eliges el puerto: Render asigna el suyo en process.env.PORT.
const PORT = process.env.PORT || 3000;

servidor.listen(PORT, () => {
  console.log(`Servidor encendido en el puerto ${PORT} 🚀`);
});
