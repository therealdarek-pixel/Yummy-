// ============================================================
//  PÁGINA DEL ADMIN
//  Muestra todos los pedidos y se actualiza EN TIEMPO REAL.
//  También deja cambiar el estado de cada pedido.
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { URL_BACKEND } from "../api";
import { obtenerUsuario, cerrarSesion } from "../sesion";
import SeguimientoPedido from "../components/SeguimientoPedido";
import { ETAPAS } from "../etapas";

export default function Admin() {
  const navegar = useNavigate();
  const admin = obtenerUsuario(); // el admin que inició sesión
  const [pedidos, setPedidos] = useState([]);

  // Cierra la sesión del admin y regresa al login.
  function salir() {
    cerrarSesion();
    navegar("/login");
  }

  useEffect(() => {
    // 1. Al abrir, traemos los pedidos que YA existen.
    fetch(`${URL_BACKEND}/pedidos`)
      .then((r) => r.json())
      .then((datos) => setPedidos(datos));

    // 2. Cuando llega un pedido NUEVO, lo ponemos hasta arriba.
    socket.on("nuevo-pedido", (pedido) => {
      setPedidos((actuales) => [pedido, ...actuales]);
    });

    // 3. Cuando un pedido cambia de estado, lo actualizamos en la lista.
    socket.on("pedido-actualizado", ({ id, estado }) => {
      setPedidos((actuales) =>
        actuales.map((p) => (p._id === id ? { ...p, estado: estado } : p))
      );
    });

    // 4. Al salir de la página, dejamos de escuchar (buena práctica).
    return () => {
      socket.off("nuevo-pedido");
      socket.off("pedido-actualizado");
    };
  }, []);

  // Le pide al backend cambiar el estado de un pedido.
  async function cambiarEstado(id, estado) {
    await fetch(`${URL_BACKEND}/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estado }),
    });
    // No actualizamos aquí: el backend nos avisa por socket y se actualiza solo.
  }

  // Pasa el pedido a la SIGUIENTE etapa automáticamente.
  // Ejemplo: si está en "preparando", lo manda a "en camino".
  function avanzarEtapa(pedido) {
    const posicion = ETAPAS.indexOf(pedido.estado);
    // Si todavía no es la última etapa, avanzamos a la que sigue.
    if (posicion < ETAPAS.length - 1) {
      cambiarEstado(pedido._id, ETAPAS[posicion + 1]);
    }
  }

  // El admin solo ve los pedidos EN PROCESO (no los entregados).
  // OJO: no borramos nada de la base de datos; solo filtramos lo que se muestra.
  const pedidosActivos = pedidos.filter((p) => p.estado !== "entregado");

  return (
    <div className="pagina">
      <header className="barra">
        <div className="barra-info">
          <h2>💻 Panel de Admin</h2>
          <span className="saldo">{admin.nombre}</span>
        </div>
        <button onClick={salir}>🚪 Cerrar sesión</button>
      </header>

      <div className="lista">
        {pedidosActivos.length === 0 && <p>No hay pedidos activos 📭</p>}

        {pedidosActivos.map((pedido) => (
          <div key={pedido._id} className="tarjeta-pedido">
            <p>
              <b>{pedido.usuario}</b> pidió en <b>{pedido.restaurante}</b>
            </p>

            {/* Lista de productos del pedido */}
            {pedido.productos.map((p, i) => (
              <p key={i} className="producto">• {p.nombre} (${p.precio})</p>
            ))}

            <p className="total">Total: ${pedido.total}</p>

            {/* Barra de seguimiento: el admin ve clara la etapa actual */}
            <SeguimientoPedido estado={pedido.estado} />

            {/* Botón rápido para pasar a la siguiente etapa.
                Se deshabilita cuando ya está "entregado". */}
            <button
              className="boton avanzar"
              onClick={() => avanzarEtapa(pedido)}
              disabled={pedido.estado === "entregado"}
            >
              ⏭ Avanzar a la siguiente etapa
            </button>

            {/* Botones para ir a un estado específico */}
            <div className="botones">
              <button onClick={() => cambiarEstado(pedido._id, "preparando")}>
                Preparando
              </button>
              <button onClick={() => cambiarEstado(pedido._id, "en camino")}>
                En camino
              </button>
              <button onClick={() => cambiarEstado(pedido._id, "entregado")}>
                Entregado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
