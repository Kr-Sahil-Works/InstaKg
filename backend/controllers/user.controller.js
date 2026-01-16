import User from "../models/user.model.js";
import Message from "../models/message.model.js"; // ✅ ADDED — required for last message lookup

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .lean();

    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .select("createdAt")
          .lean();

        return {
          ...user,
          lastMessageAt: lastMessage?.createdAt || null,
        };
      })
    );

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.log(" Error in getUserForSidebar : ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
