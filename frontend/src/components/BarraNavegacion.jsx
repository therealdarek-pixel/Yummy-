// ============================================================
//  BARRA DE NAVEGACIÓN DEL USUARIO
//sirve para mostrar el saldo, el nombre del usuario y los links a restaurantes, historial y cerrar sesión
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Wallet, Store, ReceiptText, Ticket, LogOut } from "lucide-react";
import { obtenerJSON } from "../api";
import { obtenerUsuario, cerrarSesion } from "../sesion";

export default function BarraNavegacion({ saldo }) {
  const navegar = useNavigate();
  const usuario = obtenerUsuario(); // el usuario que inició sesión
  const [saldoBuscado, setSaldoBuscado] = useState(null);

  // Si la pantalla NO nos pasó el saldo, lo buscamos nosotros.
  useEffect(() => {
    if (saldo === undefined && usuario) {
      obtenerJSON(`/usuarios/${usuario._id}`).then((datos) =>
        setSaldoBuscado(datos.saldo)
      );
    }
  }, []);

  const saldoAMostrar = saldo !== undefined ? saldo : saldoBuscado;

  // Cierra la sesión y regresa al login.
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
        <Link to="/usuario/tickets" className="btn btn-ghost">
          <Ticket className="h-4 w-4" /> Mis tickets
        </Link>
        <button onClick={salir} className="btn btn-ghost">
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </nav>
    </header>
  );
}
