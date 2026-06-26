// ============================================================
//  PÁGINA DEL USUARIO
//  Muestra la barra de navegación, un botón para recargar saldo
//  y la lista de restaurantes del usuario que inició sesión.
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";

export default function Usuario() {
  const usuarioSesion = obtenerUsuario(); // el usuario logueado (id y nombre)

  // Aquí guardamos lo que traemos del backend.
  const [restaurantes, setRestaurantes] = useState([]);
  const [saldo, setSaldo] = useState(null);

  // useEffect corre UNA VEZ cuando se abre la página.
  useEffect(() => {
    // Pedimos la lista de restaurantes.
    fetch(`${URL_BACKEND}/restaurantes`)
      .then((r) => r.json())
      .then((datos) => setRestaurantes(datos));

    // Pedimos al usuario logueado (para mostrar SU saldo actualizado).
    fetch(`${URL_BACKEND}/usuarios/${usuarioSesion._id}`)
      .then((r) => r.json())
      .then((datos) => setSaldo(datos.saldo));
  }, []);

  // Recarga $100 al saldo del usuario.
  async function recargar() {
    const respuesta = await fetch(
      `${URL_BACKEND}/usuarios/${usuarioSesion._id}/recargar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: 100 }),
      }
    );
    const datos = await respuesta.json();
    setSaldo(datos.saldoNuevo); // el saldo nuevo se ve al instante (también en la barra)
  }

  return (
    <div className="pagina">
      {/* Barra de navegación con nombre, saldo y botones */}
      <BarraNavegacion saldo={saldo} />

      {/* Botón para recargar saldo */}
      <div className="acciones">
        <button onClick={recargar}>➕ Recargar $100</button>
      </div>

      <h3 style={{ margin: "16px 0 12px" }}>Restaurantes</h3>

      <div className="lista">
        {restaurantes.map((r) => (
          // Cada restaurante es un enlace a su menú.
          <Link
            key={r._id}
            to={`/usuario/restaurante/${r._id}`}
            className="tarjeta"
          >
            <span className="emoji">{r.imagen}</span>
            <span>{r.nombre}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
