// Este es el punto de arranque del frontend.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

// Montamos la app dentro del <div id="root"> del index.html.
// BrowserRouter nos deja tener rutas como /usuario y /admin.
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
