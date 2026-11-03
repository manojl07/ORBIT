const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const chatService = require("../services/chat.service");

/* =====================================================
   CREATE / GET DIRECT CONVERSATION
===================================================== */

const getOrCreateDirectConversationController =
  asyncHandler(async (req, res) => {
    const conversation =
      await chatService.getOrCreateDirectConversation(
        {
          currentUserId:
            req.user.id,

          targetUserId:
            req.params.userId,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Conversation ready",
        conversation
      )
    );
  });

/* =====================================================
   GET CONVERSATIONS
===================================================== */

const getConversationsController =
  asyncHandler(async (req, res) => {
    const conversations =
      await chatService.getUserConversations({
        userId: req.user.id,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Conversations fetched successfully",
        conversations
      )
    );
  });

/* =====================================================
   GET MESSAGES
===================================================== */

const getMessagesController =
  asyncHandler(async (req, res) => {
    const result =
      await chatService.getMessages({
        conversationId:
          req.params.conversationId,

        userId:
          req.user.id,

        cursor:
          req.query.cursor || null,

        limit:
          req.query.limit || 30,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Messages fetched successfully",
        result
      )
    );
  });

/* =====================================================
   MARK READ
===================================================== */


/* =====================================================
   MARK READ
===================================================== */

const markConversationAsReadController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;
    const messageId = req.body.messageId;


    console.log("📖 MARK READ CONTROLLER:", { userId: req.user?.id, conversationId: req.params.conversationId, messageId: req.body?.messageId, });

    // Persist read state first.
    const result = await chatService.markConversationAsRead({ conversationId, userId, messageId, });

    /*
     * ========================================
     * REAL-TIME READ SYNCHRONIZATION
     * ========================================
     */

    const io = req.app.get("io");

    if (io) {
      // Fetch the authorized conversation.
      const conversation = await chatService.getConversationForUser({ conversationId, userId, });

      const normalizedUserId = String(userId);

      const otherParticipant = conversation.participants.find((participant) => {
        const participantId = participant.user?._id || participant.user;
        return String(participantId) !== normalizedUserId;
      });

      const eventPayload = {
        conversationId: String(conversationId),
        userId: normalizedUserId,
        messageId: String(messageId),
      };

      /*
       * Notify all devices belonging to the reader.
       */

      io.to(`user:${normalizedUserId}`).emit("conversation:read", eventPayload);

      /*
       * Notify the other participant's devices.
       */

      if (otherParticipant) {
        const otherUserId = otherParticipant.user?._id || otherParticipant.user;
        io.to(`user:${String(otherUserId)}`).emit("conversation:read", eventPayload);
      }
    }

    return res.status(200).json(
      new ApiResponse(200, "Conversation marked as read", result)
    );
  });


module.exports = {
  getOrCreateDirectConversationController,
  getConversationsController,
  getMessagesController,
  markConversationAsReadController,
};