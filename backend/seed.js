// Este archivo sirve para llenar la base de datos con datos de ejemplo.
const { conectar } = require("./db");

async function llenar() {
  const bd = await conectar();

  // 1. Borramos todo lo que haya para empezar limpio.
  await bd.collection("usuarios").deleteMany({});
  await bd.collection("restaurantes").deleteMany({});
  await bd.collection("pedidos").deleteMany({});
  await bd.collection("productos").deleteMany({});
  await bd.collection("ventas").deleteMany({});
  await bd.collection("suscripciones").deleteMany({});

  // 2. Creamos los usuarios de ejemplo.
  await bd.collection("usuarios").insertMany([
    // Usuario ADMIN: con este se entra al panel de pedidos.
    {
      nombre: "Administrador",
      correo: "admin@didi.com",
      contraseña: "admin123",
      saldo: 0,
      esAdmin: true,
      favoritos: [],
      lat: 19.289,
      lng: -99.665,
    },
    // Usuario NORMAL de ejemplo (también puedes crear los tuyos en /registro).
    {
      nombre: "Zylly",
      correo: "zylly@didi.com",
      contraseña: "1234",
      saldo: 500,
      esAdmin: false,
      favoritos: [],
      lat: 19.282, // casa del usuario en Toluca
      lng: -99.675,
    },
  ]);

  // 3. Creamos los restaurantes (ya SIN menú embebido).
  //    Cada uno tiene "categoria" (para filtros) y "lat"/"lng" (para el mapa).
  const resultadoRestaurantes = await bd.collection("restaurantes").insertMany([
    { nombre: "Tacos El Güero", imagen: "🌮", categoria: "Mexicana", lat: 19.2926, lng: -99.6557 },
    { nombre: "Pizza Loca", imagen: "🍕", categoria: "Pizza", lat: 19.2885, lng: -99.6709 },
    { nombre: "Sushi Express", imagen: "🍣", categoria: "Sushi", lat: 19.2783, lng: -99.6543 },
    { nombre: "Burger House", imagen: "🍔", categoria: "Hamburguesas", lat: 19.3019, lng: -99.6601 },
    { nombre: "Antojitos Doña Rosa", imagen: "🫔", categoria: "Mexicana", lat: 19.2701, lng: -99.662 },
    { nombre: "Dulce Tentación", imagen: "🍰", categoria: "Postres", lat: 19.2966, lng: -99.6745 },
  ]);

  // Guardamos el _id de cada restaurante para ligar sus productos.
  const ids = resultadoRestaurantes.insertedIds;
  const tacos = ids[0];
  const pizza = ids[1];
  const sushi = ids[2];
  const burger = ids[3];
  const antojitos = ids[4];
  const postres = ids[5];

  // 4. Creamos los productos del catálogo: cada uno con su "restauranteId" y su stock.
  //    El menú de cada restaurante son estos productos. Dejamos algunos con stock
  //    bajo (3 y 4) para probar la alerta de stock bajo.
  await bd.collection("productos").insertMany([
    // Tacos El Güero
    { nombre: "Taco de pastor", precio: 20, stock: 50, categoria: "Mexicana", restauranteId: tacos },
    { nombre: "Taco de bistec", precio: 25, stock: 40, categoria: "Mexicana", restauranteId: tacos },
    { nombre: "Quesadilla", precio: 30, stock: 3, categoria: "Mexicana", restauranteId: tacos },
    { nombre: "Refresco", precio: 18, stock: 100, categoria: "Bebidas", restauranteId: tacos },
    // Pizza Loca
    { nombre: "Pizza pepperoni", precio: 120, stock: 15, categoria: "Pizza", restauranteId: pizza },
    { nombre: "Pizza hawaiana", precio: 130, stock: 8, categoria: "Pizza", restauranteId: pizza },
    { nombre: "Pan de ajo", precio: 45, stock: 20, categoria: "Pizza", restauranteId: pizza },
    { nombre: "Refresco 2L", precio: 35, stock: 30, categoria: "Bebidas", restauranteId: pizza },
    // Sushi Express
    { nombre: "Rollo California", precio: 95, stock: 20, categoria: "Sushi", restauranteId: sushi },
    { nombre: "Rollo empanizado", precio: 110, stock: 12, categoria: "Sushi", restauranteId: sushi },
    { nombre: "Edamames", precio: 50, stock: 4, categoria: "Sushi", restauranteId: sushi },
    { nombre: "Té helado", precio: 28, stock: 40, categoria: "Bebidas", restauranteId: sushi },
    // Burger House
    { nombre: "Hamburguesa sencilla", precio: 70, stock: 25, categoria: "Hamburguesas", restauranteId: burger },
    { nombre: "Hamburguesa doble", precio: 95, stock: 18, categoria: "Hamburguesas", restauranteId: burger },
    { nombre: "Papas a la francesa", precio: 40, stock: 30, categoria: "Hamburguesas", restauranteId: burger },
    { nombre: "Malteada", precio: 50, stock: 15, categoria: "Bebidas", restauranteId: burger },
    // Antojitos Doña Rosa
    { nombre: "Tamal verde", precio: 22, stock: 25, categoria: "Mexicana", restauranteId: antojitos },
    { nombre: "Pozole chico", precio: 60, stock: 10, categoria: "Mexicana", restauranteId: antojitos },
    { nombre: "Sope sencillo", precio: 25, stock: 5, categoria: "Mexicana", restauranteId: antojitos },
    { nombre: "Agua de horchata", precio: 20, stock: 40, categoria: "Bebidas", restauranteId: antojitos },
    // Dulce Tentación
    { nombre: "Rebanada de pastel", precio: 55, stock: 4, categoria: "Postres", restauranteId: postres },
    { nombre: "Brownie con helado", precio: 60, stock: 12, categoria: "Postres", restauranteId: postres },
    { nombre: "Crepa de Nutella", precio: 65, stock: 10, categoria: "Postres", restauranteId: postres },
    { nombre: "Malteada de fresa", precio: 50, stock: 15, categoria: "Bebidas", restauranteId: postres },
  ]);

  console.log("Datos de ejemplo cargados ✅");
  process.exit(0); // cerramos el programa
}

llenar();
