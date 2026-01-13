import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import User from "../models/user.model.js";
import { getUsersForSidebar } from "../controllers/user.controller.js";

const router = express.Router();

// sidebar users
router.get("/", protectRoute, getUsersForSidebar);

// ✅ ADD THIS
router.get("/:id/last-seen", protectRoute, async (req, res) => {
  const user = await User.findById(req.params.id).select("lastSeen");
  res.json({ lastSeen: user?.lastSeen });
});

export default router;
