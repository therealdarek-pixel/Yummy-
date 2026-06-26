// la libreria de socket.io-client nos permite conectarnos al backend con WebSockets
import { io } from "socket.io-client";
import { URL_BACKEND } from "./api";

export const socket = io(URL_BACKEND);