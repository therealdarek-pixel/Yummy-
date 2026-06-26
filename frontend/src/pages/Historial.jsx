// ============================================================
//  PÁGINA DE HISTORIAL
//  Muestra los pedidos PASADOS del usuario que inició sesión.
//  Se actualiza en TIEMPO REAL cuando el admin cambia el estado.
//  Además: cuando un pedido llega "entregado" se puede CALIFICAR
//  con estrellas, y cualquier pedido se puede REPETIR.
// ============================================================

import { useState, useEffect } from "react";
import { socket } from "../socket";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";
import SeguimientoPedido from "../components/SeguimientoPedido";
import Estrellas from "../components/Estrellas";

export default function Historial() {
  const usuario = obtenerUsuario(); // el usuario logueado
  const [pedidos, setPedidos] = useState([]);

  // Trae (o vuelve a traer) los pedidos de este usuario.
  function cargarPedidos() {
    fetch(`${URL_BACKEND}/pedidos/usuario/${usuario._id}`)
      .then((r) => r.json())
      .then((datos) => setPedidos(datos));
  }

  useEffect(() => {
    // 1. Al abrir, traemos SOLO los pedidos de este usuario.
    cargarPedidos();

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

  // Guarda la calificación (estrellas) de un pedido entregado.
  async function calificar(id, estrellas) {
    await fetch(`${URL_BACKEND}/pedidos/${id}/calificacion`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificacion: estrellas }),
    });
    // Lo reflejamos al instante en la pantalla (sin recargar).
    setPedidos((actuales) =>
      actuales.map((p) => (p._id === id ? { ...p, calificacion: estrellas } : p))
    );
  }

  // Vuelve a crear el MISMO pedido (mismos productos y total).
  // Reusa la ruta de crear pedido; si no alcanza el saldo, el backend avisa.
  async function repetir(pedido) {
    const respuesta = await fetch(`${URL_BACKEND}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: usuario._id,
        restaurante: pedido.restaurante,
        productos: pedido.productos,
        total: pedido.total,
      }),
    });
    const datos = await respuesta.json();

    if (datos.error) {
      alert(datos.error); // por ejemplo: "Saldo insuficiente"
      return;
    }

    alert("¡Pedido repetido! 🎉");
    cargarPedidos(); // refrescamos la lista para que aparezca el nuevo
  }

  return (
    <div className="pagina">
      {/* Barra de navegación (con el botón "Restaurantes" para volver a pedir) */}
      <BarraNavegacion />

      <h3 className="seccion-titulo">📜 Mis pedidos</h3>

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

              {/* Si ya llegó: mensaje de festejo + calificación con estrellas */}
              {entregado && (
                <>
                  <p className="mensaje-entregado">✅ ¡Tu pedido llegó! 🎉</p>

                  <div className="bloque-calificacion">
                    {pedido.calificacion ? (
                      // Ya calificado: mostramos las estrellas FIJAS.
                      <>
                        <span>Tu calificación:</span>
                        <Estrellas valor={pedido.calificacion} />
                      </>
                    ) : (
                      // Todavía sin calificar: estrellas que se pueden PICAR.
                      <>
                        <span>¿Qué te pareció? Califica tu pedido:</span>
                        <Estrellas
                          valor={0}
                          onCalificar={(n) => calificar(pedido._id, n)}
                        />
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Botón para volver a pedir lo mismo */}
              <button className="repetir" onClick={() => repetir(pedido)}>
                🔁 Repetir pedido
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
