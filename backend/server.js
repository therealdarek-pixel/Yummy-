// ============================================================
//  SERVIDOR PRINCIPAL
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { ObjectId } = require("mongodb");
const { conectar } = require("./db");

// Definimos la Variable que dice desde qué frontend se puede hablar con el backend 
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

// Devuelve el promedio de estrellas de cada restaurante
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
// A cada producto del menú que coincida por nombre con el catálogo le
// agregamos su "stock" actual (solo en la respuesta, no se guarda en la base).
app.get("/restaurantes/:id", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);

  const restaurante = await bd.collection("restaurantes").findOne({ _id: id });

  // Cruzamos cada producto del menú con la colección "productos" por nombre.
  for (const producto of restaurante.menu) {
    const delCatalogo = await bd
      .collection("productos")
      .findOne({ nombre: producto.nombre });

    if (delCatalogo) {
      producto.stock = delCatalogo.stock;
    }
  }

  res.json(restaurante);
});

// ============================================================
//  PEDIDOS
// ============================================================

// Crea un PEDIDO nuevo (revisa el saldo, lo descuenta y avisa al admin).
app.post("/pedidos", async (req, res) => {
  const bd = await conectar();
  const { usuarioId, restaurante, productos, total } = req.body;
  const idUsuario = new ObjectId(usuarioId);

  const usuario = await bd.collection("usuarios").findOne({ _id: idUsuario });

  // Si no le alcanza el saldo, no creamos el pedido.
  if (usuario.saldo < total) {
    return res.status(400).json({ error: "Saldo insuficiente 😢" });
  }

  // Le descontamos el total a su saldo.
  await bd
    .collection("usuarios")
    .updateOne({ _id: idUsuario }, { $inc: { saldo: -total } });

  // A cada producto del pedido le ponemos su productoId si coincide por nombre
  // con un producto del catálogo. Si no coincide, se guarda igual que antes.
  const productosDelPedido = [];
  for (const producto of productos) {
    const delCatalogo = await bd
      .collection("productos")
      .findOne({ nombre: producto.nombre });

    if (delCatalogo) {
      productosDelPedido.push({ ...producto, productoId: delCatalogo._id });
    } else {
      productosDelPedido.push(producto);
    }
  }

  // Armamos el pedido nuevo y lo guardamos.
  const pedido = {
    usuarioId: usuarioId,
    usuario: usuario.nombre,
    restaurante: restaurante,
    productos: productosDelPedido,
    total: total,
    estado: "pendiente",
    fecha: new Date(),
  };

  const resultado = await bd.collection("pedidos").insertOne(pedido);
  pedido._id = resultado.insertedId;

  // A los productos que vienen del catálogo les descontamos 1 de stock por cada
  // vez que aparecen en el pedido, y juntamos lo vendido para la venta.
  const productosVendidos = [];
  for (const item of productosDelPedido) {
    if (item.productoId) {
      await bd
        .collection("productos")
        .updateOne({ _id: item.productoId }, { $inc: { stock: -1 } });

      productosVendidos.push({
        productoId: item.productoId,
        nombre: item.nombre,
        precio: item.precio,
      });
    }
  }

  // Guardamos un registro de venta ligado a este pedido.
  await bd.collection("ventas").insertOne({
    pedidoId: pedido._id,
    fecha: new Date(),
    productos: productosVendidos,
    total: total,
    restaurante: restaurante,
  });

  // Revisamos si algún producto quedó con stock bajo (5 o menos) y avisamos:
  // banner por socket al gerente + notificación push (bloque 5).
  for (const item of productosDelPedido) {
    if (item.productoId) {
      const actualizado = await bd
        .collection("productos")
        .findOne({ _id: item.productoId });

      if (actualizado.stock <= 5) {
        io.emit("stock-bajo", {
          nombre: actualizado.nombre,
          stock: actualizado.stock,
        });
        await enviarPushStockBajo(actualizado);
      }
    }
  }

  // Avisamos al admin que hay un pedido nuevo y devolvemos el saldo actualizado.
  // El numeroTicket es el _id del pedido (sirve como comprobante).
  io.emit("nuevo-pedido", pedido);
  res.json({
    ok: true,
    saldoNuevo: usuario.saldo - total,
    numeroTicket: pedido._id,
  });
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
    .updateOne({ _id: id }, { $set: { estado: estado } });

  io.emit("pedido-actualizado", { id: req.params.id, estado: estado });
  res.json({ ok: true });
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
//  PUSH
// ============================================================

// Manda una notificación push a todas las suscripciones guardadas
// cuando un producto se queda con stock bajo.
// (En el bloque 5 se conecta con la librería web-push y las llaves VAPID.)
async function enviarPushStockBajo(producto) {
  // Pendiente de implementar con web-push.
}

// ============================================================
//  PRODUCTOS
// ============================================================

// Devuelve TODOS los productos del catálogo.
app.get("/productos", async (req, res) => {
  const bd = await conectar();

  const lista = await bd.collection("productos").find().toArray();

  res.json(lista);
});

// Crea un producto nuevo (lo usa el gerente).
app.post("/productos", async (req, res) => {
  const bd = await conectar();
  const { nombre, precio, stock, categoria } = req.body;

  const nuevo = {
    nombre: nombre,
    precio: precio,
    stock: stock,
    categoria: categoria,
  };

  const resultado = await bd.collection("productos").insertOne(nuevo);
  nuevo._id = resultado.insertedId;

  res.json(nuevo);
});

// Actualiza un producto (nombre, precio, stock o categoría).
app.put("/productos/:id", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);
  const { nombre, precio, stock, categoria } = req.body;

  await bd.collection("productos").updateOne(
    { _id: id },
    { $set: { nombre: nombre, precio: precio, stock: stock, categoria: categoria } }
  );

  res.json({ ok: true });
});

