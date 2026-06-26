import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración de Vite (la herramienta que prende el frontend).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // IMPORTANTE: esto deja abrir la página desde el celular
  },
});
