// ============================================================
//  BARRA DE SEGUIMIENTO DEL PEDIDO
//  Dibuja una barra de progreso con las 4 etapas. Cada etapa es
//  un círculo: las ya pasadas y la actual se ven en color de
//  acento las que faltan, en gris. Una línea se va llenando.
// ============================================================

import { Check } from "lucide-react";
import { ETAPAS } from "../etapas";

export default function SeguimientoPedido({ estado }) {
  // En qué posición (índice) va el pedido ahora.
  const actual = ETAPAS.indexOf(estado);

  // Cuánto se llena la línea de color (0% al inicio, 100% al final).
  const avance = (actual / (ETAPAS.length - 1)) * 100;

  return (
    <div className="relative my-4">
      {/* Línea gris de fondo y, encima, la línea de acento que avanza */}
      <div className="absolute left-7 right-7 top-3 h-1 rounded bg-slate-200">
        <div
          className="h-full rounded bg-acento transition-[width] duration-500"
          style={{ width: `${avance}%` }}
        />
      </div>

      {/* Los puntos: uno por cada etapa, con su nombre debajo */}
      <div className="relative flex justify-between">
        {ETAPAS.map((etapa, i) => {
          const activa = i <= actual; // ya pasó o es la actual
          const esActual = i === actual;
          return (
            <div
              key={etapa}
              className="flex w-14 flex-col items-center gap-1.5 text-center"
            >
              <div
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition " +
                  (activa ? "bg-acento " : "bg-slate-200 ") +
                  (esActual ? "scale-110 ring-4 ring-acento-suave" : "")
                }
              >
                {i < actual ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={
                  "text-[11px] capitalize " +
                  (activa ? "font-semibold text-acento" : "text-slate-400")
                }
              >
                {etapa}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
