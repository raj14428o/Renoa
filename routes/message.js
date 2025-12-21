const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const getRoomId = require("../utils/chatroom");
// Messages list page
router.get("/", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  const user = await User.findById(req.user._id)
    .populate("following", "_id fullName profileImageUrl")
    .lean();

  res.render("messages", {
    following: user.following, 
    user: req.user,
    roomId: null,   
    chatUser: null ,
  });
});


// Individual chat page
router.get("/room/:roomId", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  const { roomId } = req.params;

  const ids = roomId.split("_");
  if (ids.length !== 2) {
    return res.redirect("/messages");
  }

  const otherUserId =
    ids[0] === req.user._id.toString() ? ids[1] : ids[0];

  const otherUser = await User.findById(otherUserId)
    .select("_id fullName profileImageUrl isOnline lastSeen")
    .lean();

  if (!otherUser) return res.redirect("/messages");

  // reuse messages page → right pane chat
  const user = await User.findById(req.user._id)
    .populate("following", "_id fullName profileImageUrl")
    .lean();

  res.render("messages", {
    following: user.following,
    user: req.user,
    roomId,
    chatUser: otherUser
  });
});

//search users to message
router.get("/search", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ users: [] });
  }

  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    return res.json({ users: [] });
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    fullName: { $regex: q, $options: "i" }
  })
    .select("_id fullName profileImageUrl")
    .limit(10)
    .lean();

  res.json({ users });
});


module.exports = router;
