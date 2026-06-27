// ============================================================
//  SESIÓN DEL USUARIO
//  Funciones compartidas para guardar, leer y cerrar la sesión.
//  La sesión se guarda en el localStorage del navegador.
//  TODAS las pantallas usan estas funciones (no leen localStorage
//  por su cuenta).
// ============================================================

// Guarda al usuario (después de login o registro).
export function guardarUsuario(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

// Lee al usuario que inició sesión. Devuelve null si no hay nadie.
export function obtenerUsuario() {
  const guardado = localStorage.getItem("usuario");
  return guardado ? JSON.parse(guardado) : null;
}

// Cierra la sesión: borra al usuario del localStorage.
export function cerrarSesion() {
  localStorage.removeItem("usuario");
}
