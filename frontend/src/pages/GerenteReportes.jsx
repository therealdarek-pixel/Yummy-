// ============================================================
//  REPORTES (PANEL DE GERENTE)
//  Muestra las ventas por día, por semana y el producto estrella,
//  en tablas simples. Los datos salen de la colección "ventas".
// ============================================================

import { useState, useEffect } from "react";
import { BarChart3, CalendarDays, Trophy } from "lucide-react";
import { URL_BACKEND } from "../api";

export default function GerenteReportes() {
  const [diarias, setDiarias] = useState([]);
  const [semanales, setSemanales] = useState([]);
  const [estrella, setEstrella] = useState(null);

  useEffect(() => {
    fetch(`${URL_BACKEND}/reportes/ventas-diarias`)
      .then((r) => r.json())
      .then((datos) => setDiarias(datos));

    fetch(`${URL_BACKEND}/reportes/ventas-semanales`)
      .then((r) => r.json())
      .then((datos) => setSemanales(datos));

    fetch(`${URL_BACKEND}/reportes/producto-estrella`)
      .then((r) => r.json())
      .then((datos) => setEstrella(datos));
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
