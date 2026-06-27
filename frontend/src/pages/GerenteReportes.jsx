// ============================================================
//  REPORTES (PANEL DE GERENTE)
//  Muestra el producto estrella, un calendario por RANGO para ver
//  las ventas de varios días (tabla completa) y gráficas de barras
//  de las ventas diarias y semanales. Datos de la colección "ventas".
// ============================================================

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, CalendarDays, Trophy, CalendarSearch } from "lucide-react";
import { obtenerJSON } from "../api";

// Color de acento de Yummy (para las barras de las gráficas).
const COLOR_ACENTO = "#1f6f54";

// Pasa una fecha del calendario a texto AAAA-MM-DD (para mandarla al backend).
function aTexto(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

// Agrupa los productos de una venta por nombre y cuenta la cantidad.
// (En "ventas" cada producto va como una unidad, así que contamos repeticiones.)
function contarProductos(productos) {
  const conteo = {};
  productos.forEach((producto) => {
    conteo[producto.nombre] = (conteo[producto.nombre] || 0) + 1;
  });
  return Object.keys(conteo).map((nombre) => ({ nombre, cantidad: conteo[nombre] }));
}

export default function GerenteReportes() {
  // ============================
  //  ESTADOS
  // ============================
  const [diarias, setDiarias] = useState([]);
  const [semanales, setSemanales] = useState([]);
  const [estrella, setEstrella] = useState(null);

  // Calendario por rango: { from, to } y el reporte del rango elegido.
  const [rango, setRango] = useState(null);
  const [reporteRango, setReporteRango] = useState(null);

  // ============================
  //  EFECTOS (CARGA DE DATOS)
  // ============================

  // Carga inicial: datos para las gráficas, las tablas y el producto estrella.
  useEffect(() => {
    obtenerJSON("/reportes/ventas-diarias").then((datos) => setDiarias(datos));
    obtenerJSON("/reportes/ventas-semanales").then((datos) => setSemanales(datos));
    obtenerJSON("/reportes/producto-estrella").then((datos) => setEstrella(datos));
  }, []);

  // Cuando el gerente elige un rango, pedimos las ventas de ese rango.
  // Si solo eligió el día de inicio, usamos ese mismo día como fin.
  useEffect(() => {
    if (!rango || !rango.from) {
      setReporteRango(null);
      return;
    }
    const desde = aTexto(rango.from);
    const hasta = aTexto(rango.to || rango.from);
    obtenerJSON(`/reportes/ventas-diarias?desde=${desde}&hasta=${hasta}`).then(
      (datos) => setReporteRango(datos)
    );
  }, [rango]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
        <BarChart3 className="h-5 w-5 text-acento" /> Reportes de ventas
      </h2>

      {/* Producto estrella */}
      <div className="tarjeta p-5">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
          <Trophy className="h-5 w-5 text-amber-500" /> Producto estrella
        </h3>
        {estrella ? (
          <p className="text-slate-600">
            <span className="font-semibold">{estrella.nombre}</span> — vendido{" "}
            {estrella.veces} {estrella.veces === 1 ? "vez" : "veces"}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Aún no hay ventas registradas.</p>
        )}
      </div>

      {/* Calendario por rango: ventas de varios días */}
      <div className="tarjeta p-5">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-800">
          <CalendarSearch className="h-5 w-5 text-acento" /> Consultar un rango de días
        </h3>
        <p className="mb-3 text-xs text-slate-500">
          Elige el día de inicio y el día de fin (o un solo día).
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <DayPicker
            className="calendario-yummy"
            mode="range"
            locale={es}
            selected={rango}
            onSelect={setRango}
          />

          <div className="min-w-0 flex-1">
            {!reporteRango && (
              <p className="text-sm text-slate-500">
                Selecciona un rango en el calendario para ver sus ventas.
              </p>
            )}

            {reporteRango && (
              <>
                <p className="mb-1 text-sm text-slate-500">
                  Ventas del{" "}
                  <span className="font-semibold">{reporteRango.desde}</span> al{" "}
                  <span className="font-semibold">{reporteRango.hasta}</span>
                </p>
                <p className="mb-3 text-2xl font-bold text-slate-800">
                  Total: ${reporteRango.total}
                </p>

                {reporteRango.ventas.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay ventas registradas en este rango.
                  </p>
                ) : (
                  // Tabla completa con scroll si hay muchas ventas.
                  <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-50">
                        <tr className="text-left text-slate-500">
                          <th className="p-2">Fecha y hora</th>
                          <th className="p-2">Restaurante</th>
                          <th className="p-2">Productos</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2">Pedido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteRango.ventas.map((venta) => (
                          <tr
                            key={venta._id}
                            className="border-t border-slate-100 align-top"
                          >
                            <td className="p-2 text-slate-600">
                              {new Date(venta.fecha).toLocaleString()}
                            </td>
                            <td className="p-2 text-slate-700">{venta.restaurante}</td>
                            <td className="p-2 text-slate-600">
                              {contarProductos(venta.productos).map((p, i) => (
                                <div key={i}>
                                  {p.nombre} × {p.cantidad}
                                </div>
                              ))}
                            </td>
                            <td className="p-2 text-right font-semibold text-slate-800">
                              ${venta.total}
                            </td>
                            <td className="p-2 text-xs text-slate-400">
                              {venta.pedidoId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ventas por día: gráfica de barras + tabla de apoyo */}
      <div className="tarjeta p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <CalendarDays className="h-5 w-5 text-acento" /> Ventas por día
        </h3>
        {diarias.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay ventas.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={diarias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill={COLOR_ACENTO} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2">Día</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {diarias.map((fila) => (
                  <tr key={fila.dia} className="border-t border-slate-100">
                    <td className="py-2 text-slate-700">{fila.dia}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      ${fila.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Ventas por semana: gráfica de barras + tabla de apoyo */}
      <div className="tarjeta p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <CalendarDays className="h-5 w-5 text-acento" /> Ventas por semana
        </h3>
        {semanales.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay ventas.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={semanales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill={COLOR_ACENTO} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2">Semana (desde el lunes)</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {semanales.map((fila) => (
                  <tr key={fila.semana} className="border-t border-slate-100">
                    <td className="py-2 text-slate-700">{fila.semana}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      ${fila.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
