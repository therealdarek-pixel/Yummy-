//muestra el historial de pedidos del usuario logueado, con mapa y calificación

import { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, ReceiptText } from "lucide-react";
import { socket } from "../socket";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";
import SeguimientoPedido from "../components/SeguimientoPedido";
import Estrellas from "../components/Estrellas";
import MapaPedido from "../components/MapaPedido";

// Coordenadas por defecto (Toluca) por si a un documento le faltan.
const ORIGEN_POR_DEFECTO = [19.2926, -99.6557]; // restaurante
const DESTINO_POR_DEFECTO = [19.282, -99.675]; // casa del usuario

export default function Historial() {
  const usuario = obtenerUsuario(); // el usuario logueado
  const [pedidos, setPedidos] = useState([]);

  // Coordenadas para el mapa.
  const [coordsPorRestaurante, setCoordsPorRestaurante] = useState({}); // { "Nombre": [lat, lng] }
  const [casaUsuario, setCasaUsuario] = useState(DESTINO_POR_DEFECTO);

  // Trae (o vuelve a traer) los pedidos de este usuario.
  function cargarPedidos() {
    fetch(`${URL_BACKEND}/pedidos/usuario/${usuario._id}`)
      .then((r) => r.json())
      .then((datos) => setPedidos(datos));
  }

  useEffect(() => {
    cargarPedidos();

    // Coordenadas de cada restaurante (para el origen del mapa).
    fetch(`${URL_BACKEND}/restaurantes`)
      .then((r) => r.json())
      .then((lista) => {
        const mapa = {};
        lista.forEach((restaurante) => {
          mapa[restaurante.nombre] = [
            restaurante.lat ?? ORIGEN_POR_DEFECTO[0],
            restaurante.lng ?? ORIGEN_POR_DEFECTO[1],
          ];
        });
        setCoordsPorRestaurante(mapa);
      });

    // Coordenadas de la casa del usuario (para el destino del mapa).
    fetch(`${URL_BACKEND}/usuarios/${usuario._id}`)
      .then((r) => r.json())
      .then((datos) => {
        setCasaUsuario([
          datos.lat ?? DESTINO_POR_DEFECTO[0],
          datos.lng ?? DESTINO_POR_DEFECTO[1],
        ]);
      });

    // Si el admin cambia el estado, lo actualizamos aquí (mueve el mapa también).
    socket.on("pedido-actualizado", ({ id, estado }) => {
      setPedidos((actuales) =>
        actuales.map((p) => (p._id === id ? { ...p, estado: estado } : p))
      );
    });

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
    setPedidos((actuales) =>
      actuales.map((p) => (p._id === id ? { ...p, calificacion: estrellas } : p))
    );
  }

  // Vuelve a crear el MISMO pedido (mismos productos y total).
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
      alert(datos.error);
      return;
    }

    alert("¡Pedido repetido!");
    cargarPedidos();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <BarraNavegacion />

      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
        <ReceiptText className="h-5 w-5 text-acento" /> Mis pedidos
      </h2>

      <div className="flex flex-col gap-3">
        {pedidos.length === 0 && (
          <p className="text-sm text-slate-500">
            Todavía no has hecho pedidos. ¡Pide algo desde "Restaurantes"!
          </p>
        )}

        {pedidos.map((pedido) => {
          const entregado = pedido.estado === "entregado";
          // Origen (restaurante) y destino (casa) para el mapa.
          const origen = coordsPorRestaurante[pedido.restaurante] || ORIGEN_POR_DEFECTO;
          return (
            <div
              key={pedido._id}
              className={
                "tarjeta p-5 " + (entregado ? "border-emerald-300 bg-emerald-50" : "")
              }
            >
              <p className="font-semibold text-slate-800">{pedido.restaurante}</p>

              {pedido.productos.map((p, i) => (
                <p key={i} className="ml-1 text-sm text-slate-500">
                  • {p.nombre} (${p.precio})
                </p>
              ))}

              <p className="mt-2 text-lg font-bold text-slate-800">
                Total: ${pedido.total}
              </p>

              {/* Barra de etapas */}
              <SeguimientoPedido estado={pedido.estado} />

              {/* Mapa: el pedido se acerca del restaurante a la casa */}
              <MapaPedido origen={origen} destino={casaUsuario} estado={pedido.estado} />

              {/* Si ya llegó: mensaje + calificación con estrellas */}
              {entregado && (
                <>
                  <p className="mt-3 flex items-center justify-center gap-2 font-semibold text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" /> ¡Tu pedido llegó!
                  </p>

                  <div className="mt-3 border-t border-slate-200 pt-3">
                    {pedido.calificacion ? (
                      <>
                        <span className="mb-1.5 block text-xs text-slate-500">
                          Tu calificación:
                        </span>
                        <Estrellas valor={pedido.calificacion} />
                      </>
                    ) : (
                      <>
                        <span className="mb-1.5 block text-xs text-slate-500">
                          ¿Qué te pareció? Califica tu pedido:
                        </span>
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
              <button
                onClick={() => repetir(pedido)}
                className="btn btn-ghost mt-3 w-full"
              >
                <RotateCcw className="h-4 w-4" /> Repetir pedido
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
