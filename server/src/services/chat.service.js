
const mongoose = require("mongoose");

const User = require("../models/user.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

const ApiError = require("../utils/ApiError");

const MAX_MESSAGE_LENGTH = 2000;

/* =====================================================
   COMMON HELPERS
===================================================== */

// Validate and normalize MongoDB user IDs.
const normalizeUserId = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  return new mongoose.Types.ObjectId(userId);
};

// Extract an ID from either:
// 1. An unpopulated ObjectId
// 2. A populated Mongoose document
// 3. A populated plain JavaScript object (.lean())

const getReferencedUserId = (user) => {
  if (!user) {
    return null;
  }

  const userId = user._id ?? user;

  if (!userId) {
    return null;
  }

  return userId.toString();
};

// Generate a deterministic key for direct conversations.
const getDirectKey = (userA, userB) => {
  const ids = [
    userA.toString(),
    userB.toString(),
  ].sort();

  return `${ids[0]}:${ids[1]}`;
};

// Check whether a user belongs to a conversation.
const isParticipant = (conversation, userId) => {
  if (!conversation?.participants || !userId) {
    return false;
  }

  const normalizedUserId = userId.toString();

  return conversation.participants.some(
    (participant) =>
      getReferencedUserId(participant.user) ===
      normalizedUserId
  );
};

// Retrieve a particular participant.
const getParticipant = (conversation, userId) => {
  if (!conversation?.participants || !userId) {
    return undefined;
  }

  const normalizedUserId = userId.toString();

  return conversation.participants.find(
    (participant) =>
      getReferencedUserId(participant.user) ===
      normalizedUserId
  );
};

/* =====================================================
   CREATE / GET DIRECT CONVERSATION
===================================================== */

const getOrCreateDirectConversation = async ({
  currentUserId,
  targetUserId,
}) => {
  const currentUser = normalizeUserId(currentUserId);
  const targetUser = normalizeUserId(targetUserId);

  if (
    currentUser.toString() ===
    targetUser.toString()
  ) {
    throw new ApiError(
      400,
      "You cannot message yourself"
    );
  }

  // Confirm that the target user exists.
  const targetExists = await User.exists({
    _id: targetUser,
  });

  if (!targetExists) {
    throw new ApiError(404, "User not found");
  }

  // Generate the canonical pair key.
  const directKey = getDirectKey(
    currentUser,
    targetUser
  );

  // Check whether this conversation already exists.
  let conversation = await Conversation.findOne({
    directKey,
  })
    .populate(
      "participants.user",
      "_id username profileImg isVerified"
    )
    .lean();

  if (conversation) {
    return conversation;
  }

  try {
    conversation = await Conversation.create({
      type: "direct",
      directKey,

      participants: [
        {
          user: currentUser,
        },
        {
          user: targetUser,
        },
      ],
    });
  } catch (error) {
    /*
     * Two requests might attempt to create
     * the same conversation simultaneously.
     *
     * The unique directKey index protects us.
     */
    if (error.code !== 11000) {
      throw error;
    }

    // Retrieve the conversation created by the other request.
    conversation = await Conversation.findOne({
      directKey,
    });

    if (!conversation) {
      throw error;
    }
  }

  // Return the conversation with populated participants.
  return Conversation.findById(conversation._id)
    .populate(
      "participants.user",
      "_id username profileImg isVerified"
    )
    .lean();
};

/* =====================================================
   GET USER CONVERSATIONS
===================================================== */

const getUserConversations = async ({ userId }) => {
  const normalizedUserId = normalizeUserId(userId);

  const conversations = await Conversation.find({
    "participants.user": normalizedUserId,
  })
    .sort({
      lastMessageAt: -1,
      updatedAt: -1,
    })
    .populate(
      "participants.user",
      "_id username profileImg isVerified"
    )
    .lean();

  return conversations.map((conversation) => {
    // Find the logged-in user's participant information.
    const currentParticipant =
      getParticipant(conversation, normalizedUserId);

    // Find the other participant.
    const otherParticipant =
      conversation.participants.find(
        (participant) =>
          getReferencedUserId(participant.user) !==
          normalizedUserId.toString()
      );

    return {
      ...conversation,

      // Convenience fields for frontend.
      otherUser: otherParticipant?.user || null,

      unreadCount:
        currentParticipant?.unreadCount || 0,
    };
  });
};

/* =====================================================
   GET CONVERSATION
===================================================== */

