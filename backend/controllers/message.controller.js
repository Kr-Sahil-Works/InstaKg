import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io, getReceiverSocketIds } from "../socket/socket.js";
import mongoose from "mongoose";

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
      conversationId: conversation._id, // ✅ FIX
      message: message.trim(),
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const payload = newMessage.toObject();

    getReceiverSocketIds(receiverId.toString()).forEach((sid) =>
      io.to(sid).emit("newMessage", payload)
    );

    getReceiverSocketIds(senderId.toString()).forEach((sid) =>
      io.to(sid).emit("newMessage", payload)
    );

    res.status(201).json(payload);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
/* ================= GET MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const userToChatId = req.params.id;

    // ✅ ObjectId-safe participants
    const participants = [
      new mongoose.Types.ObjectId(senderId),
      new mongoose.Types.ObjectId(userToChatId),
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    const conversation = await Conversation.findOne({ participants })
      .populate({
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

    // only receiver can mark seen
    if (msg.receiverId.toString() !== userId) {
      return res.sendStatus(403);
    }

    if (!msg.seen) {
      msg.seen = true;
      await msg.save();

      // notify sender
      getReceiverSocketIds(msg.senderId.toString()).forEach((sid) =>
        io.to(sid).emit("messageSeen", msg._id)
      );
    }

    res.sendStatus(200);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ================= EDIT MESSAGE ================= */
export const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { message } = req.body;
    const userId = req.user._id.toString();

    const msg = await Message.findById(messageId);
    if (!msg) return res.sendStatus(404);

    // only sender can edit
    if (msg.senderId.toString() !== userId) {
      return res.sendStatus(403);
    }

    msg.message = message.trim();
    msg.edited = true;
    await msg.save();

    const payload = msg.toObject();

    // notify both users
    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("messageEdited", payload)
      );
    });

    res.status(200).json(payload);
  } catch {
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

    // only sender can delete
    if (msg.senderId.toString() !== userId) {
      return res.sendStatus(403);
    }

    await Message.findByIdAndDelete(messageId);

    // remove from conversation
    await Conversation.findByIdAndUpdate(msg.conversationId, {
      $pull: { messages: messageId },
    });

    // notify both users
    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("messageDeleted", messageId)
      );
    });

    res.sendStatus(200);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
