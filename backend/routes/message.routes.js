import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  sendMessage,
  getMessages,
  markMessageSeen,
  editMessage,
  deleteMessage,
  toggleReaction,
  forwardMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

/* ================= MESSAGES ================= */
router.get("/:id", protectRoute, getMessages);
router.post("/:id", protectRoute, sendMessage);

/* ================= MESSAGE ACTIONS ================= */
router.put("/seen/:id", protectRoute, markMessageSeen);
router.put("/edit/:id", protectRoute, editMessage);
router.delete("/delete/:id", protectRoute, deleteMessage);

/* ================= REACTIONS ================= */
router.put("/react/:id", protectRoute, toggleReaction);

/* ================= FORWARD (🔥 FIXED PARAM NAME) ================= */
router.post("/forward/:messageId", protectRoute, forwardMessage);

export default router;