const getConversationForUser = async ({
  conversationId,
  userId,
}) => {
  if (
    !mongoose.Types.ObjectId.isValid(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid conversation ID"
    );
  }

  // Populate participants so their user information
  // is available to the frontend and other services.
  const conversation = await Conversation.findById(
    conversationId
  )
    .populate(
      "participants.user",
      "_id username profileImg isVerified"
    )
    .lean();

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found"
    );
  }

  // Verify that the authenticated user belongs
  // to this conversation.
  if (!isParticipant(conversation, userId)) {
    throw new ApiError(
      403,
      "You are not a participant in this conversation"
    );
  }

  return conversation;
};

/* =====================================================
   GET MESSAGE HISTORY
===================================================== */

const getMessages = async ({
  conversationId,
  userId,
  cursor = null,
  limit = 30,
}) => {
  // Verify conversation access first.
  const conversation = await getConversationForUser({
    conversationId,
    userId,
  });

  let safeLimit = Number(limit);

  if (
    !Number.isInteger(safeLimit) ||
    safeLimit < 1
  ) {
    safeLimit = 30;
  }

  safeLimit = Math.min(safeLimit, 50);

  const query = {
    conversation: conversation._id,
  };

  /*
   * Cursor format:
   *
   * base64(JSON({
   *   createdAt,
   *   id
   * }))
   */

  if (cursor) {
    let decodedCursor;

    try {
      decodedCursor = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8")
      );
    } catch {
      throw new ApiError(
        400,
        "Invalid message cursor"
      );
    }

    if (
      !decodedCursor?.createdAt ||
      !mongoose.Types.ObjectId.isValid(
        decodedCursor.id
      )
    ) {
      throw new ApiError(
        400,
        "Invalid message cursor"
      );
    }

    const cursorDate = new Date(
      decodedCursor.createdAt
    );

    if (Number.isNaN(cursorDate.getTime())) {
      throw new ApiError(
        400,
        "Invalid message cursor"
      );
    }

    query.$or = [
      {
        createdAt: {
          $lt: cursorDate,
        },
      },
      {
        createdAt: cursorDate,

        _id: {
          $lt: new mongoose.Types.ObjectId(
            decodedCursor.id
          ),
        },
      },
    ];
  }

  /*
   * Fetch one extra message so we know
   * whether another page exists.
   */

  const messages = await Message.find(query)
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(safeLimit + 1)
    .populate(
      "sender",
      "_id username profileImg isVerified"
    )
    .lean();

  const hasMore = messages.length > safeLimit;

  if (hasMore) {
    messages.pop();
  }

  // Generate the next cursor from the oldest
  // message in the current page.
  const nextCursor =
    hasMore && messages.length > 0
      ? Buffer.from(
          JSON.stringify({
            createdAt:
              messages[messages.length - 1].createdAt,

            id: messages[messages.length - 1]._id,
          })
        ).toString("base64url")
      : null;

  /*
   * History is returned oldest → newest
   * for straightforward frontend rendering.
   */

  messages.reverse();

  return {
    messages,

    pagination: {
      hasMore,
      nextCursor,
    },
  };
};

/* =====================================================
   SEND MESSAGE
===================================================== */

