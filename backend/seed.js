// ============================================================
//  DATOS DE EJEMPLO (SEED)
//  Este archivo LLENA la base de datos con datos de prueba.
//  Se corre UNA SOLA VEZ con el comando:  npm run seed
//
//  OJO: borra y vuelve a llenar las colecciones usuarios,
//  restaurantes y pedidos. Córrelo de nuevo si quieres que los
//  restaurantes tengan su "categoria" (para los filtros).
// ============================================================

const { conectar } = require("./db");

async function llenar() {
  const bd = await conectar();

  // 1. Borramos todo lo que haya para empezar limpio.
  await bd.collection("usuarios").deleteMany({});
  await bd.collection("restaurantes").deleteMany({});
  await bd.collection("pedidos").deleteMany({});

  // 2. Creamos los usuarios de ejemplo.
  //    Cada usuario tiene correo, contraseña, si es admin y sus favoritos.
  //    OJO: la contraseña va en texto plano porque es una práctica escolar.
  await bd.collection("usuarios").insertMany([
    // Usuario ADMIN: con este se entra al panel de pedidos.
    {
      nombre: "Administrador",
      correo: "admin@didi.com",
      contraseña: "admin123",
      saldo: 0,
      esAdmin: true,
      favoritos: [], // arreglo de ids de restaurantes favoritos (empieza vacío)
    },
    // Usuario NORMAL de ejemplo (también puedes crear los tuyos en /registro).
    {
      nombre: "Zylly",
      correo: "zylly@didi.com",
      contraseña: "1234",
      saldo: 500,
      esAdmin: false,
      favoritos: [],
    },
  ]);

  // 3. Creamos los restaurantes.
  //    Cada uno tiene una "categoria" (para el buscador y los filtros).
  //    En Mongo conviene porque el menú y el restaurante siempre van juntos.
  await bd.collection("restaurantes").insertMany([
    {
      nombre: "Tacos El Güero",
      imagen: "🌮",
      categoria: "Mexicana",
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
      menu: [
        { nombre: "Hamburguesa sencilla", precio: 70 },
        { nombre: "Hamburguesa doble", precio: 95 },
        { nombre: "Papas a la francesa", precio: 40 },
        { nombre: "Malteada", precio: 50 },
      ],
    },
    // Dos restaurantes NUEVOS para que los filtros de categoría luzcan mejor.
    {
      nombre: "Antojitos Doña Rosa",
      imagen: "🫔",
      categoria: "Mexicana",
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
      menu: [
        { nombre: "Rebanada de pastel", precio: 55 },
        { nombre: "Brownie con helado", precio: 60 },
        { nombre: "Crepa de Nutella", precio: 65 },
        { nombre: "Malteada de fresa", precio: 50 },
      ],
    },
  ]);

  console.log("Datos de ejemplo cargados ✅");
  process.exit(0); // cerramos el programa
}

llenar();
