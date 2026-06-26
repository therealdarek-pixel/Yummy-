// ============================================================
//  BARRA DE SEGUIMIENTO DEL PEDIDO
//  Recibe el "estado" actual y dibuja una barra de progreso
//  horizontal con las 4 etapas (como cuando rastreas un pedido
//  en una app real). Cada etapa tiene 3 posibles aspectos:
//   - completada  -> ya pasó (verde, con ✓)
//   - actual      -> en la que va ahora (naranja, resaltada)
//   - pendiente   -> todavía no llega (gris)
// ============================================================

import { ETAPAS } from "../etapas";

export default function SeguimientoPedido({ estado }) {
  // En qué posición (índice) va el pedido ahora.
  // Ejemplo: "preparando" es la posición 1.
  const actual = ETAPAS.indexOf(estado);

  // Cuánto se llena la línea de color (de la 1ra a la última etapa).
  // 0% al inicio (pendiente) y 100% al final (entregado).
  const avance = (actual / (ETAPAS.length - 1)) * 100;

  // Decide qué aspecto tiene cada etapa según su posición.
  function claseDeEtapa(i) {
    if (i < actual) return "completada"; // ya la pasamos
    if (i === actual) return "actual";   // en la que va ahora
    return "pendiente";                  // todavía falta
  }

  return (
    <div className="seguimiento">
      {/* Línea gris de fondo y, encima, la línea verde que avanza */}
      <div className="linea-fondo">
        <div className="linea-avance" style={{ width: `${avance}%` }} />
      </div>

      {/* Los puntos: uno por cada etapa, con su nombre debajo */}
      <div className="etapas">
        {ETAPAS.map((etapa, i) => {
          const clase = claseDeEtapa(i);
          return (
            <div key={etapa} className="etapa">
              {/* El círculo: ✓ si ya se completó, si no el número de etapa */}
              <div className={"punto " + clase}>
                {clase === "completada" ? "✓" : i + 1}
              </div>
              <span className={"etapa-nombre " + clase}>{etapa}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
