const express = require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middlewares/auth.middleware");

const {
  getOrCreateDirectConversationController,
  getConversationsController,
  getMessagesController,
  markConversationAsReadController,
} = require("../controllers/chat.controller");

/*
 * All chat REST endpoints require
 * an authenticated user.
 */

router.use(authMiddleware);

/* =====================================================
   CONVERSATIONS
===================================================== */

/*
 * Get inbox.
 */
router.get(
  "/",
  getConversationsController
);

/*
 * Get or create a direct conversation
 * with another user.
 */
router.post(
  "/direct/:userId",
  getOrCreateDirectConversationController
);

/* =====================================================
   MESSAGES
===================================================== */

/*
 * Cursor-paginated message history.
 */
router.get(
  "/:conversationId/messages",
  getMessagesController
);

/* =====================================================
   READ STATE
===================================================== */

router.patch(
  "/:conversationId/read",
  markConversationAsReadController
);

module.exports = router;