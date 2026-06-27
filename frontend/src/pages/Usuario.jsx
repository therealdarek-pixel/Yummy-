// ============================================================
//  PÁGINA DEL USUARIO
//  Barra de navegación, botón para recargar saldo, BUSCADOR,
//  CHIPS de categorías/favoritos y la lista de restaurantes
//  (con corazón de favorito y promedio de estrellas).
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Heart, Star } from "lucide-react";
import { obtenerJSON, enviarJSON } from "../api";
import { obtenerUsuario } from "../sesion";
import BarraNavegacion from "../components/BarraNavegacion";

export default function Usuario() {
  const usuarioSesion = obtenerUsuario(); // el usuario logueado (id y nombre)

  // Datos que traemos del backend.
  const [restaurantes, setRestaurantes] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [favoritos, setFavoritos] = useState([]); // ids de restaurantes favoritos
  const [promedios, setPromedios] = useState({}); // { "Nombre del restaurante": 4.5 }

  // Estado de los filtros.
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  useEffect(() => {
    // 1. La lista de restaurantes.
    obtenerJSON("/restaurantes").then((datos) => setRestaurantes(datos));

    // 2. El usuario: su saldo y sus favoritos.
    obtenerJSON(`/usuarios/${usuarioSesion._id}`).then((datos) => {
      setSaldo(datos.saldo);
      setFavoritos(datos.favoritos || []);
    });

    // 3. El promedio de estrellas de cada restaurante.
    obtenerJSON("/restaurantes/promedios").then((datos) => setPromedios(datos));
  }, []);

  // Recarga $100 al saldo del usuario.
  async function recargar() {
    const datos = await enviarJSON(
      `/usuarios/${usuarioSesion._id}/recargar`,
      "POST",
      { cantidad: 100 }
    );
    setSaldo(datos.saldoNuevo);
  }

  // Agrega o quita un restaurante de favoritos.
  // preventDefault/stopPropagation evita que al picar el corazón se
  // abra el restaurante (la tarjeta es un enlace).
  async function alternarFavorito(evento, restauranteId) {
    evento.preventDefault();
    evento.stopPropagation();

    const datos = await enviarJSON(
      `/usuarios/${usuarioSesion._id}/favoritos/${restauranteId}`,
      "POST"
    );
    setFavoritos(datos.favoritos);
  }

  // Lista de categorías para los chips (sin repetir), con "Todas" al inicio.
  const categorias = [
    "Todas",
    ...new Set(restaurantes.map((r) => r.categoria).filter(Boolean)),
  ];

  // Aplicamos los filtros sobre la lista ya cargada (en el frontend).
  let listaFiltrada = restaurantes;
  if (soloFavoritos) {
    listaFiltrada = listaFiltrada.filter((r) => favoritos.includes(r._id));
  }
  if (categoria !== "Todas") {
    listaFiltrada = listaFiltrada.filter((r) => r.categoria === categoria);
  }
  if (busqueda.trim() !== "") {
    listaFiltrada = listaFiltrada.filter((r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <BarraNavegacion saldo={saldo} />

      {/* Botón para recargar saldo */}
      <div className="mb-4">
        <button onClick={recargar} className="btn btn-primario">
          <Plus className="h-4 w-4" /> Recargar $100
        </button>
      </div>

      <h2 className="mb-3 text-lg font-bold text-slate-800">Restaurantes</h2>

      {/* Buscador en vivo */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          type="text"
          placeholder="Buscar restaurante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Chips: favoritos + categorías */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setSoloFavoritos(!soloFavoritos)}
          className={"chip" + (soloFavoritos ? " chip-activo" : "")}
        >
          <Heart className={"h-3.5 w-3.5" + (soloFavoritos ? " fill-current" : "")} />
          Favoritos
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={"chip" + (categoria === c ? " chip-activo" : "")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {listaFiltrada.length === 0 && (
          <p className="text-sm text-slate-500">
            No encontramos restaurantes con esos filtros.
          </p>
        )}

        {listaFiltrada.map((r) => (
          <div
            key={r._id}
            className="tarjeta flex items-center overflow-hidden transition hover:shadow-md"
          >
            {/* Parte clickeable: abre el menú del restaurante */}
            <Link
              to={`/usuario/restaurante/${r._id}`}
              className="flex min-w-0 flex-1 items-center gap-4 p-4"
            >
              {/* La "imagen" del restaurante es un emoji guardado en la base (es dato, no un ícono de la interfaz) */}
              <span className="text-3xl">{r.imagen}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{r.nombre}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {r.categoria && (
                    <span className="rounded-full bg-acento-suave px-2.5 py-0.5 text-xs font-semibold text-acento-oscuro">
                      {r.categoria}
                    </span>
                  )}
                  {promedios[r.nombre] && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {promedios[r.nombre].toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Corazón de favorito */}
            <button
              onClick={(e) => alternarFavorito(e, r._id)}
              className="p-4 text-slate-400 transition hover:scale-110"
              title="Agregar o quitar de favoritos"
            >
              <Heart
                className={
                  "h-5 w-5" +
                  (favoritos.includes(r._id) ? " fill-rose-500 text-rose-500" : "")
                }
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
