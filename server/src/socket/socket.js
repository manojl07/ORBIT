
const chatService = require("../services/chat.service");
const socketAuth = require("./socketAuth");

const ApiError = require("../utils/ApiError");

const USER_ROOM_PREFIX = "user:";
const CONVERSATION_ROOM_PREFIX = "conversation:";
const PRESENCE_ROOM_PREFIX = "presence:";

const TYPING_TIMEOUT_MS = 5000;

// userId -> Set of socketIds
const onlineUsers = new Map();

const getPresenceRoom = (userId) =>
  `${PRESENCE_ROOM_PREFIX}${userId}`;

const addOnlineSocket = (userId, socketId) => {
  let sockets = onlineUsers.get(userId);

  const wasOffline = !sockets || sockets.size === 0;

  if (!sockets) {
    sockets = new Set();
    onlineUsers.set(userId, sockets);
  }

  sockets.add(socketId);

  return wasOffline;
};

const removeOnlineSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);

  if (!sockets) return false;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  return false;
};

const isUserOnline = (userId) => {
  return (onlineUsers.get(String(userId))?.size || 0) > 0;
};

const getUserRoom = (userId) => {
  return `${USER_ROOM_PREFIX}${userId}`;
};

const getConversationRoom = (conversationId) => {
  return `${CONVERSATION_ROOM_PREFIX}${conversationId}`;
};

const emitChatError = (socket, error) => {
  socket.emit("chat:error", {
    statusCode: error?.statusCode || 500,
    code: error?.code || null,
    message: error?.message || "Chat operation failed",
  });
};

// Track typing independently for every socket and conversation.
const typingSessions = new Map();

const getTypingKey = (socketId, conversationId) => `${socketId}:${conversationId}`;

const clearTypingSession = (io, socket, conversationId, notify = true) => {
  const key = getTypingKey(socket.id, conversationId);
  const session = typingSessions.get(key);

  if (!session) return;

  clearTimeout(session.timeout);
  typingSessions.delete(key);

  if (notify) {
    console.log("⌨️ BROADCASTING TYPING STOP TO:", session.recipientId);

    io.to(getUserRoom(session.recipientId)).emit("typing:update",
      {
        conversationId,
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: false,
      }
    );
  }
};

const revokeRelationshipAccess = async (io, { userAId, userBId }) => {
  const normalizedUserAId = String(userAId);
  const normalizedUserBId = String(userBId);

  // Remove every connected device from the other user's
  // presence room.
  await Promise.all([io.in(getUserRoom(normalizedUserAId)).socketsLeave(getPresenceRoom(normalizedUserBId)),

  io.in(getUserRoom(normalizedUserBId)).socketsLeave(getPresenceRoom(normalizedUserAId)),]);

  // Clear active typing sessions in both directions.
  for (const [key, session] of typingSessions) {
    const isRelationshipSession = (session.senderId === normalizedUserAId && session.recipientId === normalizedUserBId) || (session.senderId === normalizedUserBId && session.recipientId === normalizedUserAId);

    if (!isRelationshipSession) {
      continue;
    }

    clearTimeout(session.timeout);
    typingSessions.delete(key);

    // Notify the recipient that typing has stopped.
    io.to(getUserRoom(session.recipientId)).emit("typing:update",
      {
        conversationId: session.conversationId,
        userId: session.senderId,
        isTyping: false,
      }
    );
  }
};

const initializeSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(getUserRoom(userId));
    const becameOnline = addOnlineSocket(userId, socket.id);

    if (becameOnline) {
      io.to(getPresenceRoom(userId)).emit("presence:update", { userId, isOnline: true, });
    }
    console.log(`🔌 Socket connected: ${socket.id} | user: ${userId}`);
    socket.emit("socket:ready", { socketId: socket.id, userId, });

    /*
     * ==========================================
     * JOIN CONVERSATION
     * ==========================================
     */

    socket.on("conversation:join", async (payload, acknowledgement) => {
      try {
        const conversationId = payload?.conversationId;
        const conversation = await chatService.getConversationForUser({ conversationId, userId, });
        const room = getConversationRoom(conversation._id);
        socket.join(room);
        const response = { conversationId: conversation._id.toString(), };
        socket.emit("conversation:joined", response);
        acknowledgement?.({ success: true, data: response, });
      } catch (error) {
        console.error("conversation:join error:", error);
        emitChatError(socket, error);
        acknowledgement?.({
          success: false,
          statusCode: error.statusCode || 500,
          code: error.code || null,
          message: error.message,
        });
      }
    }
    );


    socket.on("presence:watch", async (payload, acknowledgement) => {
      try {
        const conversationIds = payload?.conversationIds;

        if (!Array.isArray(conversationIds) || conversationIds.length > 100) {
          throw new Error("Invalid conversation IDs");
        }

        const presence = [];

        for (const conversationId of new Set(conversationIds)) {
          const conversation = await chatService.getConversationForUser({ conversationId, userId, });

          const otherParticipant = conversation.participants.find((participant) => {
            const participantId = participant.user?._id || participant.user;
            return String(participantId) !== userId;
          });

          if (!otherParticipant) {
            continue;
          }

          const otherUserId = String(otherParticipant.user?._id || otherParticipant.user);

          // Subscribe this socket to the other participant's
          // presence updates.
          // Presence is available only between mutual followers.

          const canMessage = await chatService.areMutualFollowers({userAId: userId,userBId: otherUserId,});

          if (!canMessage) {
            socket.leave(getPresenceRoom(otherUserId));

            presence.push({
              conversationId: conversation._id.toString(),
              userId: otherUserId,
              isOnline: false,
            });

            continue;
          }

          // Subscribe to future presence updates.
          socket.join(getPresenceRoom(otherUserId));

          // Recheck permission after joining.
          const stillCanMessage = await chatService.areMutualFollowers({userAId: userId,userBId: otherUserId,});

          if (!stillCanMessage) {
            socket.leave(getPresenceRoom(otherUserId));

            presence.push({
              conversationId: conversation._id.toString(),
              userId: otherUserId,
              isOnline: false,
            });

            continue;
          }

          // IMPORTANT: Return the initial presence snapshot.
          presence.push({
            conversationId: conversation._id.toString(),
            userId: otherUserId,
            isOnline: isUserOnline(otherUserId),
          });

        }

        acknowledgement?.({ success: true, data: presence, });
      } catch (error) {
        console.error("presence:watch error:", error);
        acknowledgement?.({
          success: false,
          statusCode: error.statusCode || 500,
          code: error.code || null,
          message: error.message,
        });
      }
    }
    );

    /*
     * ==========================================
     * LEAVE CONVERSATION
     * ==========================================
     */

    socket.on("conversation:leave", async (payload, acknowledgement) => {
      try {
        const conversationId = payload?.conversationId;

        const conversation = await chatService.getConversationForUser({ conversationId, userId, });

        const normalizedConversationId = conversation._id.toString();
        // Clear typing before leaving.
        clearTypingSession(io, socket, normalizedConversationId);

        socket.leave(getConversationRoom(normalizedConversationId));

        acknowledgement?.({ success: true, });
      } catch (error) {
        console.error("conversation:leave error:", error);

        acknowledgement?.({
          success: false,
          statusCode: error.statusCode || 500,
          code: error.code || null,
          message: error.message,
        });
      }
    }
    );

    /*
     * ==========================================
     * TYPING START
     * ==========================================
     */


    socket.on("typing:start", async (payload, acknowledgement) => {
      try {
        const conversationId = payload?.conversationId;

        // DEBUG: Confirm the frontend event reached the backend.
        console.log("⌨️ TYPING START RECEIVED:", { socketId: socket.id, userId, conversationId, });

        const conversation = await chatService.getConversationForUser({ conversationId, userId, });

        const normalizedConversationId = conversation._id.toString();
        // Only allow typing from a joined conversation.
        const room = getConversationRoom(normalizedConversationId);

        if (!socket.rooms.has(room)) {
          throw new Error("Join the conversation before sending typing events");
        }

        // Find the other participant.
        const recipient = conversation.participants.find((participant) => {
          const participantId = participant.user?._id || participant.user;
          return String(participantId) !== userId;
        }
        );

        if (!recipient) {
          throw new Error("Conversation recipient not found");
        }

        const recipientId = String(recipient.user?._id || recipient.user);

        // Typing is permitted only between mutual followers.
        const canMessage = await chatService.areMutualFollowers({ userAId: userId, userBId: recipientId, });

        if (!canMessage) {
          throw new ApiError(403, "You can no longer send typing events to this user");
        }

        const stillCanMessage = await chatService.areMutualFollowers({ userAId: userId, userBId: recipientId, });

        if (!stillCanMessage) {
          throw new ApiError(403, "You can no longer send typing events to this user");
        }

        const key = getTypingKey(socket.id, normalizedConversationId);

        const existingSession = typingSessions.get(key);

        // Refresh inactivity timeout without repeatedly
        // broadcasting typing:start.
        if (existingSession) {
          clearTimeout(existingSession.timeout);
        }

        const timeout = setTimeout(() => {
          clearTypingSession(io, socket, normalizedConversationId);
        }, TYPING_TIMEOUT_MS);

        typingSessions.set(key, {
          senderId: userId,
          recipientId,
          conversationId: normalizedConversationId,
          timeout,
        });

        // Broadcast only when this socket starts typing.
        if (!existingSession) {
          const recipientRoom = getUserRoom(recipientId);

          // DEBUG: Inspect recipient's connected sockets.
          console.log("⌨️ RECIPIENT ROOM DEBUG:", { recipientRoom, recipientId, connectedSockets: [...(io.sockets.adapter.rooms.get(recipientRoom) || []),], });

          console.log("⌨️ BROADCASTING TYPING TO:", recipientId);

          io.to(recipientRoom).emit("typing:update", {
            conversationId: normalizedConversationId,
            userId,
            username: socket.user.username,
            isTyping: true,
          });
        }

        acknowledgement?.({ success: true, });
      } catch (error) {
        console.error("❌ typing:start error:", error);

        emitChatError(socket, error);

        acknowledgement?.({
          success: false,
          statusCode: error.statusCode || 500,
          code: error.code || null,
          message: error.message,
        });
      }
    }
    );


    /*
     * ==========================================
     * TYPING STOP
     * ==========================================
     */

    socket.on("typing:stop", async (payload, acknowledgement) => {
      try {
        const conversationId = payload?.conversationId;

        // DEBUG: Confirm the stop event reached the backend.
        console.log("⌨️ TYPING STOP RECEIVED:", { socketId: socket.id, userId, conversationId, });

        const conversation = await chatService.getConversationForUser({ conversationId, userId, });

        const normalizedConversationId = conversation._id.toString();
        clearTypingSession(io, socket, normalizedConversationId);

        acknowledgement?.({ success: true, });
      } catch (error) {
        console.error("❌ typing:stop error:", error);

        emitChatError(socket, error);

        acknowledgement?.({
          success: false,
          statusCode: error.statusCode || 500,
          code: error.code || null,
          message: error.message,
        });
      }
    }
    );

    /*
     * ==========================================
     * SEND MESSAGE
     * ==========================================
     */

    socket.on("message:send", async (payload, acknowledgement) => {
      try {
        const { conversationId, clientMessageId, text, } = payload || {};

        const result = await chatService.sendMessage({ conversationId, senderId: socket.user.id, clientMessageId, text, });

        const message = result.message;

        const room = getConversationRoom(conversationId);

        acknowledgement?.({
          success: true,
          data: {
            message,
            duplicate: result.duplicate,
          },
        });

        if (result.duplicate) return;

        // Stop typing when a message is sent.
        clearTypingSession(io, socket, String(conversationId));

        io.to(room).emit("message:new", { message, });

        const conversation = await chatService.getConversationForUser({ conversationId, userId: socket.user.id, });

        const recipient = conversation.participants.find(
          (participant) => {
            const participantId = participant.user?._id || participant.user;
            return String(participantId) !== userId;
          }
        );

        if (recipient) {
          const recipientId = recipient.user?._id || recipient.user;

          io.to(getUserRoom(recipientId)).emit(
            "conversation:updated",
            {
              conversationId: conversation._id,
              message,
            }
          );
        }
      } catch (error) {
        console.error("message:send error:", error);

        emitChatError(socket, error);

        acknowledgement?.({
          success: false,
          statusCode: error.statusCode || 500,
          code: error.code || null,
          message: error.message,
        });
      }
    }
    );

    /*
     * ==========================================
     * DISCONNECT
     * ==========================================
     */

    socket.on("disconnect", () => {
      // 1. Clear every typing session belonging to this socket.
      for (const [key] of typingSessions) {
        if (key.startsWith(`${socket.id}:`)) {
          const conversationId = key.slice(socket.id.length + 1);

          clearTypingSession(io, socket, conversationId);
        }
      }

      // 2. Remove this socket from the user's online connections.
      // This must happen independently of typing sessions.
      const becameOffline = removeOnlineSocket(userId, socket.id);

      // 3. Broadcast offline only when the final device disconnects.
      if (becameOffline) {
        io.to(getPresenceRoom(userId)).emit("presence:update", { userId, isOnline: false, });
      }

      console.log(`🔌 Socket disconnected: ${socket.id} | user: ${userId}`);
    });
  });
};

module.exports = { initializeSocket, getUserRoom, getConversationRoom, revokeRelationshipAccess, };