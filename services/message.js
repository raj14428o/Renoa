const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.getUserConversations = async (userId) => {
  return Conversation.find({
    members: { $in: [new mongoose.Types.ObjectId(userId)] }
  })
    .sort({ lastMessageAt: -1 })
    .populate("members", "fullName profileImageUrl")
    .lean();
};

exports.clearUnreadCount = async (userId, roomId) => {
  return Conversation.updateOne(
    { roomId },
    { $set: { [`unreadCount.${userId}`]: 0 } }
  );
};

exports.getMessagesPageData = async (userId) => {
  const user = await User.findById(userId)
    .populate("following", "_id fullName profileImageUrl")
    .lean();

  return {
    following: user.following,
    user
  };
};

exports.getChatRoomPageData = async (userId, roomId) => {
  const ids = roomId.split("_");
  if (ids.length !== 2) return null;

  const otherUserId = ids[0] === userId.toString() ? ids[1] : ids[0];

  const otherUser = await User.findById(otherUserId)
    .select("_id fullName profileImageUrl isOnline lastSeen")
    .lean();

  if (!otherUser) return null;

  const user = await User.findById(userId)
    .populate("following", "_id fullName profileImageUrl")
    .lean();

  return {
    following: user.following,
    user,
    roomId,
    chatUser: otherUser
  };
};

exports.searchUsers = async (userId, q) => {
  if (!q || q.trim().length < 2) return [];

  return User.find({
    _id: { $ne: userId },
    fullName: { $regex: q.trim(), $options: "i" }
  })
    .select("_id fullName profileImageUrl")
    .limit(10)
    .lean();
};

exports.getMessagesByRoom = async (roomId) => {
  return Message.find({ roomId })
    .sort({ createdAt: 1 })
    .select("sender ciphertext nonce createdAt readAt");
};
