// ============================================================
//  PÁGINA DE REGISTRO
//  Pide nombre, correo y contraseña. Al registrarse, el usuario
//  empieza con saldo de $500 y queda listo para entrar.
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { URL_BACKEND } from "../api";
import { guardarUsuario } from "../sesion";

export default function Registro() {
  const navegar = useNavigate();

  // Lo que el usuario va escribiendo en el formulario.
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  // Manda los datos al backend para crear la cuenta.
  async function registrar(evento) {
    evento.preventDefault(); // evita que la página se recargue

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

    // Si el backend mandó error (por ejemplo, correo repetido).
    if (datos.error) {
      alert(datos.error);
      return;
    }

    // Guardamos la sesión y entramos directo como usuario.
    guardarUsuario(datos);
    alert("¡Cuenta creada! Empiezas con $500 🎉");
    navegar("/usuario");
  }

  return (
    <div className="inicio">
      <h1>🍔 DiDi Food</h1>
      <p>Crea tu cuenta</p>

      <form className="formulario" onSubmit={registrar}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
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
        <button className="boton" type="submit">Crear cuenta</button>
      </form>

      <p style={{ marginTop: "16px" }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
