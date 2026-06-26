// ============================================================
//  PÁGINA DE REGISTRO
//  Pide nombre, correo y contraseña. Al registrarse, el usuario
//  empieza con saldo de $500 y queda listo para entrar.
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, UserPlus } from "lucide-react";
import { URL_BACKEND } from "../api";
import { guardarUsuario } from "../sesion";

export default function Registro() {
  const navegar = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  // Manda los datos al backend para crear la cuenta.
  async function registrar(evento) {
    evento.preventDefault();

    const respuesta = await fetch(`${URL_BACKEND}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre,
        correo: correo,
        contraseña: contraseña,
      }),
    });
    const datos = await respuesta.json();

    if (datos.error) {
      alert(datos.error);
      return;
    }

    guardarUsuario(datos);
    alert("¡Cuenta creada! Empiezas con $500.");
    navegar("/usuario");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-acento text-white">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Yummy</h1>
          <p className="text-sm text-slate-500">Crea tu cuenta</p>
        </div>

        <form onSubmit={registrar} className="tarjeta flex flex-col gap-4 p-6">
          <input
            className="input"
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
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
            <UserPlus className="h-4 w-4" /> Crear cuenta
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-acento">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
