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

const markConversationAsReadController =
  asyncHandler(async (req, res) => {
    const result =
      await chatService.markConversationAsRead({
        conversationId:
          req.params.conversationId,

        userId:
          req.user.id,

        messageId:
          req.body.messageId,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Conversation marked as read",
        result
      )
    );
  });

module.exports = {
  getOrCreateDirectConversationController,
  getConversationsController,
  getMessagesController,
  markConversationAsReadController,
};