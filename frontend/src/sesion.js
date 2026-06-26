// Guarda al usuario (después de login o registro).
export function guardarUsuario(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

// Lee al usuario que inició sesión. Devuelve null si no hay nadie.
export function obtenerUsuario() {
  const texto = localStorage.getItem("usuario");
  return texto ? JSON.parse(texto) : null;
}

// Cierra la sesión: borra al usuario del localStorage.
export function cerrarSesion() {
  localStorage.removeItem("usuario");
}
