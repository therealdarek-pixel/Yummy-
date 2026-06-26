// ============================================================
//  DIRECCIÓN DEL BACKEND
//  Aquí decimos en dónde está nuestro servidor.
// ============================================================

// La dirección del backend viene de una variable de entorno de Vite.
// - En tu compu usa "http://localhost:3000" (el valor por defecto).
// - En Vercel se pondrá VITE_BACKEND_URL con la URL de tu backend en Render.
//   (Las variables de Vite que se usan en el navegador DEBEN empezar con VITE_)
export const URL_BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
