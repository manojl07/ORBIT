import { io } from "socket.io-client"


const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,

  /*
   * Important:
   * Send HttpOnly cookies during the
   * Socket.IO handshake.
   */
  withCredentials: true,

  transports: ["websocket", "polling"],
})