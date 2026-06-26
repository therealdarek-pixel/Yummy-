// ============================================================
//  PÁGINA DE HISTORIAL
//  Muestra los pedidos PASADOS del usuario que inició sesión.
//  Se actualiza en TIEMPO REAL cuando el admin cambia el estado.
// ============================================================

import { useState, useEffect } from "react";
import { socket } from "../socket";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";
import SeguimientoPedido from "../components/SeguimientoPedido";

export default function Historial() {
  const usuario = obtenerUsuario(); // el usuario logueado
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    // 1. Al abrir, traemos SOLO los pedidos de este usuario.
    fetch(`${URL_BACKEND}/pedidos/usuario/${usuario._id}`)
      .then((r) => r.json())
      .then((datos) => setPedidos(datos));

    // 2. Si el admin cambia el estado de un pedido, lo actualizamos aquí.
    socket.on("pedido-actualizado", ({ id, estado }) => {
      setPedidos((actuales) =>
        actuales.map((p) => (p._id === id ? { ...p, estado: estado } : p))
      );
    });

    // 3. Al salir, dejamos de escuchar (buena práctica).
    return () => {
      socket.off("pedido-actualizado");
    };
  }, []);

  return (
    <div className="pagina">
      {/* Barra de navegación (con el botón "Restaurantes" para volver a pedir) */}
      <BarraNavegacion />

      <h3 style={{ margin: "16px 0 12px" }}>📜 Mis pedidos</h3>

      <div className="lista">
        {pedidos.length === 0 && (
          <p>Todavía no has hecho pedidos. ¡Pide algo desde "Restaurantes"! 🍔</p>
        )}

        {pedidos.map((pedido) => {
          // ¿Ya llegó este pedido? Para mostrarlo distinto (verde + festejo).
          const entregado = pedido.estado === "entregado";
          return (
            <div
              key={pedido._id}
              className={entregado ? "tarjeta-pedido entregado" : "tarjeta-pedido"}
            >
              <p><b>{pedido.restaurante}</b></p>

              {/* Lista de productos del pedido */}
              {pedido.productos.map((p, i) => (
                <p key={i} className="producto">• {p.nombre} (${p.precio})</p>
              ))}

              <p className="total">Total: ${pedido.total}</p>

              {/* Barra de seguimiento: muestra en qué etapa va el pedido */}
              <SeguimientoPedido estado={pedido.estado} />

              {/* Si ya llegó, mostramos un mensaje bonito de festejo */}
              {entregado && (
                <p className="mensaje-entregado">✅ ¡Tu pedido llegó! 🎉</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
