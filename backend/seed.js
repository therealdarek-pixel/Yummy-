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

  // 3. Creamos los restaurantes.
  //    Cada uno tiene "categoria" (para filtros) y "lat"/"lng" (para el mapa).
  await bd.collection("restaurantes").insertMany([
    {
      nombre: "Tacos El Güero",
      imagen: "🌮",
      categoria: "Mexicana",
      lat: 19.2926,
      lng: -99.6557,
      menu: [
        { nombre: "Taco de pastor", precio: 20 },
        { nombre: "Taco de bistec", precio: 25 },
        { nombre: "Quesadilla", precio: 30 },
        { nombre: "Refresco", precio: 18 },
      ],
    },
    {
      nombre: "Pizza Loca",
      imagen: "🍕",
      categoria: "Pizza",
      lat: 19.2885,
      lng: -99.6709,
      menu: [
        { nombre: "Pizza pepperoni", precio: 120 },
        { nombre: "Pizza hawaiana", precio: 130 },
        { nombre: "Pan de ajo", precio: 45 },
        { nombre: "Refresco 2L", precio: 35 },
      ],
    },
    {
      nombre: "Sushi Express",
      imagen: "🍣",
      categoria: "Sushi",
      lat: 19.2783,
      lng: -99.6543,
      menu: [
        { nombre: "Rollo California", precio: 95 },
        { nombre: "Rollo empanizado", precio: 110 },
        { nombre: "Edamames", precio: 50 },
        { nombre: "Té helado", precio: 28 },
      ],
    },
    {
      nombre: "Burger House",
      imagen: "🍔",
      categoria: "Hamburguesas",
      lat: 19.3019,
      lng: -99.6601,
      menu: [
        { nombre: "Hamburguesa sencilla", precio: 70 },
        { nombre: "Hamburguesa doble", precio: 95 },
        { nombre: "Papas a la francesa", precio: 40 },
        { nombre: "Malteada", precio: 50 },
      ],
    },
    {
      nombre: "Antojitos Doña Rosa",
      imagen: "🫔",
      categoria: "Mexicana",
      lat: 19.2701,
      lng: -99.662,
      menu: [
        { nombre: "Tamal verde", precio: 22 },
        { nombre: "Pozole chico", precio: 60 },
        { nombre: "Sope sencillo", precio: 25 },
        { nombre: "Agua de horchata", precio: 20 },
      ],
    },
    {
      nombre: "Dulce Tentación",
      imagen: "🍰",
      categoria: "Postres",
      lat: 19.2966,
      lng: -99.6745,
      menu: [
        { nombre: "Rebanada de pastel", precio: 55 },
        { nombre: "Brownie con helado", precio: 60 },
        { nombre: "Crepa de Nutella", precio: 65 },
        { nombre: "Malteada de fresa", precio: 50 },
      ],
    },
  ]);

  // 4. Creamos los productos del catálogo (con su stock).
  //    Varios nombres coinciden con los menús para poder ligarlos a los pedidos.
  //    Dejamos "Quesadilla" con stock 3 (bajo) para probar la alerta del bloque 4.
  await bd.collection("productos").insertMany([
    { nombre: "Taco de pastor", precio: 20, stock: 50, categoria: "Mexicana" },
    { nombre: "Quesadilla", precio: 30, stock: 3, categoria: "Mexicana" },
    { nombre: "Pizza pepperoni", precio: 120, stock: 15, categoria: "Pizza" },
    { nombre: "Pizza hawaiana", precio: 130, stock: 8, categoria: "Pizza" },
    { nombre: "Rollo California", precio: 95, stock: 20, categoria: "Sushi" },
    { nombre: "Hamburguesa sencilla", precio: 70, stock: 25, categoria: "Hamburguesas" },
    { nombre: "Refresco", precio: 18, stock: 100, categoria: "Bebidas" },
    { nombre: "Rebanada de pastel", precio: 55, stock: 4, categoria: "Postres" },
  ]);

  console.log("Datos de ejemplo cargados ✅");
  process.exit(0); // cerramos el programa
}

llenar();
