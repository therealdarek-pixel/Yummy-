// ============================================================
//  BARRA DE NAVEGACIÓN (lado del usuario)
//  Barra superior elegante e igual en todas las pantallas del
//  usuario: logo "Yummy", nombre, saldo y botones de navegar.
//
//  La prop "saldo" es OPCIONAL: si la pantalla nos la pasa, la
//  mostramos; si no, la barra la busca sola en el backend.
// ============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Wallet, Store, ReceiptText, LogOut } from "lucide-react";
import { URL_BACKEND } from "../api";
import { obtenerUsuario, cerrarSesion } from "../sesion";

export default function BarraNavegacion({ saldo }) {
  const navegar = useNavigate();
  const usuario = obtenerUsuario(); // el usuario que inició sesión
  const [saldoBuscado, setSaldoBuscado] = useState(null);

  // Si la pantalla NO nos pasó el saldo, lo buscamos nosotros.
  useEffect(() => {
    if (saldo === undefined && usuario) {
      fetch(`${URL_BACKEND}/usuarios/${usuario._id}`)
        .then((r) => r.json())
        .then((datos) => setSaldoBuscado(datos.saldo));
    }
  }, []);

  const saldoAMostrar = saldo !== undefined ? saldo : saldoBuscado;

  function salir() {
    cerrarSesion();
    navegar("/login");
  }

  return (
    <header className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
      {/* Logo / marca */}
      <div className="flex items-center gap-2 font-display text-xl font-bold text-acento">
        <UtensilsCrossed className="h-5 w-5" />
        Yummy
      </div>

      {/* Saludo + saldo */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-slate-700">Hola, {usuario.nombre}</span>
        {saldoAMostrar !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-acento-suave px-3 py-1 text-sm font-semibold text-acento-oscuro">
            <Wallet className="h-4 w-4" />${saldoAMostrar}
          </span>
        )}
      </div>

      {/* Navegación + cerrar sesión */}
      <nav className="ml-auto flex flex-wrap items-center gap-2">
        <Link to="/usuario" className="btn btn-ghost">
          <Store className="h-4 w-4" /> Restaurantes
        </Link>
        <Link to="/usuario/historial" className="btn btn-ghost">
          <ReceiptText className="h-4 w-4" /> Mis pedidos
        </Link>
        <button onClick={salir} className="btn btn-ghost">
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </nav>
    </header>
  );
}
