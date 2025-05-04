// controllers/chatController.js
import Chats from "../models/chats.js";

/**
 * Get chat messages between two users.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getChatsBetweenUsers = async (req, res) => {
  try {
    const { fromId, toId } = req.params;

    if (!fromId || !toId) {
      return res.status(400).json({ message: "Both fromId and toId are required." });
    }

    const messages = await Chats.find({
      $or: [
        { from: fromId, to: toId },
        { from: toId, to: fromId },
      ],
    }).sort({ createdAt: 1 }); // Sort by oldest to newest

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
