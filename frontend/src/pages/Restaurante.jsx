// ============================================================
//  PÁGINA DE UN RESTAURANTE
//  Muestra el menú, deja agregar al carrito y confirmar el pedido.
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ShoppingCart, CheckCircle2 } from "lucide-react";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";

export default function Restaurante() {
  const { id } = useParams();
  const navegar = useNavigate();
  const usuario = obtenerUsuario();

  const [restaurante, setRestaurante] = useState(null);
  const [carrito, setCarrito] = useState([]); // productos que va agregando
  const [ticket, setTicket] = useState(null); // datos del ticket de confirmación

  useEffect(() => {
    fetch(`${URL_BACKEND}/restaurantes/${id}`)
      .then((r) => r.json())
      .then((datos) => setRestaurante(datos));
  }, [id]);

  function agregar(producto) {
    setCarrito([...carrito, producto]);
  }

  // Sumamos el total de todo lo que hay en el carrito.
  const total = carrito.reduce((suma, p) => suma + p.precio, 0);

  async function confirmar() {
    const respuesta = await fetch(`${URL_BACKEND}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: usuario._id,
        restaurante: restaurante.nombre,
        productos: carrito,
        total: total,
      }),
    });
    const datos = await respuesta.json();

    if (datos.error) {
      alert(datos.error);
    } else {
      // Guardamos los datos del ticket para mostrar el comprobante.
      setTicket({
        numeroTicket: datos.numeroTicket,
        restaurante: restaurante.nombre,
        productos: carrito,
        total: total,
        fecha: new Date(),
      });
    }
  }

  if (!restaurante) {
    return <p className="mx-auto max-w-2xl px-4 py-5 text-slate-500">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <BarraNavegacion />

      {/* Sub-encabezado: regresar + nombre del restaurante */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navegar(-1)} className="btn btn-ghost">
          <ArrowLeft className="h-4 w-4" /> Regresar
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          <span className="mr-1">{restaurante.imagen}</span>
          {restaurante.nombre}
        </h2>
      </div>

      {/* MENÚ */}
      <div className="flex flex-col gap-3">
        {restaurante.menu.map((producto, i) => (
          <div
            key={i}
            className="tarjeta flex items-center justify-between gap-3 p-4 transition hover:shadow-md"
          >
            <span className="font-medium text-slate-700">{producto.nombre}</span>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800">${producto.precio}</span>
              <button onClick={() => agregar(producto)} className="btn btn-ghost">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CARRITO */}
      <div className="tarjeta mt-6 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <ShoppingCart className="h-5 w-5 text-acento" /> Tu pedido
        </h3>
        {carrito.length === 0 && (
          <p className="text-sm text-slate-500">Aún no agregas nada.</p>
        )}
        {carrito.map((p, i) => (
          <p key={i} className="text-sm text-slate-600">
            {p.nombre} — ${p.precio}
          </p>
        ))}
        <p className="mt-3 text-lg font-bold text-slate-800">Total: ${total}</p>
        {carrito.length > 0 && (
          <button onClick={confirmar} className="btn btn-primario mt-3 w-full">
            Confirmar pedido
          </button>
        )}
      </div>

      {/* TICKET DE CONFIRMACIÓN (modal) */}
      {ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="tarjeta w-full max-w-sm p-6">
            <div className="mb-3 flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <h3 className="font-display text-xl font-bold text-slate-800">
                ¡Pedido confirmado!
              </h3>
            </div>

            <div className="border-t border-slate-200 pt-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold">Ticket:</span> {ticket.numeroTicket}
              </p>
              <p>
                <span className="font-semibold">Restaurante:</span> {ticket.restaurante}
              </p>
              <p>
                <span className="font-semibold">Fecha:</span>{" "}
                {ticket.fecha.toLocaleString()}
              </p>

              <div className="mt-2">
                <span className="font-semibold">Productos:</span>
                {ticket.productos.map((p, i) => (
                  <p key={i} className="ml-1 text-slate-500">
                    • {p.nombre} (${p.precio})
                  </p>
                ))}
              </div>

              <p className="mt-3 text-lg font-bold text-slate-800">
                Total: ${ticket.total}
              </p>
            </div>

            <button
              onClick={() => navegar("/usuario/historial")}
              className="btn btn-primario mt-4 w-full"
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
