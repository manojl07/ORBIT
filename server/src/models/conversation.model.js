const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    lastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct"],
      default: "direct",
      required: true,
    },

    /*
     * For a direct conversation:
     *
     * smallerUserId:largerUserId
     *
     * Example:
     *
     * 64abc...:91def...
     *
     * This guarantees A -> B and B -> A
     * resolve to the same conversation.
     */
    directKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    participants: {
      type: [participantSchema],
      required: true,
      validate: {
        validator: function (participants) {
          return participants.length === 2;
        },
        message:
          "A direct conversation must have exactly two participants",
      },
    },

    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({
  "participants.user": 1,
  lastMessageAt: -1,
});

conversationSchema.index({
  "participants.user": 1,
  updatedAt: -1,
});

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);

// 6ae054a050cdf61c7fd053ed
// 6ae054a050cdf61c7fd053ed

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZGFlYmMzZTMwYjg0MjQyOTI2Y2UwZCIsImlhdCI6MTc5MzM0MDQ0MywiZXhwIjoxNzkzMzQxMzQzfQ.kjuiQ7EnPCZ5OtIkfSzVG678oDnki2BbP3GpgBtKahI