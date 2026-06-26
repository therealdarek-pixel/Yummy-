// Esta es la conexión en TIEMPO REAL con el servidor.
// Sirve para que el admin vea pedidos al instante y el usuario vea los cambios.
import { io } from "socket.io-client";
import { URL_BACKEND } from "./api";

export const socket = io(URL_BACKEND);