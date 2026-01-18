import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io, getReceiverSocketIds } from "../socket/socket.js";

/* ================= HELPERS ================= */
const normalizeParticipants = (a, b) =>
  [a.toString(), b.toString()].sort();

const getConversation = async (senderId, receiverId) => {
  const participants = normalizeParticipants(senderId, receiverId);

  let conversation = await Conversation.findOne({ participants });

  if (!conversation) {
    conversation = await Conversation.create({
      participants,
      messages: [],
    });
  }

  return conversation;
};

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Empty message" });
    }

    const conversation = await getConversation(senderId, receiverId);

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      message: message.trim(),
      seen: false,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const payload = newMessage.toObject();

    process.nextTick(() => {
  [senderId, receiverId].forEach((uid) => {
    getReceiverSocketIds(uid.toString()).forEach((sid) =>
      io.to(sid).emit("newMessage", payload)
    );
  });
});


    getReceiverSocketIds(receiverId.toString()).forEach((sid) =>
      io.to(sid).emit("messageDelivered", {
        messageId: newMessage._id,
        senderId,
      })
    );

    res.status(201).json(payload);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ error: "Message send failed" });
  }
};

/* ================= GET MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const conversation = await getConversation(
      req.user._id,
      req.params.id
    );

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    res.status(500).json({ error: "Get messages failed" });
  }
};

/* ================= MARK MESSAGE SEEN ================= */
export const markMessageSeen = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.sendStatus(404);

    if (msg.receiverId.toString() !== req.user._id.toString()) {
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
    res.status(500).json({ error: "Mark seen failed" });
  }
};

/* ================= EDIT MESSAGE ================= */
export const editMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.sendStatus(404);

    if (msg.senderId.toString() !== req.user._id.toString()) {
      return res.sendStatus(403);
    }

    msg.message = req.body.message.trim();
    msg.edited = true;
    await msg.save();

    const payload = msg.toObject();

    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("messageEdited", payload)
      );
    });

    res.json(payload);
  } catch (err) {
    console.error("EDIT MESSAGE ERROR:", err);
    res.status(500).json({ error: "Edit failed" });
  }
};

/* ================= DELETE MESSAGE ================= */
export const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.sendStatus(404);

    if (msg.senderId.toString() !== req.user._id.toString()) {
      return res.sendStatus(403);
    }

    await Message.findByIdAndDelete(msg._id);

    await Conversation.findByIdAndUpdate(msg.conversationId, {
      $pull: { messages: msg._id },
    });

    [msg.senderId, msg.receiverId].forEach((uid) => {
      getReceiverSocketIds(uid.toString()).forEach((sid) =>
        io.to(sid).emit("messageDeleted", msg._id)
      );
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ================= TOGGLE REACTION ================= */
export const toggleReaction = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.sendStatus(404);

    const userId = req.user._id.toString();
    const existing = msg.reactions.find(
      (r) => r.userId.toString() === userId
    );

    if (existing) {
      if (existing.emoji === req.body.emoji) {
        msg.reactions = msg.reactions.filter(
          (r) => r.userId.toString() !== userId
        );
      } else {
        existing.emoji = req.body.emoji;
      }
    } else {
      msg.reactions.push({ userId, emoji: req.body.emoji });
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

/* ================= FORWARD MESSAGE ================= */
export const forwardMessage = async (req, res) => {
  try {
    const { receivers, text } = req.body;
    const senderId = req.user._id;

    if (!Array.isArray(receivers) || !text?.trim()) {
      return res.status(400).json({ error: "Invalid forward data" });
    }

    const results = [];

    for (const receiverId of receivers) {
      const conversation = await getConversation(senderId, receiverId);

      const msg = await Message.create({
        senderId,
        receiverId,
        conversationId: conversation._id,
        message: text.trim(),
        forwarded: true,
        seen: false,
      });

      conversation.messages.push(msg._id);
      await conversation.save();

      const payload = msg.toObject();
      results.push(payload);

      [senderId, receiverId].forEach((uid) => {
        getReceiverSocketIds(uid.toString()).forEach((sid) =>
          io.to(sid).emit("newMessage", payload)
        );
      });
    }

    res.status(201).json(results);
  } catch (err) {
    console.error("FORWARD ERROR:", err);
    res.status(500).json({ error: "Forward failed" });
  }
};
