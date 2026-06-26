// ============================================================
//  MAPA DEL PEDIDO (Leaflet + OpenStreetMap, gratis y sin API key)
//  Muestra:
//   - el restaurante (origen, marcador verde),
//   - la casa del usuario (destino, marcador gris),
//   - una línea entre ambos,
//   - el PEDIDO (marcador naranja) que se va acercando del
//     restaurante a la casa según el estado.
// ============================================================

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Qué tan avanzado va el pedido según su estado.
// 0 = en el restaurante, 1 = ya en la casa del usuario.
const AVANCE_POR_ESTADO = {
  pendiente: 0,
  preparando: 0.25,
  "en camino": 0.6,
  entregado: 1,
};

// Creamos marcadores redondos de color (hechos con HTML, así nunca
// fallan por imágenes que no cargan).
function marcadorColor(color, claseExtra) {
  return L.divIcon({
    className: claseExtra || "",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 5px rgba(0,0,0,.4)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

const iconoRestaurante = marcadorColor("#1f6f54"); // verde = origen
const iconoCasa = marcadorColor("#334155"); // gris oscuro = destino
const iconoPedido = marcadorColor("#ea580c", "marcador-pedido"); // naranja = se mueve

// Componente chico que ajusta el zoom para que se vean los dos puntos.
function AjustarVista({ origen, destino }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([origen, destino], { padding: [35, 35] });
  }, []);
  return null;
}

export default function MapaPedido({ origen, destino, estado }) {
  // Posición del pedido: interpolación lineal entre origen y destino.
  const avance = AVANCE_POR_ESTADO[estado] ?? 0;
  const posicionPedido = [
    origen[0] + (destino[0] - origen[0]) * avance,
    origen[1] + (destino[1] - origen[1]) * avance,
  ];

  // Centro inicial (el punto medio entre los dos lugares).
  const centro = [(origen[0] + destino[0]) / 2, (origen[1] + destino[1]) / 2];

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={centro}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "220px", width: "100%" }}
      >
        {/* Mapa base gratuito de OpenStreetMap */}
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Línea entre el restaurante y la casa */}
        <Polyline
          positions={[origen, destino]}
          pathOptions={{ color: "#1f6f54", weight: 3, dashArray: "6 8" }}
        />

        {/* Marcadores */}
        <Marker position={origen} icon={iconoRestaurante} />
        <Marker position={destino} icon={iconoCasa} />
        <Marker position={posicionPedido} icon={iconoPedido} />

        <AjustarVista origen={origen} destino={destino} />
      </MapContainer>
    </div>
  );
}
