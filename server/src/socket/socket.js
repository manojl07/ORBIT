const chatService =
  require("../services/chat.service");

const socketAuth =
  require("./socketAuth");

const USER_ROOM_PREFIX =
  "user:";

const CONVERSATION_ROOM_PREFIX =
  "conversation:";

const getUserRoom = (userId) => {
  return `${USER_ROOM_PREFIX}${userId}`;
};

const getConversationRoom =
  (conversationId) => {
    return `${CONVERSATION_ROOM_PREFIX}${conversationId}`;
  };

const emitChatError = (
  socket,
  error
) => {
  socket.emit(
    "chat:error",
    {
      message:
        error?.message ||
        "Chat operation failed",
    }
  );
};

const initializeSocket = (io) => {
  /*
   * ==========================================
   * SOCKET AUTH
   * ==========================================
   */

  io.use(socketAuth);

  /*
   * ==========================================
   * CONNECTION
   * ==========================================
   */

  io.on("connection", (socket) => {
    const userId =
      socket.user.id;

    /*
     * Every authenticated device/socket
     * joins its user room.
     */

    socket.join(
      getUserRoom(userId)
    );

    console.log(
      `🔌 Socket connected: ${socket.id} | user: ${userId}`
    );

    socket.emit(
      "socket:ready",
      {
        socketId:
          socket.id,

        userId,
      }
    );

    /* =================================================
       JOIN CONVERSATION
    ================================================= */

    socket.on(
      "conversation:join",
      async (
        payload,
        acknowledgement
      ) => {
        try {
          const conversationId =
            payload?.conversationId;

          const conversation =
            await chatService.getConversationForUser(
              {
                conversationId,
                userId,
              }
            );

          const room =
            getConversationRoom(
              conversation._id
            );

          socket.join(room);

          const response = {
            conversationId:
              conversation._id.toString(),
          };

          socket.emit(
            "conversation:joined",
            response
          );

          acknowledgement?.({
            success: true,
            data: response,
          });
        } catch (error) {
          console.error(
            "conversation:join error:",
            error
          );

          emitChatError(
            socket,
            error
          );

          acknowledgement?.({
            success: false,
            message:
              error.message,
          });
        }
      }
    );

    /* =================================================
       LEAVE CONVERSATION
    ================================================= */

    socket.on(
      "conversation:leave",
      async (
        payload,
        acknowledgement
      ) => {
        try {
          const conversationId =
            payload?.conversationId;

          /*
           * We still verify membership
           * before acting on the room.
           */
          const conversation =
            await chatService.getConversationForUser(
              {
                conversationId,
                userId,
              }
            );

          const room =
            getConversationRoom(
              conversation._id
            );

          socket.leave(room);

          acknowledgement?.({
            success: true,
          });
        } catch (error) {
          console.error(
            "conversation:leave error:",
            error
          );

          acknowledgement?.({
            success: false,
            message:
              error.message,
          });
        }
      }
    );

    /* =================================================
       SEND MESSAGE
    ================================================= */

    socket.on(
      "message:send",
      async (
        payload,
        acknowledgement
      ) => {
        try {
          const {
            conversationId,
            clientMessageId,
            text,
          } = payload || {};

          /*
           * IMPORTANT:
           *
           * senderId is NEVER read from payload.
           *
           * The authenticated socket identity
           * is the sender.
           */

          const result =
            await chatService.sendMessage({
              conversationId,

              senderId:
                socket.user.id,

              clientMessageId,

              text,
            });

          const message =
            result.message;

          const room =
            getConversationRoom(
              conversationId
            );

          /*
           * Acknowledge the sender.
           *
           * The client uses this to replace
           * its optimistic temporary message.
           */
          acknowledgement?.({
            success: true,

            data: {
              message,

              duplicate:
                result.duplicate,
            },
          });

          /*
           * If this was a retry of a message
           * already persisted, don't broadcast
           * it again.
           */
          if (result.duplicate) {
            return;
          }

          /*
           * Broadcast only AFTER the database
           * transaction has committed.
           *
           * Sender also receives message:new.
           * This keeps all connected devices
           * synchronized.
           */
          io.to(room).emit(
            "message:new",
            {
              message,
            }
          );

          /*
           * Notify the recipient's user room.
           *
           * This is useful for inbox/unread
           * synchronization even when the
           * recipient isn't inside the conversation.
           */

          const conversation =
            await chatService.getConversationForUser(
              {
                conversationId,
                userId:
                  socket.user.id,
              }
            );

          const recipient =
            conversation.participants.find(
              (participant) =>
                participant.user._id
                  .toString() !==
                socket.user.id
            );

          if (recipient) {
            io.to(
              getUserRoom(
                recipient.user._id
              )
            ).emit(
              "conversation:updated",
              {
                conversationId:
                  conversation._id,

                message,
              }
            );
          }
        } catch (error) {
          console.error(
            "message:send error:",
            error
          );

          emitChatError(
            socket,
            error
          );

          acknowledgement?.({
            success: false,

            message:
              error.message,
          });
        }
      }
    );

    /* =================================================
       DISCONNECT
    ================================================= */

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          `🔌 Socket disconnected: ${socket.id} | user: ${userId} | reason: ${reason}`
        );
      }
    );
  });
};

module.exports = {
  initializeSocket,
  getUserRoom,
  getConversationRoom,
};