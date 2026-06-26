// ============================================================
//  PÁGINA DE UN RESTAURANTE
//  Muestra el menú, deja agregar al carrito y confirmar el pedido.
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";

export default function Restaurante() {
  const { id } = useParams();        // el id del restaurante viene en la URL
  const navegar = useNavigate();     // para regresar después de pedir
  const usuario = obtenerUsuario();  // el usuario logueado (de la sesión)

  const [restaurante, setRestaurante] = useState(null);
  const [carrito, setCarrito] = useState([]); // productos que va agregando

  // Al abrir, traemos el restaurante (con su menú).
  useEffect(() => {
    fetch(`${URL_BACKEND}/restaurantes/${id}`)
      .then((r) => r.json())
      .then((datos) => setRestaurante(datos));
  }, [id]);

  // Agrega un producto al carrito.
  function agregar(producto) {
    setCarrito([...carrito, producto]);
  }

  // Sumamos el total de todo lo que hay en el carrito.
  const total = carrito.reduce((suma, p) => suma + p.precio, 0);

  // Manda el pedido al backend.
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

    // Si el backend mandó un error (por ejemplo, no le alcanza).
    if (datos.error) {
      alert(datos.error);
    } else {
      // Confirmación clara y lo llevamos a SU historial (no a una pantalla vacía).
      alert("¡Pedido confirmado! 🎉 Te llevamos a tus pedidos.");
      navegar("/usuario/historial");
    }
  }

  // Mientras carga, mostramos un texto.
  if (!restaurante) return <p className="pagina">Cargando...</p>;

  return (
    <div className="pagina">
      {/* Barra de navegación (igual en todas las pantallas del usuario) */}
      <BarraNavegacion />

      {/* Sub-encabezado: botón regresar + nombre del restaurante */}
      <div className="sub-barra">
        <button onClick={() => navegar(-1)}>← Regresar</button>
        <h2>{restaurante.imagen} {restaurante.nombre}</h2>
      </div>

      {/* MENÚ */}
      <div className="lista">
        {restaurante.menu.map((producto, i) => (
          <div key={i} className="tarjeta-menu">
            <span>{producto.nombre}</span>
            <span>${producto.precio}</span>
            <button onClick={() => agregar(producto)}>Agregar</button>
          </div>
        ))}
      </div>

      {/* CARRITO */}
      <div className="carrito">
        <h3>🛒 Tu pedido</h3>
        {carrito.length === 0 && <p>Aún no agregas nada</p>}
        {carrito.map((p, i) => (
          <p key={i}>{p.nombre} — ${p.precio}</p>
        ))}
        <p className="total">Total: ${total}</p>
        {carrito.length > 0 && (
          <button className="boton" onClick={confirmar}>
            Confirmar pedido
          </button>
        )}
      </div>
    </div>
  );
}
