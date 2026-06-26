// ============================================================
//  PÁGINA DE LOGIN
//  Pide correo y contraseña. Si el usuario es admin lo manda
//  a /admin; si es usuario normal, a /usuario.
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { URL_BACKEND } from "../api";
import { guardarUsuario } from "../sesion";

export default function Login() {
  const navegar = useNavigate();

  // Lo que el usuario va escribiendo en el formulario.
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  // Manda el correo y la contraseña al backend.
  async function entrar(evento) {
    evento.preventDefault(); // evita que la página se recargue

    const respuesta = await fetch(`${URL_BACKEND}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correo, contraseña: contraseña }),
    });
    const datos = await respuesta.json();

    // Si el backend mandó error, lo mostramos.
    if (datos.error) {
      alert(datos.error);
      return;
    }

    // Guardamos al usuario en la sesión.
    guardarUsuario(datos);

    // Según si es admin o no, lo mandamos a un lado o a otro.
    if (datos.esAdmin) {
      navegar("/admin");
    } else {
      navegar("/usuario");
    }
  }

  return (
    <div className="inicio">
      <h1>🍔 DiDi Food</h1>
      <p>Inicia sesión para continuar</p>

      <form className="formulario" onSubmit={entrar}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
        />
        <button className="boton" type="submit">Entrar</button>
      </form>

      <p style={{ marginTop: "16px" }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </div>
  );
}
