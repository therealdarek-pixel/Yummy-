// ============================================================
//  PÁGINA DEL USUARIO
//  Muestra la barra de navegación, un botón para recargar saldo,
//  un BUSCADOR, CHIPS de categorías/favoritos y la lista de
//  restaurantes (con corazón de favorito y promedio de estrellas).
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { URL_BACKEND } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";

export default function Usuario() {
  const usuarioSesion = obtenerUsuario(); // el usuario logueado (id y nombre)

  // Datos que traemos del backend.
  const [restaurantes, setRestaurantes] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [favoritos, setFavoritos] = useState([]); // ids de restaurantes favoritos
  const [promedios, setPromedios] = useState({}); // { "Nombre del restaurante": 4.5 }

  // Estado de los filtros de la pantalla.
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  // useEffect corre UNA VEZ cuando se abre la página.
  useEffect(() => {
    // 1. La lista de restaurantes.
    fetch(`${URL_BACKEND}/restaurantes`)
      .then((r) => r.json())
      .then((datos) => setRestaurantes(datos));

    // 2. El usuario logueado: su saldo y sus favoritos.
    fetch(`${URL_BACKEND}/usuarios/${usuarioSesion._id}`)
      .then((r) => r.json())
      .then((datos) => {
        setSaldo(datos.saldo);
        setFavoritos(datos.favoritos || []);
      });

    // 3. El promedio de estrellas de cada restaurante.
    fetch(`${URL_BACKEND}/restaurantes/promedios`)
      .then((r) => r.json())
      .then((datos) => setPromedios(datos));
  }, []);

  // Recarga $100 al saldo del usuario.
  async function recargar() {
    const respuesta = await fetch(
      `${URL_BACKEND}/usuarios/${usuarioSesion._id}/recargar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: 100 }),
      }
    );
    const datos = await respuesta.json();
    setSaldo(datos.saldoNuevo); // el saldo nuevo se ve al instante (también en la barra)
  }

  // Agrega o quita un restaurante de favoritos.
  // Usamos preventDefault/stopPropagation para que al picar el corazón
  // NO se abra el restaurante (la tarjeta es un enlace).
  async function alternarFavorito(evento, restauranteId) {
    evento.preventDefault();
    evento.stopPropagation();

    const respuesta = await fetch(
      `${URL_BACKEND}/usuarios/${usuarioSesion._id}/favoritos/${restauranteId}`,
      { method: "POST" }
    );
    const datos = await respuesta.json();
    setFavoritos(datos.favoritos); // la lista nueva de favoritos
  }

  // Lista de categorías para los chips (sin repetir), con "Todas" al inicio.
  const categorias = [
    "Todas",
    ...new Set(restaurantes.map((r) => r.categoria).filter(Boolean)),
  ];

  // Aplicamos los filtros sobre la lista YA cargada (en el frontend, simple).
  let listaFiltrada = restaurantes;

  // a) Solo favoritos (si el chip está activo).
  if (soloFavoritos) {
    listaFiltrada = listaFiltrada.filter((r) => favoritos.includes(r._id));
  }
  // b) Por categoría (si no es "Todas").
  if (categoria !== "Todas") {
    listaFiltrada = listaFiltrada.filter((r) => r.categoria === categoria);
  }
  // c) Por nombre (lo que escribe en el buscador, en vivo).
  if (busqueda.trim() !== "") {
    listaFiltrada = listaFiltrada.filter((r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  return (
    <div className="pagina">
      {/* Barra de navegación con nombre, saldo y botones */}
      <BarraNavegacion saldo={saldo} />

      {/* Botón para recargar saldo */}
      <div className="acciones">
        <button onClick={recargar}>➕ Recargar $100</button>
      </div>

      <h3 className="seccion-titulo">Restaurantes</h3>

      {/* Buscador en vivo (filtra mientras escribes) */}
      <input
        className="buscador"
        type="text"
        placeholder="🔍 Buscar restaurante..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Chips: favoritos + categorías */}
      <div className="chips">
        <button
          className={"chip" + (soloFavoritos ? " activo" : "")}
          onClick={() => setSoloFavoritos(!soloFavoritos)}
        >
          ❤️ Favoritos
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            className={"chip" + (categoria === c ? " activo" : "")}
            onClick={() => setCategoria(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="lista">
        {/* Si los filtros no dejan ningún restaurante, avisamos. */}
        {listaFiltrada.length === 0 && (
          <p>No encontramos restaurantes con esos filtros 🔎</p>
        )}

        {listaFiltrada.map((r) => (
          <div key={r._id} className="tarjeta">
            {/* Parte clickeable: abre el menú del restaurante */}
            <Link to={`/usuario/restaurante/${r._id}`} className="tarjeta-link">
              <span className="emoji">{r.imagen}</span>
              <div className="tarjeta-texto">
                <span className="tarjeta-nombre">{r.nombre}</span>
                <div className="tarjeta-meta">
                  {r.categoria && (
                    <span className="categoria-tag">{r.categoria}</span>
                  )}
                  {/* El promedio solo aparece si ese restaurante ya tiene calificaciones */}
                  {promedios[r.nombre] && (
                    <span className="promedio">
                      ⭐ {promedios[r.nombre].toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Corazón de favorito (lleno o vacío según el estado) */}
            <button
              className="corazon"
              onClick={(e) => alternarFavorito(e, r._id)}
              title="Agregar o quitar de favoritos"
            >
              {favoritos.includes(r._id) ? "❤️" : "🤍"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
