// ============================================================
//  PÁGINA DE LOGIN
//  Pide correo y contraseña. Si el usuario es admin lo manda
//  a /admin; si es usuario normal, a /usuario.
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, LogIn } from "lucide-react";
import { URL_BACKEND } from "../api";
import { guardarUsuario } from "../sesion";

export default function Login() {
  const navegar = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  // Manda el correo y la contraseña al backend.
  async function entrar(evento) {
    evento.preventDefault();

    const respuesta = await fetch(`${URL_BACKEND}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correo, contraseña: contraseña }),
    });
    const datos = await respuesta.json();

    if (datos.error) {
      alert(datos.error);
      return;
    }

    guardarUsuario(datos);

    // Según si es admin o no, lo mandamos a un lado o a otro.
    if (datos.esAdmin) {
      navegar("/admin");
    } else {
      navegar("/usuario");
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        {/* Encabezado con el logo */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-acento text-white">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Yummy</h1>
          <p className="text-sm text-slate-500">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={entrar} className="tarjeta flex flex-col gap-4 p-6">
          <input
            className="input"
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primario w-full py-3">
            <LogIn className="h-4 w-4" /> Entrar
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-semibold text-acento">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
