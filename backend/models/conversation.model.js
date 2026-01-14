import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
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
  ✅ Unique PAIR, not individual element
  Order matters → we always SORT before saving
*/
conversationSchema.index(
  { participants: 1 },
  { unique: true }
);

export default mongoose.model("Conversation", conversationSchema);
