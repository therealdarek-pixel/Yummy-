// ============================================================
//  SOCKET.IO (TIEMPO REAL)
//  Conexión con el backend para recibir avisos al instante
//  (pedidos nuevos, cambios de estado, stock bajo).
// ============================================================

import { io } from "socket.io-client";
import { URL_BACKEND } from "./api";

export const socket = io(URL_BACKEND);
