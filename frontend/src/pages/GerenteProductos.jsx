// ============================================================
//  PRODUCTOS (PANEL DE GERENTE)
//  Lista el catálogo, deja crear, editar y borrar productos, y
//  muestra el stock actual de cada uno (con aviso si está bajo).
// ============================================================

import { useState, useEffect } from "react";
import { Package, Plus, Save, Trash2, AlertTriangle } from "lucide-react";
import { obtenerJSON, enviarJSON } from "../api";

// A partir de esta cantidad o menos, el stock se considera bajo.
const STOCK_BAJO = 5;

export default function GerenteProductos() {
  const [productos, setProductos] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [mensaje, setMensaje] = useState(null); // aviso de éxito/error al guardar

  // Formulario para crear un producto nuevo (incluye a qué restaurante pertenece).
  const [nuevo, setNuevo] = useState({
    nombre: "",
    precio: "",
    stock: "",
    categoria: "",
    restauranteId: "",
  });

  // Trae el catálogo desde el backend.
  function cargarProductos() {
    obtenerJSON("/productos").then((datos) => setProductos(datos));
  }

  useEffect(() => {
    cargarProductos();
    obtenerJSON("/restaurantes").then((datos) => setRestaurantes(datos));
  }, []);

  // Busca el nombre de un restaurante por su id (para mostrarlo en cada producto).
  function nombreRestaurante(restauranteId) {
    const encontrado = restaurantes.find((r) => r._id === restauranteId);
    return encontrado ? encontrado.nombre : "Sin restaurante";
  }

  // Crea un producto nuevo con los datos del formulario.
  async function crear(evento) {
    evento.preventDefault();
    await enviarJSON("/productos", "POST", {
      nombre: nuevo.nombre,
      precio: Number(nuevo.precio),
      stock: Number(nuevo.stock),
      categoria: nuevo.categoria,
      restauranteId: nuevo.restauranteId,
    });
    setNuevo({ nombre: "", precio: "", stock: "", categoria: "", restauranteId: "" });
    cargarProductos();
  }

  // Cambia un campo de un producto ya cargado (edición en la tabla).
  function editarCampo(id, campo, valor) {
    setProductos((actuales) =>
      actuales.map((p) => (p._id === id ? { ...p, [campo]: valor } : p))
    );
  }

  // Guarda los cambios de un producto editado.
  // Si algo falla, lo mostramos en pantalla en vez de fallar en silencio.
  async function guardar(producto) {
    try {
      const guardado = await enviarJSON(`/productos/${producto._id}`, "PUT", {
        nombre: producto.nombre,
        precio: Number(producto.precio),
        stock: Number(producto.stock),
        categoria: producto.categoria,
      });

      // El backend devuelve el producto actualizado: si no llega, algo salió mal.
      if (!guardado || !guardado._id) {
        throw new Error("El servidor no confirmó el cambio.");
      }

      setMensaje({ tipo: "ok", texto: `"${guardado.nombre}" guardado (stock: ${guardado.stock}).` });
      cargarProductos();
    } catch (error) {
      console.log("Error al guardar el producto:", error);
      setMensaje({ tipo: "error", texto: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo." });
    }
  }

  // Elimina un producto del catálogo.
  async function eliminar(id) {
    await enviarJSON(`/productos/${id}`, "DELETE");
    cargarProductos();
  }

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
        <Package className="h-5 w-5 text-acento" /> Catálogo de productos
      </h2>

      {/* Aviso de éxito o error al guardar (no falla en silencio) */}
      {mensaje && (
        <div
          className={
            "mb-4 rounded-2xl px-4 py-3 text-sm font-semibold " +
            (mensaje.tipo === "ok"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border border-rose-300 bg-rose-50 text-rose-700")
          }
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario para crear un producto nuevo */}
      <form onSubmit={crear} className="tarjeta mb-5 grid grid-cols-2 gap-3 p-4 sm:grid-cols-6">
        <input
          className="input"
          type="text"
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          required
        />
        <input
          className="input"
          type="number"
          placeholder="Precio"
          value={nuevo.precio}
          onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
          required
        />
        <input
          className="input"
          type="number"
          placeholder="Stock"
          value={nuevo.stock}
          onChange={(e) => setNuevo({ ...nuevo, stock: e.target.value })}
          required
        />
        <input
          className="input"
          type="text"
          placeholder="Categoría"
          value={nuevo.categoria}
          onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
        />
        <select
          className="input"
          value={nuevo.restauranteId}
          onChange={(e) => setNuevo({ ...nuevo, restauranteId: e.target.value })}
          required
        >
          <option value="">Restaurante...</option>
          {restaurantes.map((restaurante) => (
            <option key={restaurante._id} value={restaurante._id}>
              {restaurante.nombre}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primario">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </form>

      {/* Lista de productos del catálogo */}
      <div className="flex flex-col gap-3">
        {productos.length === 0 && (
          <p className="text-sm text-slate-500">Aún no hay productos en el catálogo.</p>
        )}

        {productos.map((producto) => (
          <div key={producto._id} className="tarjeta p-4">
            <p className="mb-2 text-xs font-semibold text-slate-400">
              {nombreRestaurante(producto.restauranteId)}
            </p>
            <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-6">
            <input
              className="input"
              type="text"
              value={producto.nombre}
              onChange={(e) => editarCampo(producto._id, "nombre", e.target.value)}
            />
            <input
              className="input"
              type="number"
              value={producto.precio}
              onChange={(e) => editarCampo(producto._id, "precio", e.target.value)}
            />
            <input
              className="input"
              type="number"
              value={producto.stock}
              onChange={(e) => editarCampo(producto._id, "stock", e.target.value)}
            />
            <input
              className="input"
              type="text"
              value={producto.categoria || ""}
              onChange={(e) => editarCampo(producto._id, "categoria", e.target.value)}
            />

            {/* Aviso visual si el stock está bajo */}
            <div className="text-sm font-semibold">
              {producto.stock <= STOCK_BAJO ? (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-4 w-4" /> Stock bajo
                </span>
              ) : (
                <span className="text-emerald-600">En stock</span>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => guardar(producto)} className="btn btn-ghost">
                <Save className="h-4 w-4" /> Guardar
              </button>
              <button onClick={() => eliminar(producto._id)} className="btn btn-ghost text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
