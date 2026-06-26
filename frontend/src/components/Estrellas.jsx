// ============================================================
//  ESTRELLAS DE CALIFICACIÓN (de 1 a 5)
//  Un componente reutilizable que dibuja 5 estrellas.
//   - Si recibe "onCalificar", las estrellas se pueden PICAR
//     (sirve para que el usuario califique su pedido).
//   - Si NO recibe "onCalificar", solo se MUESTRAN fijas
//     (sirve para enseñar una calificación ya hecha).
// ============================================================

export default function Estrellas({ valor, onCalificar }) {
  // ¿Se pueden seleccionar? Solo si nos pasaron una función onCalificar.
  const seleccionable = typeof onCalificar === "function";

  return (
    <div className="estrellas">
      {[1, 2, 3, 4, 5].map((numero) => (
        <button
          key={numero}
          type="button"
          // La estrella se "enciende" (dorada) si su número es <= al valor.
          className={"estrella" + (valor >= numero ? " activa" : "")}
          onClick={() => seleccionable && onCalificar(numero)}
          disabled={!seleccionable}
        >
          ★
        </button>
      ))}
    </div>
  );
}
