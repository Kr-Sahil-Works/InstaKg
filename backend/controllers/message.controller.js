import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // 1️⃣ Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // 2️⃣ Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      message,
    });

    // 3️⃣ Update conversation
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // 4️⃣ Emit ONLY to receiver
    const receiverSocketId = getReceiverSocketId(receiverId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "newMessage",
        newMessage.toObject() // ✅ plain object
      );
    }

    // 5️⃣ Respond to sender
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= GET MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    return res.status(200).json(
      Array.isArray(conversation.messages)
        ? conversation.messages
        : []
    );
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
