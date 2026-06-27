// ============================================================
//  PÁGINA DEL ADMIN
//  Muestra todos los pedidos EN TIEMPO REAL y deja cambiar el
//  estado de cada pedido.
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Inbox,
  ClipboardList,
  Package,
  AlertTriangle,
  X,
  BarChart3,
} from "lucide-react";
import { socket } from "../socket";
import { URL_BACKEND } from "../api";
import { obtenerUsuario, cerrarSesion } from "../sesion";
import SeguimientoPedido from "../components/SeguimientoPedido";
import GerenteProductos from "./GerenteProductos";
import GerenteReportes from "./GerenteReportes";
import { ETAPAS } from "../etapas";

export default function Admin() {
  const navegar = useNavigate();
  const admin = obtenerUsuario(); // el gerente que inició sesión
  const [pedidos, setPedidos] = useState([]);
  const [pestaña, setPestaña] = useState("pedidos"); // pestaña activa del panel
  const [alertaStock, setAlertaStock] = useState(null); // aviso de stock bajo

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

    // 4. Cuando un producto se queda con stock bajo, mostramos el banner.
    socket.on("stock-bajo", (producto) => {
      setAlertaStock(producto);
    });

    // 5. Al salir, dejamos de escuchar.
    return () => {
      socket.off("nuevo-pedido");
      socket.off("pedido-actualizado");
      socket.off("stock-bajo");
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
  function avanzarEtapa(pedido) {
    const posicion = ETAPAS.indexOf(pedido.estado);
    if (posicion < ETAPAS.length - 1) {
      cambiarEstado(pedido._id, ETAPAS[posicion + 1]);
    }
  }

  // El admin solo ve los pedidos EN PROCESO (no los entregados).
  const pedidosActivos = pedidos.filter((p) => p.estado !== "entregado");

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      {/* Barra superior del admin */}
      <header className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-acento">
          <UtensilsCrossed className="h-5 w-5" /> Yummy
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <LayoutDashboard className="h-4 w-4" /> Panel de Gerente
          </span>
          <span className="rounded-full bg-acento-suave px-3 py-1 text-sm font-semibold text-acento-oscuro">
            {admin.nombre}
          </span>
        </div>
        <button onClick={salir} className="btn btn-ghost ml-auto">
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </header>

      {/* Banner de alerta de stock bajo */}
      {alertaStock && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-sm font-semibold text-amber-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            Stock bajo: "{alertaStock.nombre}" quedó en {alertaStock.stock}{" "}
            unidades.
          </span>
          <button
            onClick={() => setAlertaStock(null)}
            className="ml-auto text-amber-700 hover:text-amber-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Pestañas del panel de gerente */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setPestaña("pedidos")}
          className={"chip" + (pestaña === "pedidos" ? " chip-activo" : "")}
        >
          <ClipboardList className="h-3.5 w-3.5" /> Pedidos
        </button>
        <button
          onClick={() => setPestaña("productos")}
          className={"chip" + (pestaña === "productos" ? " chip-activo" : "")}
        >
          <Package className="h-3.5 w-3.5" /> Productos
        </button>
        <button
          onClick={() => setPestaña("reportes")}
          className={"chip" + (pestaña === "reportes" ? " chip-activo" : "")}
        >
          <BarChart3 className="h-3.5 w-3.5" /> Reportes
        </button>
      </div>

      {pestaña === "productos" && <GerenteProductos />}

      {pestaña === "reportes" && <GerenteReportes />}

      {pestaña === "pedidos" && (
      <div className="flex flex-col gap-3">
        {pedidosActivos.length === 0 && (
          <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-slate-400">
            <Inbox className="h-8 w-8" />
            <p>No hay pedidos activos</p>
          </div>
        )}

        {pedidosActivos.map((pedido) => (
          <div key={pedido._id} className="tarjeta p-5">
            <p className="text-slate-700">
              <span className="font-semibold">{pedido.usuario}</span> pidió en{" "}
              <span className="font-semibold">{pedido.restaurante}</span>
            </p>

            {pedido.productos.map((p, i) => (
              <p key={i} className="ml-1 text-sm text-slate-500">
                • {p.nombre} (${p.precio})
              </p>
            ))}

            <p className="mt-2 text-lg font-bold text-slate-800">
              Total: ${pedido.total}
            </p>

            {/* Barra de seguimiento */}
            <SeguimientoPedido estado={pedido.estado} />

            {/* Botón rápido para pasar a la siguiente etapa */}
            <button
              onClick={() => avanzarEtapa(pedido)}
              disabled={pedido.estado === "entregado"}
              className="btn btn-primario mt-3 w-full"
            >
              <ChevronRight className="h-4 w-4" /> Avanzar a la siguiente etapa
            </button>

            {/* Botones para ir a un estado específico */}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => cambiarEstado(pedido._id, "preparando")}
                className="btn btn-ghost"
              >
                Preparando
              </button>
              <button
                onClick={() => cambiarEstado(pedido._id, "en camino")}
                className="btn btn-ghost"
              >
                En camino
              </button>
              <button
                onClick={() => cambiarEstado(pedido._id, "entregado")}
                className="btn btn-ghost"
              >
                Entregado
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
