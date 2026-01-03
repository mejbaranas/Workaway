const express = require("express");
const {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);
router.get("/conversation/:userId1/:userId2", getConversation);
router.get("/user/:userId", getUserConversations);
router.patch("/:messageId/read", markAsRead);

module.exports = router;
