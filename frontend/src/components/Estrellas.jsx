// ============================================================
//  ESTRELLAS DE CALIFICACIÓN (de 1 a 5)
//  Componente reutilizable con íconos de Lucide.
//   - Si recibe "onCalificar", las estrellas se pueden PICAR.
//   - Si NO recibe "onCalificar", solo se MUESTRAN fijas.
// ============================================================

import { Star } from "lucide-react";

export default function Estrellas({ valor, onCalificar }) {
  const seleccionable = typeof onCalificar === "function";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((numero) => {
        // La estrella se "enciende" (dorada) si su número es <= al valor.
        const activa = valor >= numero;
        return (
          <button
            key={numero}
            type="button"
            onClick={() => seleccionable && onCalificar(numero)}
            disabled={!seleccionable}
            className={
              "transition " +
              (seleccionable ? "cursor-pointer hover:scale-110" : "cursor-default")
            }
          >
            <Star
              className={
                "h-6 w-6 " +
                (activa ? "fill-amber-400 text-amber-400" : "text-slate-300")
              }
            />
          </button>
        );
      })}
    </div>
  );
}
