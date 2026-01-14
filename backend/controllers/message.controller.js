import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io, getReceiverSocketIds } from "../socket/socket.js";

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Empty message" });
    }

    const participants = [
      new mongoose.Types.ObjectId(senderId),
      new mongoose.Types.ObjectId(receiverId),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    let conversation = await Conversation.findOne({ participants });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      message: message.trim(),
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const payload = newMessage.toObject();

    [senderId, receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("newMessage", payload)
      );
    });

    res.status(201).json(payload);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= GET MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const userToChatId = req.params.id;

    const participants = [
      new mongoose.Types.ObjectId(senderId),
      new mongoose.Types.ObjectId(userToChatId),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    const conversation = await Conversation.findOne({ participants }).populate({
      path: "messages",
      options: { sort: { createdAt: 1 }, limit: 50 },
    });

    res.status(200).json(conversation?.messages || []);
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= MARK MESSAGE SEEN ================= */
export const markMessageSeen = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id.toString();

    const msg = await Message.findById(messageId);
    if (!msg) return res.sendStatus(404);

    if (msg.receiverId.toString() !== userId) {
      return res.sendStatus(403);
    }

    if (!msg.seen) {
      msg.seen = true;
      await msg.save();

      getReceiverSocketIds(msg.senderId.toString()).forEach((sid) =>
        io.to(sid).emit("messageSeen", msg._id)
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("MARK SEEN ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= EDIT MESSAGE ================= */
export const editMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const messageId = req.params.id;
    const userId = req.user._id.toString();

    if (!message?.trim()) {
      return res.status(400).json({ error: "Empty message" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) return res.sendStatus(404);

    if (msg.senderId.toString() !== userId) {
      return res.sendStatus(403);
    }

    msg.message = message.trim();
    msg.edited = true;
    await msg.save();

    const payload = msg.toObject();

    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("messageEdited", payload)
      );
    });

    res.status(200).json(payload);
  } catch (err) {
    console.error("EDIT MESSAGE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= DELETE MESSAGE ================= */
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id.toString();

    const msg = await Message.findById(messageId);
    if (!msg) return res.sendStatus(404);

    if (msg.senderId.toString() !== userId) {
      return res.sendStatus(403);
    }

    await Message.findByIdAndDelete(messageId);

    await Conversation.findByIdAndUpdate(msg.conversationId, {
      $pull: { messages: messageId },
    });

    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("messageDeleted", messageId)
      );
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= TOGGLE REACTION ================= */
export const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user._id.toString();

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.sendStatus(404);

    const existing = msg.reactions.find(
      (r) => r.userId.toString() === userId
    );

    if (existing) {
      if (existing.emoji === emoji) {
        msg.reactions = msg.reactions.filter(
          (r) => r.userId.toString() !== userId
        );
      } else {
        existing.emoji = emoji;
      }
    } else {
      msg.reactions.push({ userId, emoji });
    }

    await msg.save();
    const payload = msg.toObject();

    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("reactionUpdated", payload)
      );
    });

    res.json(payload);
  } catch (err) {
    console.error("REACTION ERROR:", err);
    res.status(500).json({ error: "Reaction failed" });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const { receivers } = req.body;
    const { messageId } = req.params;
    const senderId = req.user._id;

    if (!Array.isArray(receivers) || receivers.length === 0) {
      return res.status(400).json({ message: "No receivers provided" });
    }

    const original = await Message.findById(messageId);
    if (!original) {
      return res.status(404).json({ message: "Message not found" });
    }

    const results = [];

    for (const receiverId of receivers) {
      const participants = [
        senderId.toString(),
        receiverId.toString(),
      ].sort();

      const conversation = await Conversation.findOneAndUpdate(
        { participants },
        { $setOnInsert: { participants, messages: [] } },
        { new: true, upsert: true }
      );

      const newMessage = await Message.create({
        senderId,
        receiverId,
        conversationId: conversation._id,
        message: original.message,
        forwarded: true,
      });

      conversation.messages.push(newMessage._id);
      await conversation.save();

      const payload = newMessage.toObject();
      results.push(payload);

      // notify both users
      [senderId, receiverId].forEach(uid => {
        getReceiverSocketIds(uid.toString()).forEach(sid =>
          io.to(sid).emit("newMessage", payload)
        );
      });
    }

    res.status(200).json({ success: true, messages: results });
  } catch (err) {
    console.error("FORWARD ERROR:", err);
    res.status(500).json({ message: "Forward failed" });
  }
};
