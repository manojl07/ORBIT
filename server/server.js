
require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./src/config/db");

const { Server: SocketIOServer } = require("socket.io");

const { initializeSocket } = require("./src/socket/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    /*
     * ==========================================
     * HTTP SERVER
     * ==========================================
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

      transports: ["websocket", "polling"],
    });

    /*
     * Make Socket.IO accessible inside
     * Express controllers through req.app.
     */

    app.set("io", io);

    /*
     * Initialize socket behavior.
     */

    initializeSocket(io);

    /*
     * ==========================================
     * START SERVER
     * ==========================================
     */

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("🔌 Socket.IO ready");
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
