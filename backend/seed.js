// ============================================================
//  DATOS DE EJEMPLO (SEED)
//  Este archivo LLENA la base de datos con datos de prueba.
//  Se corre UNA SOLA VEZ con el comando:  npm run seed
// ============================================================

const { conectar } = require("./db");

async function llenar() {
  const bd = await conectar();

  // 1. Borramos todo lo que haya para empezar limpio.
  await bd.collection("usuarios").deleteMany({});
  await bd.collection("restaurantes").deleteMany({});
  await bd.collection("pedidos").deleteMany({});

  // 2. Creamos los usuarios de ejemplo.
  //    Ahora cada usuario tiene correo, contraseña y si es admin o no.
  //    OJO: la contraseña va en texto plano porque es una práctica escolar.
  await bd.collection("usuarios").insertMany([
    // Usuario ADMIN: con este se entra al panel de pedidos.
    {
      nombre: "Administrador",
      correo: "admin@didi.com",
      contraseña: "admin123",
      saldo: 0,
      esAdmin: true,
    },
    // Usuario NORMAL de ejemplo (también puedes crear los tuyos en /registro).
    {
      nombre: "Zylly",
      correo: "zylly@didi.com",
      contraseña: "1234",
      saldo: 500,
      esAdmin: false,
    },
  ]);

  // 3. Creamos los restaurantes.
  //    En Mongo conviene porque el menú y el restaurante siempre van juntos.
  await bd.collection("restaurantes").insertMany([
    {
      nombre: "Tacos El Güero",
      imagen: "🌮",
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
      menu: [
        { nombre: "Hamburguesa sencilla", precio: 70 },
        { nombre: "Hamburguesa doble", precio: 95 },
        { nombre: "Papas a la francesa", precio: 40 },
        { nombre: "Malteada", precio: 50 },
      ],
    },
  ]);

  console.log("Datos de ejemplo cargados ✅");
  process.exit(0); // cerramos el programa
}

llenar();
