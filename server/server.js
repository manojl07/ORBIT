require('dotenv').config();

const http = require("http");
const app = require('./app')
const connectDB = require('./src/config/db')

const {Server: SocketIOServer,} = require("socket.io");

const {initializeSocket,} = require("./src/socket/socket");

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await connectDB();

    /*
     * ==========================================
     * HTTP SERVER
     * ==========================================
     *
     * Express handles REST APIs.
     * Socket.IO attaches to the same HTTP server.
     */

    const httpServer = http.createServer(app);

    /*
     * ==========================================
     * SOCKET.IO
     * ==========================================
     */

      const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },

      /*
       * Allow websocket + HTTP long polling.
       * Socket.IO will normally upgrade to WebSocket.
       */

      transports: ["websocket", "polling"],
    });

    /*
     * Initialize all socket behaviour.
     */

    initializeSocket(io);

    /*
     * ==========================================
     * START SERVER
     * ==========================================
     */

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:",error);
    process.exit(1)
  }
}

startServer();











