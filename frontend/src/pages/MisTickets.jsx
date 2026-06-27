// ============================================================
//  MIS TICKETS (USUARIO)
//  Muestra todos los pedidos del usuario como comprobantes
//  (tickets): número, restaurante, productos, total y fecha.
//  Reusa la ruta GET /pedidos/usuario/:id (del más nuevo al más viejo).
// ============================================================

import { useState, useEffect } from "react";
import { Ticket } from "lucide-react";
import { obtenerJSON } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";

export default function MisTickets() {
  const usuario = obtenerUsuario(); // el usuario logueado
  const [pedidos, setPedidos] = useState([]);

  // Trae los pedidos del usuario (ya vienen ordenados del más reciente al más viejo).
  useEffect(() => {
    obtenerJSON(`/pedidos/usuario/${usuario._id}`).then((datos) => setPedidos(datos));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <BarraNavegacion />

      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
        <Ticket className="h-5 w-5 text-acento" /> Mis tickets
      </h2>

      <div className="flex flex-col gap-3">
        {pedidos.length === 0 && (
          <p className="text-sm text-slate-500">
            Aún no tienes tickets. Haz un pedido y tu comprobante aparecerá aquí.
          </p>
        )}

        {/* Cada pedido se ve como una tarjeta de ticket (comprobante) */}
        {pedidos.map((pedido) => (
          <div key={pedido._id} className="tarjeta p-5">
            {/* Encabezado: número de ticket + fecha */}
            <div className="mb-2 flex items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-acento">
                <Ticket className="h-4 w-4" /> Ticket #{pedido._id}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(pedido.fecha).toLocaleString()}
              </span>
            </div>

            <p className="font-semibold text-slate-800">{pedido.restaurante}</p>

            {/* Productos del ticket */}
            <div className="mt-1">
              {pedido.productos.map((producto, i) => (
                <p key={i} className="ml-1 text-sm text-slate-500">
                  • {producto.nombre} (${producto.precio})
                </p>
              ))}
            </div>

            <p className="mt-3 text-lg font-bold text-slate-800">
              Total: ${pedido.total}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}