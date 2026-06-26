// ============================================================
//  BARRA DE NAVEGACIÓN (lado del usuario)
//  Barra superior que se ve IGUAL en todas las pantallas del
//  usuario. Muestra su nombre, su saldo y botones para moverse
//  entre pantallas, además de "Cerrar sesión" siempre visible.
//
//  La prop "saldo" es OPCIONAL:
//   - Si la pantalla nos pasa el saldo, lo mostramos (sirve para
//     que se actualice al instante, por ejemplo al recargar).
//   - Si NO nos lo pasan, la barra lo busca sola en el backend.
// ============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { URL_BACKEND } from "../api";
import { obtenerUsuario, cerrarSesion } from "../sesion";

export default function BarraNavegacion({ saldo }) {
  const navegar = useNavigate();
  const usuario = obtenerUsuario(); // el usuario que inició sesión
  const [saldoBuscado, setSaldoBuscado] = useState(null);

  // Si la pantalla NO nos pasó el saldo, lo buscamos nosotros.
  useEffect(() => {
    if (saldo === undefined && usuario) {
      fetch(`${URL_BACKEND}/usuarios/${usuario._id}`)
        .then((r) => r.json())
        .then((datos) => setSaldoBuscado(datos.saldo));
    }
  }, []);

  // El saldo que vamos a mostrar: el de la pantalla o el que buscamos.
  const saldoAMostrar = saldo !== undefined ? saldo : saldoBuscado;

  // Cierra la sesión y regresa al login.
  function salir() {
    cerrarSesion();
    navegar("/login");
  }

  return (
    <header className="barra">
      {/* Lado izquierdo: nombre y saldo del usuario */}
      <div className="barra-info">
        <b>Hola, {usuario.nombre}</b>
        {saldoAMostrar !== null && (
          <span className="saldo">💰 ${saldoAMostrar}</span>
        )}
      </div>

      {/* Lado derecho: botones para moverse y cerrar sesión */}
      <nav className="barra-links">
        <Link to="/usuario" className="boton">🍔 Restaurantes</Link>
        <Link to="/usuario/historial" className="boton">📜 Mis pedidos</Link>
        <button onClick={salir}>🚪 Cerrar sesión</button>
      </nav>
    </header>
  );
}
