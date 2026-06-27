// ============================================================
//  RUTAS DE LA APP
//  Aquí decimos qué pantalla se ve en cada dirección.
//  Las pantallas de usuario y admin están PROTEGIDAS:
//  si no has iniciado sesión, te manda al login.
// ============================================================

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Usuario from "./pages/Usuario.jsx";
import Restaurante from "./pages/Restaurante.jsx";
import Historial from "./pages/Historial.jsx";
import MisTickets from "./pages/MisTickets.jsx";
import Admin from "./pages/Admin.jsx";
import { obtenerUsuario } from "./sesion";

export default function App() {
  return (
    <Routes>
      {/* Al entrar a "/", mandamos directo al login. */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Pantallas públicas (no necesitan sesión) */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Lado del USUARIO (protegido) */}
      <Route path="/usuario" element={<Protegida><Usuario /></Protegida>} />
      <Route
        path="/usuario/restaurante/:id"
        element={<Protegida><Restaurante /></Protegida>}
      />
      <Route
        path="/usuario/historial"
        element={<Protegida><Historial /></Protegida>}
      />
      <Route
        path="/usuario/tickets"
        element={<Protegida><MisTickets /></Protegida>}
      />

      {/* Lado del ADMIN (protegido y solo para admins) */}
      <Route path="/admin" element={<Protegida soloAdmin><Admin /></Protegida>} />
    </Routes>
  );
}

// "Guardia" de las rutas: revisa si hay sesión antes de mostrar la pantalla.
// - Si no hay nadie logueado, manda al login.
// - Si la ruta es soloAdmin y el usuario NO es admin, lo manda a /usuario.
function Protegida({ children, soloAdmin }) {
  const usuario = obtenerUsuario();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (soloAdmin && !usuario.esAdmin) {
    return <Navigate to="/usuario" />;
  }

  return children;
}