// Elimina un producto del catálogo.
app.delete("/productos/:id", async (req, res) => {
  const bd = await conectar();
  const id = new ObjectId(req.params.id);

  await bd.collection("productos").deleteOne({ _id: id });

  res.json({ ok: true });
});

// ============================================================
//  REPORTES
// ============================================================

// Devuelve el inicio de la semana (lunes) de una fecha, como texto AAAA-MM-DD.
// Sirve para agrupar las ventas por semana.
function inicioDeSemana(fecha) {
  const f = new Date(fecha);
  const dia = f.getDay(); // 0 = domingo, 1 = lunes, ...
  const resta = dia === 0 ? 6 : dia - 1; // cuántos días retroceder hasta el lunes
  f.setDate(f.getDate() - resta);
  return f.toISOString().slice(0, 10);
}

// Totales de ventas agrupados por día.
// Si llegan ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD, devuelve las ventas de ese rango
// (incluyendo ambos días). Un solo día se pide con desde y hasta iguales.
app.get("/reportes/ventas-diarias", async (req, res) => {
  const bd = await conectar();
  const { desde, hasta } = req.query;

  // Caso 1: pidieron un rango de fechas -> total y lista de ventas de ese rango.
  if (desde && hasta) {
    const inicio = new Date(`${desde}T00:00:00.000Z`);
    const fin = new Date(`${hasta}T23:59:59.999Z`);

    const ventasRango = await bd
      .collection("ventas")
      .find({ fecha: { $gte: inicio, $lte: fin } })
      .toArray();

    let total = 0;
    ventasRango.forEach((venta) => {
      total += venta.total;
    });

    return res.json({ desde: desde, hasta: hasta, total: total, ventas: ventasRango });
  }

  // Caso 2 (por defecto): sumamos el total de cada día en un objeto { "AAAA-MM-DD": total }.
  const ventas = await bd.collection("ventas").find().toArray();
  const porDia = {};
  ventas.forEach((venta) => {
    const dia = new Date(venta.fecha).toISOString().slice(0, 10);
    if (!porDia[dia]) {
      porDia[dia] = 0;
    }
    porDia[dia] += venta.total;
  });

  // Lo pasamos a una lista ordenada por día.
  const lista = Object.keys(porDia)
    .sort()
    .map((dia) => ({ dia: dia, total: porDia[dia] }));

  res.json(lista);
});

// Totales de ventas agrupados por semana (por el lunes de cada semana).
app.get("/reportes/ventas-semanales", async (req, res) => {
  const bd = await conectar();
  const ventas = await bd.collection("ventas").find().toArray();

  const porSemana = {};
  ventas.forEach((venta) => {
    const semana = inicioDeSemana(venta.fecha);
    if (!porSemana[semana]) {
      porSemana[semana] = 0;
    }
    porSemana[semana] += venta.total;
  });

  const lista = Object.keys(porSemana)
    .sort()
    .map((semana) => ({ semana: semana, total: porSemana[semana] }));

  res.json(lista);
});

// Producto del catálogo más vendido (cuenta cuántas veces aparece su productoId).
app.get("/reportes/producto-estrella", async (req, res) => {
  const bd = await conectar();
  const ventas = await bd.collection("ventas").find().toArray();

  // Contamos cuántas veces se vendió cada productoId.
  const conteo = {};
  ventas.forEach((venta) => {
    venta.productos.forEach((producto) => {
      if (producto.productoId) {
        const clave = producto.productoId.toString();
        if (!conteo[clave]) {
          conteo[clave] = { nombre: producto.nombre, veces: 0 };
        }
        conteo[clave].veces += 1;
      }
    });
  });

  // Buscamos el que tenga más ventas.
  let estrella = null;
  for (const clave in conteo) {
    if (!estrella || conteo[clave].veces > estrella.veces) {
      estrella = conteo[clave];
    }
  }

  res.json(estrella);
});

// ============================================================
//  PRENDEMOS EL SERVIDOR
// ============================================================
// El puerto viene de una variable de entorno.
const PORT = process.env.PORT || 3000;

servidor.listen(PORT, () => {
  console.log(`Servidor encendido en el puerto ${PORT} `);
});
