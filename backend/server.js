// ============================================================
//  SERVIDOR PRINCIPAL
//  Aquí están todas las rutas (lo que el frontend le pide al backend)
//  y también el "tiempo real" con Socket.io.
//
//  Todas las rutas siguen el MISMO patrón para que sean fáciles de leer:
//    1) obtenemos la base de datos,
//    2) leemos los datos que entran (req.params / req.body),
//    3) hacemos la operación de Mongo,
//    4) respondemos con res.json(...).
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
app.use(express.json()); // permite leer datos en formato JSON

// Creamos el servidor y le pegamos Socket.io (para avisar cosas al instante).
const servidor = http.createServer(app);
const io = new Server(servidor, { cors: { origin: FRONTEND } });

io.on("connection", () => {
  console.log("Alguien se conectó en tiempo real 🔌");
});

// ============================================================
//  USUARIOS: REGISTRO Y LOGIN
// ============================================================

// Crea un usuario nuevo (empieza con $500 de saldo y NO es admin).
app.post("/registro", async (req, res) => {
  const bd = await conectar();
  const { nombre, correo, contraseña } = req.body;

  // Si el correo ya está registrado, no dejamos crear otra cuenta.
  const yaExiste = await bd.collection("usuarios").findOne({ correo: correo });
  if (yaExiste) {
    return res.status(400).json({ error: "Ese correo ya está registrado 😅" });
  }

  const nuevo = {
    nombre: nombre,
    correo: correo,
    contraseña: contraseña, // texto plano (solo para esta práctica escolar)
    saldo: 500,
    esAdmin: false,
  };

  const resultado = await bd.collection("usuarios").insertOne(nuevo);
  nuevo._id = resultado.insertedId; // el frontend necesita el id del usuario

  res.json(nuevo);
});

// Inicia sesión: busca un usuario con ese correo y esa contraseña.
app.post("/login", async (req, res) => {
  const bd = await conectar();
  const { correo, contraseña } = req.body;

  const usuario = await bd
    .collection("usuarios")
    .findOne({ correo: correo, contraseña: contraseña });

  if (!usuario) {
    return res.status(400).json({ error: "Correo o contraseña incorrectos 🙈" });
  }

  res.json(usuario);
});

// Devuelve UN usuario por su id (para mostrar su saldo actualizado).
app.get("/usuarios/:id", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);

  const usuario = await bd.collection("usuarios").findOne({ _id: id });

  res.json(usuario);
});

// Recarga saldo al usuario (le suma una cantidad, por ejemplo $100).
app.post("/usuarios/:id/recargar", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);
  const { cantidad } = req.body;

  await bd
    .collection("usuarios")
    .updateOne({ _id: id }, { $inc: { saldo: cantidad } });

  const usuario = await bd.collection("usuarios").findOne({ _id: id });

  res.json({ ok: true, saldoNuevo: usuario.saldo });
});

// Agrega o quita un restaurante de los FAVORITOS del usuario.
// Funciona como interruptor: si ya estaba, lo quita; si no, lo agrega.
app.post("/usuarios/:id/favoritos/:restauranteId", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);
  const restauranteId = req.params.restauranteId;

  const usuario = await bd.collection("usuarios").findOne({ _id: id });
  const favoritos = usuario.favoritos || [];

  let nuevos;
  if (favoritos.includes(restauranteId)) {
    nuevos = favoritos.filter((favorito) => favorito !== restauranteId);
  } else {
    nuevos = [...favoritos, restauranteId];
  }

  await bd
    .collection("usuarios")
    .updateOne({ _id: id }, { $set: { favoritos: nuevos } });

  res.json({ favoritos: nuevos });
});

// ============================================================
//  RESTAURANTES
// ============================================================

// Devuelve TODOS los restaurantes.
app.get("/restaurantes", async (req, res) => {
  const bd = await conectar();

  const lista = await bd.collection("restaurantes").find().toArray();

  res.json(lista);
});

