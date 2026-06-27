// ============================================================
//  CONEXIÓN CON EL BACKEND
//  Define la dirección del backend y unos ayudantes cortos para
//  llamar a la API sin repetir el mismo fetch en cada pantalla.
// ============================================================

// Dirección del backend (de la variable de entorno, o local por defecto).
export const URL_BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Pide datos al backend (GET) y devuelve la respuesta ya en JSON.
export async function obtenerJSON(ruta) {
  const respuesta = await fetch(`${URL_BACKEND}${ruta}`);
  return respuesta.json();
}

// Manda datos al backend (POST/PUT/DELETE) y devuelve la respuesta en JSON.
// El "cuerpo" es opcional: si no se manda, no se arma encabezado ni body.
export async function enviarJSON(ruta, metodo, cuerpo) {
  const opciones = { method: metodo };

  if (cuerpo !== undefined) {
    opciones.headers = { "Content-Type": "application/json" };
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(`${URL_BACKEND}${ruta}`, opciones);
  return respuesta.json();
}
