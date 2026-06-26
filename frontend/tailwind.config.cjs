/** @type {import('tailwindcss').Config} */
// Configuración de Tailwind. "content" le dice dónde buscar las clases
// que usamos para no incluir CSS de más.
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Color de acento de Yummy (verde sobrio y elegante).
      colors: {
        acento: {
          DEFAULT: "#1f6f54",
          oscuro: "#185c45",
          suave: "#eaf3ef",
        },
      },
      // Tipografías (ya se cargan desde index.html con Google Fonts).
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
