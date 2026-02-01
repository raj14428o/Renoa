const messageService = require("../services/message");

exports.getConversations = async (req, res) => {
  try {
    const conversations = await messageService.getUserConversations(req.user._id);
    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

exports.clearUnread = async (req, res) => {
  try {
    await messageService.clearUnreadCount(req.user._id, req.body.roomId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.messagesPage = async (req, res) => {
  try {
    const data = await messageService.getMessagesPageData(req.user._id);
    res.render("messages", {
      ...data,
      roomId: null,
      chatUser: null
    });
  } catch (err) {
    res.redirect("/user/signin");
  }
};

exports.chatRoomPage = async (req, res) => {
  try {
    const data = await messageService.getChatRoomPageData(
      req.user._id,
      req.params.roomId
    );

    if (!data) return res.redirect("/messages");

    res.render("messages", data);
  } catch (err) {
    console.error(err);
    res.redirect("/messages");
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const users = await messageService.searchUsers(req.user._id, req.query.q);
    res.json({ users });
  } catch (err) {
    res.json({ users: [] });
  }
};

exports.getMessagesByRoom = async (req, res) => {
  try {
    const messages = await messageService.getMessagesByRoom(req.params.roomId);
    res.json(messages);
  } catch (err) {
    res.status(500).json([]);
  }
};