const sendMessage = async ({
  conversationId,
  senderId,
  clientMessageId,
  text,
}) => {
  if (
    !mongoose.Types.ObjectId.isValid(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid conversation ID"
    );
  }

  const normalizedSenderId = normalizeUserId(senderId);

  if (
    typeof clientMessageId !== "string" ||
    !clientMessageId.trim() ||
    clientMessageId.trim().length > 100
  ) {
    throw new ApiError(
      400,
      "Invalid client message ID"
    );
  }

  if (typeof text !== "string") {
    throw new ApiError(
      400,
      "Message text is required"
    );
  }

  const normalizedText = text.trim();

  if (!normalizedText) {
    throw new ApiError(
      400,
      "Message cannot be empty"
    );
  }

  if (
    normalizedText.length > MAX_MESSAGE_LENGTH
  ) {
    throw new ApiError(
      400,
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`
    );
  }

  // Retrieve conversation without populate.
  // Here participant.user is an ObjectId.
  const conversation = await Conversation.findById(
    conversationId
  );

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found"
    );
  }

  // Verify sender authorization.
  // This helper now works with populated and
  // unpopulated references.
  if (!isParticipant(conversation, normalizedSenderId)) {
    throw new ApiError(
      403,
      "You are not a participant in this conversation"
    );
  }

  const normalizedClientMessageId =
    clientMessageId.trim();

  /*
   * IDEMPOTENCY CHECK
   *
   * If the client retries because it didn't
   * receive the acknowledgement, don't create
   * another message.
   */

  const existingMessage = await Message.findOne({
    conversation: conversation._id,
    sender: normalizedSenderId,
    clientMessageId: normalizedClientMessageId,
  })
    .populate(
      "sender",
      "_id username profileImg isVerified"
    )
    .lean();

  if (existingMessage) {
    return {
      message: existingMessage,
      duplicate: true,
    };
  }

  const session = await mongoose.startSession();

  try {
    let createdMessage;

    await session.withTransaction(async () => {
      // 1. Create and persist the message.
      const [message] = await Message.create(
        [
          {
            conversation: conversation._id,
            sender: normalizedSenderId,
            clientMessageId:
              normalizedClientMessageId,
            type: "text",
            text: normalizedText,
          },
        ],
        { session }
      );

      createdMessage = message;

      // 2. Find the recipient.
      const recipient =
        conversation.participants.find(
          (participant) =>
            getReferencedUserId(participant.user) !==
            normalizedSenderId.toString()
        );

      if (!recipient) {
        throw new ApiError(
          500,
          "Conversation recipient not found"
        );
      }

      const recipientUserId =
        new mongoose.Types.ObjectId(
          getReferencedUserId(recipient.user)
        );

      /*
       * 3. Update recipient unread count
       *    and conversation preview atomically.
       */

      await Conversation.updateOne(
        {
          _id: conversation._id,
        },
        {
          $set: {
            lastMessage: {
              messageId: message._id,
              sender: normalizedSenderId,
              text: normalizedText,
              createdAt: message.createdAt,
            },

            lastMessageAt: message.createdAt,
          },

          $inc: {
            "participants.$[recipient].unreadCount": 1,
          },
        },
        {
          session,

          arrayFilters: [
            {
              "recipient.user": recipientUserId,
            },
          ],
        }
      );
    });

    /*
     * The transaction has committed successfully.
     *
     * Now fetch the populated message.
     */

    const populatedMessage = await Message.findById(
      createdMessage._id
    )
      .populate(
        "sender",
        "_id username profileImg isVerified"
      )
      .lean();

    return {
      message: populatedMessage,
      duplicate: false,
    };

  } catch (error) {

    /*
     * A concurrent retry may have won
     * the unique clientMessageId race.
     */

    if (error.code === 11000) {
      const duplicateMessage = await Message.findOne({
        conversation: conversation._id,
        sender: normalizedSenderId,
        clientMessageId: normalizedClientMessageId,
      })
        .populate(
          "sender",
          "_id username profileImg isVerified"
        )
        .lean();

      if (duplicateMessage) {
        return {
          message: duplicateMessage,
          duplicate: true,
        };
      }
    }

    throw error;

  } finally {
    await session.endSession();
  }
};

/* =====================================================
   MARK CONVERSATION AS READ
===================================================== */

const markConversationAsRead = async ({
  conversationId,
  userId,
  messageId,
}) => {
  const normalizedUserId = normalizeUserId(userId);

  if (
    !mongoose.Types.ObjectId.isValid(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid conversation ID"
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(messageId)
  ) {
    throw new ApiError(
      400,
      "Invalid message ID"
    );
  }

  const conversation = await Conversation.findById(
    conversationId
  );

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found"
    );
  }

  // Verify that the authenticated user belongs
  // to this conversation.
  if (!isParticipant(conversation, normalizedUserId)) {
    throw new ApiError(
      403,
      "You are not a participant in this conversation"
    );
  }

  // Verify the message belongs to this conversation.
  const message = await Message.findOne({
    _id: messageId,
    conversation: conversation._id,
  });

  if (!message) {
    throw new ApiError(
      404,
      "Message not found"
    );
  }

  // Update the authenticated participant's read state.
  await Conversation.updateOne(
    {
      _id: conversation._id,
      "participants.user": normalizedUserId,
    },
    {
      $set: {
        "participants.$.lastReadMessage": message._id,
        "participants.$.unreadCount": 0,
      },
    }
  );

  return {
    conversationId: conversation._id,
    messageId: message._id,
  };
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  getDirectKey,
  getReferencedUserId,
  isParticipant,
  getParticipant,

  getOrCreateDirectConversation,
  getUserConversations,
  getConversationForUser,

  getMessages,
  sendMessage,

  markConversationAsRead,
};
