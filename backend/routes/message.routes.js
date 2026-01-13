import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  sendMessage,
  getMessages,
  markMessageSeen,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/:id", protectRoute, sendMessage);

router.put("/seen/:id", protectRoute, markMessageSeen);
router.put("/edit/:id", protectRoute, editMessage);
router.delete("/delete/:id", protectRoute, deleteMessage);

export default router;
