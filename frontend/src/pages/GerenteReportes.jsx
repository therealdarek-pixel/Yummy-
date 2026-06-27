// ============================================================
//  REPORTES (PANEL DE GERENTE)
//  Muestra las ventas por día, por semana y el producto estrella,
//  en tablas simples. Los datos salen de la colección "ventas".
// ============================================================

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { BarChart3, CalendarDays, Trophy, CalendarSearch } from "lucide-react";
import { obtenerJSON } from "../api";

// Pasa una fecha del calendario a texto AAAA-MM-DD (para mandarla al backend).
function aTexto(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

export default function GerenteReportes() {
  const [diarias, setDiarias] = useState([]);
  const [semanales, setSemanales] = useState([]);
  const [estrella, setEstrella] = useState(null);

  // Calendario: día elegido y el reporte de ese día.
  const [diaElegido, setDiaElegido] = useState(null);
  const [reporteDia, setReporteDia] = useState(null);

  // Cuando el gerente elige un día, pedimos el reporte de ESE día.
  useEffect(() => {
    if (!diaElegido) {
      setReporteDia(null);
      return;
    }
    obtenerJSON(`/reportes/ventas-diarias?fecha=${aTexto(diaElegido)}`).then(
      (datos) => setReporteDia(datos)
    );
  }, [diaElegido]);

  useEffect(() => {
    obtenerJSON("/reportes/ventas-diarias").then((datos) => setDiarias(datos));

    obtenerJSON("/reportes/ventas-semanales").then((datos) =>
      setSemanales(datos)
    );

    obtenerJSON("/reportes/producto-estrella").then((datos) =>
      setEstrella(datos)
    );
  }, []);

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

      {/* Calendario: ventas de un día específico */}
      <div className="tarjeta p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <CalendarSearch className="h-5 w-5 text-acento" /> Consultar un día
        </h3>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <DayPicker
            className="calendario-yummy"
            mode="single"
            locale={es}
            selected={diaElegido}
            onSelect={setDiaElegido}
          />

          <div className="flex-1">
            {!diaElegido && (
              <p className="text-sm text-slate-500">
                Elige un día en el calendario para ver sus ventas.
              </p>
            )}

            {diaElegido && reporteDia && (
              <>
                <p className="mb-1 text-sm text-slate-500">
                  Ventas del <span className="font-semibold">{reporteDia.dia}</span>
                </p>
                <p className="mb-3 text-2xl font-bold text-slate-800">
                  Total: ${reporteDia.total}
                </p>

                {reporteDia.ventas.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay ventas registradas este día.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {reporteDia.ventas.map((venta) => (
                      <div
                        key={venta._id}
                        className="rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <p className="font-semibold text-slate-700">
                          {venta.restaurante} — ${venta.total}
                        </p>
                        {venta.productos.map((producto, i) => (
                          <p key={i} className="ml-1 text-slate-500">
                            • {producto.nombre} (${producto.precio})
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ventas por día */}
      <div className="tarjeta p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <CalendarDays className="h-5 w-5 text-acento" /> Ventas por día
        </h3>
        {diarias.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay ventas.</p>
        ) : (
          <table className="w-full text-sm">
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
        )}
      </div>

      {/* Ventas por semana */}
      <div className="tarjeta p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <CalendarDays className="h-5 w-5 text-acento" /> Ventas por semana
        </h3>
        {semanales.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay ventas.</p>
        ) : (
          <table className="w-full text-sm">
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
        )}
      </div>
    </div>
  );
}
