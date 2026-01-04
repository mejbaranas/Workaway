const express = require("express");
const {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  getUnreadCount,
  markConversationAsRead
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);
router.get("/conversation/:userId1/:userId2", getConversation);
router.get("/user/:userId", getUserConversations);
router.get("/unread/:userId", getUnreadCount);
router.patch("/:messageId/read", markAsRead);
router.patch("/conversation/:senderId/:receiverId/read", markConversationAsRead);

module.exports = router;
