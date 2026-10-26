const socketAuth = require('./socketAuth')

const USER_ROOM_PREFIX = "user:";

const getUserRoom = (userId) => {
  return `${USER_ROOM_PREFIX}${userId}`;
}

const initializeSocket = (io) => {
  //  ============================================
  //           SOCKET AUTHENTICATION
  //  ============================================
  io.use(socketAuth);

  // ============================================
  //                  CONNECTION
  // ============================================
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const userRoom = getUserRoom(userId);


    //  * Every authenticated socket joins its
    //  * user's private room.
    //  *
    //  * Multiple devices/sockets can therefore
    //  * belong to the same user room.
    socket.join(userRoom);

    console.log(`🔌 Socket connected: ${socket.id} | user: ${userId}`);

    /*
    * ==========================================
      * CONNECTION CONFIRMATION
      * ==========================================
    *
    * Temporary infrastructure event.
    * Later this can become a proper
    * session/sync event.
      */

    socket.emit("socket:ready", { socketId: socket.id, userId });

    /*
    * ==========================================
    * DISCONNECT
    * ==========================================
    */
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} | user: ${userId} | reason: ${reason}`);
    })
  })

}

module.exports = { initializeSocket, getUserRoom, };