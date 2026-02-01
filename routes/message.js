const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/attachUser");
const messageController = require("../controllers/message");

// Conversations
router.get("/conversations", authMiddleware, messageController.getConversations);
router.post("/clear-unread", authMiddleware, messageController.clearUnread);

// Pages
router.get("/", authMiddleware, messageController.messagesPage);
router.get("/room/:roomId", authMiddleware, messageController.chatRoomPage);

// Search
router.get("/search", authMiddleware, messageController.searchUsers);

// Messages by room
router.get("/:roomId", authMiddleware, messageController.getMessagesByRoom);

module.exports = router;