// Devuelve el promedio de estrellas de cada restaurante, contando solo
// pedidos entregados y ya calificados. Responde un objeto { nombre: promedio }.
// Va ANTES de "/restaurantes/:id" para que Express no tome "promedios" como id.
app.get("/restaurantes/promedios", async (req, res) => {
  const bd = await conectar();

  // Traemos los pedidos entregados que ya tienen calificación.
  const pedidos = await bd
    .collection("pedidos")
    .find({ estado: "entregado", calificacion: { $gte: 1 } })
    .toArray();

  // Sumamos las estrellas y contamos cuántas hay por restaurante.
  const sumas = {};
  pedidos.forEach((pedido) => {
    const nombre = pedido.restaurante;
    if (!sumas[nombre]) {
      sumas[nombre] = { suma: 0, cuenta: 0 };
    }
    sumas[nombre].suma += pedido.calificacion;
    sumas[nombre].cuenta += 1;
  });

  // El promedio es la suma entre la cuenta.
  const promedios = {};
  for (const nombre in sumas) {
    promedios[nombre] = sumas[nombre].suma / sumas[nombre].cuenta;
  }

  res.json(promedios);
});

// Devuelve UN restaurante por su id (con su menú adentro).
app.get("/restaurantes/:id", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);

  const restaurante = await bd.collection("restaurantes").findOne({ _id: id });

  res.json(restaurante);
});

// ============================================================
//  PEDIDOS
// ============================================================

// Crea un PEDIDO nuevo (revisa el saldo, lo descuenta y avisa al admin).
app.post("/pedidos", async (req, res) => {
  const bd = await conectar();
  const { usuarioId, restaurante, productos, total } = req.body;

  const usuario = await bd
    .collection("usuarios")
    .findOne({ _id: new ObjectId(usuarioId) });

  // Si no le alcanza el saldo, no creamos el pedido.
  if (usuario.saldo < total) {
    return res.status(400).json({ error: "Saldo insuficiente 😢" });
  }

  // Le descontamos el total a su saldo.
  await bd
    .collection("usuarios")
    .updateOne({ _id: new ObjectId(usuarioId) }, { $inc: { saldo: -total } });
  
    const pedido = { // guardamos el pedido en la base de datos
    usuarioId: usuarioId,
    usuario: usuario.nombre,
    restaurante: restaurante,
    productos: productos,
    total: total,
    estado: "pendiente",
    fecha: new Date(),
  };

  const resultado = await bd.collection("pedidos").insertOne(pedido);
  pedido._id = resultado.insertedId; 
  io.emit("nuevo-pedido", pedido); // avisamos al admin que hay un pedido nuevo
  res.json({ ok: true, saldoNuevo: usuario.saldo - total }); // devolvemos el saldo actualizado 
}); 

// Devuelve TODOS los pedidos, del más nuevo al más viejo (panel del admin).
app.get("/pedidos", async (req, res) => {
  const bd = await conectar();

  const lista = await bd
    .collection("pedidos")
    .find()
    .sort({ fecha: -1 })
    .toArray();

  res.json(lista);
});

// Devuelve solo los pedidos DE UN usuario (su historial).
app.get("/pedidos/usuario/:id", async (req, res) => {
  const bd = await conectar();
  const usuarioId = req.params.id;

  const lista = await bd
    .collection("pedidos")
    .find({ usuarioId: usuarioId })
    .sort({ fecha: -1 })
    .toArray();

  res.json(lista);
});

// Cambia el ESTADO de un pedido (pendiente -> preparando -> etc.).
app.put("/pedidos/:id", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);
  const { estado } = req.body;

  await bd
    .collection("pedidos") 
    .updateOne({ _id: id }, { $set: { estado: estado } }); // actualiza el estado del pedido en la base de datos
  io.emit("pedido-actualizado", { id: req.params.id, estado: estado });
  res.json({ ok: true }); // respondemos que todo salió bien
});

// Guarda la CALIFICACIÓN (1 a 5 estrellas) de un pedido ya entregado.
app.put("/pedidos/:id/calificacion", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);
  const { calificacion } = req.body;
  await bd
    .collection("pedidos")
    .updateOne({ _id: id }, { $set: { calificacion: calificacion } });

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
