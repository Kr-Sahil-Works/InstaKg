import mongoose from "mongoose";

/* ================= REACTION SUBSCHEMA ================= */
const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/* ================= MESSAGE SCHEMA ================= */
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    /* ===== READ RECEIPTS ===== */
    seen: {
      type: Boolean,
      default: false,
    },

    /* ===== EDIT FLAG ===== */
    edited: {
      type: Boolean,
      default: false,
    },

    /* ===== EMOJI REACTIONS ===== */
    reactions: {
      type: [reactionSchema],
      default: [],
    },

    /* ===== FORWARD FLAG ===== */
    forwarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
