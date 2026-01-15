import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "Conversation must have exactly 2 participants",
      },
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

/*
  ✅ UNIQUE USER PAIR (ORDERED)
  participants[0] + participants[1]
*/
conversationSchema.index(
  { "participants.0": 1, "participants.1": 1 },
  { unique: true }
);

export default mongoose.model("Conversation", conversationSchema);
